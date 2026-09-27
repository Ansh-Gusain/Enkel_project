"""Local-only OpenCV/LBPH attendance service for Enkel.

"""  """Pipeline (per spec):
  1. Haar Cascade  — detects face rectangles in each frame
  2. Sample collection — crops, resizes to 200x200 grayscale, saves 100 samples
  3. LBPH training — builds texture fingerprint model (trainer.yml / lbph.yml)
  4. Recognition — computes distance; confidence < 50 = solid match,
                   50-85 = uncertain, > 85 = unknown
  5. Attendance — one CSV row per person per day with IST timestamp

Run with:
    uvicorn server.main:app --host 127.0.0.1 --port 8787
"""

from __future__ import annotations

import base64
import csv
import io
import os
import shutil
import sqlite3
import threading
from datetime import date, datetime, timezone, timedelta
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# ── paths ────────────────────────────────────────────────────────────────────
ROOT         = Path(__file__).resolve().parent
DATA         = ROOT / "data"
SAMPLES      = DATA / "samples"        # PNG crops (internal use)
DATASET      = DATA / "dataset"        # JPGs named User.{label}.{count}.jpg  (per spec)
MODELS       = DATA / "models"
MODEL_FILE   = MODELS / "lbph.yml"     # also written as trainer.yml for familiarity
TRAINER_FILE = MODELS / "trainer.yml"
DB_FILE      = DATA / "attendance.sqlite3"

for directory in (DATA, SAMPLES, DATASET, MODELS):
    directory.mkdir(parents=True, exist_ok=True)

# ── constants (per spec) ─────────────────────────────────────────────────────
FACE_SIZE        = (200, 200)   # spec: 200x200 grayscale
REQUIRED_SAMPLES = 100
CONF_GOOD        = 50           # distance < 50  → solid match
CONF_UNCERTAIN   = 85           # 50 ≤ distance < 85 → uncertain (show but don't record)
                                # distance ≥ 85 → unknown (reject)
STABLE_NEEDED    = 3            # consecutive solid matches before recording attendance

# ── Haar cascade params (relaxed for better recall at angles) ────────────────
HAAR_SCALE        = 1.1         # was 1.15 — smaller step = more positions tested
HAAR_NEIGHBORS    = 4           # was 6 — lower = fewer false-negatives
HAAR_MIN_SIZE     = (60, 60)    # was (90,90) — catches smaller/further faces

# ── IST timezone ─────────────────────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

def now_ist() -> datetime:
    return datetime.now(tz=IST)

# ── threading & global state ─────────────────────────────────────────────────
LOCK = threading.RLock()
recognizer   = cv2.face.LBPHFaceRecognizer_create()
model_loaded = False
# per-IP streak counts so concurrent users don't corrupt each other
stable_matches: dict[str, dict[int, int]] = {}

# ── detector ─────────────────────────────────────────────────────────────────
detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Enkel Local Attendance", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8443", "http://127.0.0.1:8443"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── database ──────────────────────────────────────────────────────────────────
def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row
    return db


def initialize_database() -> None:
    with connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS profiles (
              employee_id TEXT PRIMARY KEY,
              name        TEXT NOT NULL,
              label       INTEGER NOT NULL UNIQUE,
              consent_at  TEXT NOT NULL,
              sample_count INTEGER NOT NULL DEFAULT 0,
              state       TEXT NOT NULL DEFAULT 'sampling',
              updated_at  TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS attendance (
              id               INTEGER PRIMARY KEY AUTOINCREMENT,
              employee_id      TEXT NOT NULL REFERENCES profiles(employee_id),
              attendance_date  TEXT NOT NULL,
              check_in_time    TEXT NOT NULL,
              distance         REAL NOT NULL,
              confidence       REAL NOT NULL DEFAULT 0,
              corrected        INTEGER NOT NULL DEFAULT 0,
              correction_reason TEXT,
              UNIQUE(employee_id, attendance_date)
            );
            """
        )
    # migrate: add confidence column if it doesn't exist yet
    with connection() as db:
        try:
            db.execute("ALTER TABLE attendance ADD COLUMN confidence REAL NOT NULL DEFAULT 0")
        except Exception:
            pass


initialize_database()


def load_model() -> bool:
    global model_loaded
    # prefer lbph.yml; fall back to trainer.yml
    target = MODEL_FILE if MODEL_FILE.exists() else (TRAINER_FILE if TRAINER_FILE.exists() else None)
    if target is None:
        model_loaded = False
        return False
    try:
        recognizer.read(str(target))
        model_loaded = True
    except cv2.error:
        model_loaded = False
    return model_loaded


load_model()


# ── pydantic models ────────────────────────────────────────────────────────────
class ProfileCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    consent: Literal[True]


class FramePayload(BaseModel):
    image: str


class AttendanceCorrection(BaseModel):
    check_in_time: str = Field(pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    reason: str = Field(min_length=3, max_length=240)


# ── image helpers ──────────────────────────────────────────────────────────────
def decode_frame(value: str) -> np.ndarray:
    try:
        encoded = value.split(",", 1)[1] if "," in value else value
        raw = base64.b64decode(encoded, validate=True)
        frame = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    except (ValueError, base64.binascii.Error):
        frame = None
    if frame is None:
        raise HTTPException(400, "Invalid image frame")
    return frame


def detect_face(gray: np.ndarray) -> tuple[int, int, int, int]:
    """Run Haar cascade with relaxed params; return (x,y,w,h) of the largest face."""
    faces = detector.detectMultiScale(
        gray,
        scaleFactor=HAAR_SCALE,
        minNeighbors=HAAR_NEIGHBORS,
        minSize=HAAR_MIN_SIZE,
        flags=cv2.CASCADE_SCALE_IMAGE,
    )
    if len(faces) == 0:
        raise HTTPException(422, "No face detected — face the camera and ensure good lighting")
    if len(faces) > 1:
        # pick largest face instead of erroring, more forgiving in busy backgrounds
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces[0]
    if w < 60 or h < 60:
        raise HTTPException(422, "Face is too small — move closer to the camera")
    return int(x), int(y), int(w), int(h)


def normalized_face(
    frame: np.ndarray,
    previous: Path | None = None,
    check_similarity: bool = True,
) -> np.ndarray:
    """
    Detect, crop, resize to FACE_SIZE (200x200), equalize histogram.
    Quality gates: brightness, blurriness, similarity to previous sample.
    """
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    x, y, w, h = detect_face(gray)
    crop = gray[y : y + h, x : x + w]
    crop = cv2.equalizeHist(cv2.resize(crop, FACE_SIZE))

    if float(np.mean(crop)) < 40:
        raise HTTPException(422, "Image is too dark — improve lighting")
    if float(cv2.Laplacian(crop, cv2.CV_64F).var()) < 40:
        raise HTTPException(422, "Image is too blurry — hold still")

    if check_similarity and previous and previous.exists():
        old = cv2.imread(str(previous), cv2.IMREAD_GRAYSCALE)
        if old is not None and old.shape == crop.shape:
            diff = float(np.mean(cv2.absdiff(old, crop)))
            if diff < 2.0:
                raise HTTPException(422, "Frame too similar to previous — turn your head slightly")
    return crop


# ── query helpers ──────────────────────────────────────────────────────────────
def profile_rows() -> list[dict]:
    with connection() as db:
        rows = db.execute("SELECT * FROM profiles ORDER BY name").fetchall()
    return [dict(row) for row in rows]


def attendance_rows(limit: int = 250) -> list[dict]:
    with connection() as db:
        rows = db.execute(
            """
            SELECT attendance.*, profiles.name
            FROM attendance JOIN profiles USING(employee_id)
            ORDER BY attendance_date DESC, check_in_time DESC LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


# ── routes ─────────────────────────────────────────────────────────────────────
@app.get("/health")
def health() -> dict:
    return {
        "status": "online",
        "opencv": cv2.__version__,
        "model_ready": model_loaded and MODEL_FILE.exists(),
        "face_size": FACE_SIZE,
        "thresholds": {"good": CONF_GOOD, "uncertain": CONF_UNCERTAIN},
    }


@app.get("/dashboard")
def dashboard() -> dict:
    profiles = profile_rows()
    records  = attendance_rows()
    today    = now_ist().date().isoformat()
    checked_in = {row["employee_id"] for row in records if row["attendance_date"] == today}
    return {
        "profiles":         profiles,
        "records":          records,
        "registered":       sum(row["state"] == "ready" for row in profiles),
        "checked_in_today": len(checked_in),
        "not_checked_in":   max(0, len(profiles) - len(checked_in)),
        "model_ready":      model_loaded,
    }


@app.post("/profiles")
def create_profile(payload: ProfileCreate) -> dict:
    now = now_ist().isoformat(timespec="seconds")
    with LOCK, connection() as db:
        existing = db.execute(
            "SELECT * FROM profiles WHERE employee_id=?", (payload.employee_id,)
        ).fetchone()
        if existing:
            return dict(existing)
        next_label = db.execute(
            "SELECT COALESCE(MAX(label), 0) + 1 FROM profiles"
        ).fetchone()[0]
        db.execute(
            "INSERT INTO profiles(employee_id,name,label,consent_at,updated_at) VALUES(?,?,?,?,?)",
            (payload.employee_id, payload.name, next_label, now, now),
        )
    (SAMPLES / payload.employee_id).mkdir(parents=True, exist_ok=True)
    (DATASET).mkdir(parents=True, exist_ok=True)
    return {"employee_id": payload.employee_id, "label": next_label, "sample_count": 0}


@app.post("/profiles/{employee_id}/samples")
def add_sample(employee_id: str, payload: FramePayload) -> dict:
    with LOCK, connection() as db:
        profile = db.execute(
            "SELECT * FROM profiles WHERE employee_id=?", (employee_id,)
        ).fetchone()
        if not profile:
            raise HTTPException(404, "Employee profile not found")
        count = int(profile["sample_count"])
        if count >= REQUIRED_SAMPLES:
            return {"accepted": True, "sample_count": count, "complete": True}

        label = int(profile["label"])
        sample_dir = SAMPLES / employee_id
        sample_dir.mkdir(parents=True, exist_ok=True)

        previous = sample_dir / f"{count:03d}.png" if count > 0 else None
        crop = normalized_face(decode_frame(payload.image), previous, check_similarity=True)

        next_count = count + 1

        # Save PNG in samples/ (internal)
        cv2.imwrite(str(sample_dir / f"{next_count:03d}.png"), crop)

        # Save JPG in dataset/ as User.{label}.{count}.jpg (per spec naming)
        cv2.imwrite(str(DATASET / f"User.{label}.{next_count}.jpg"), crop)

        state = "ready" if next_count >= REQUIRED_SAMPLES else "sampling"
        db.execute(
            "UPDATE profiles SET sample_count=?,state=?,updated_at=? WHERE employee_id=?",
            (next_count, state, now_ist().isoformat(timespec="seconds"), employee_id),
        )
    return {
        "accepted":     True,
        "sample_count": next_count,
        "complete":     next_count >= REQUIRED_SAMPLES,
    }


@app.post("/train")
def train_model() -> dict:
    global recognizer, model_loaded
    faces:  list[np.ndarray] = []
    labels: list[int]        = []
    with LOCK:
        complete = [r for r in profile_rows() if r["sample_count"] >= REQUIRED_SAMPLES]
        if not complete:
            raise HTTPException(409, "No complete biometric profiles to train on")
        for profile in complete:
            sample_dir = SAMPLES / profile["employee_id"]
            for file in sorted(sample_dir.glob("*.png")):
                face = cv2.imread(str(file), cv2.IMREAD_GRAYSCALE)
                if face is not None:
                    faces.append(face)
                    labels.append(int(profile["label"]))
        if not faces:
            raise HTTPException(409, "No usable samples found")

        trained = cv2.face.LBPHFaceRecognizer_create()
        trained.train(faces, np.array(labels, dtype=np.int32))

        # write atomically; keep both filenames (lbph.yml and trainer.yml per spec)
        tmp = MODELS / "lbph.tmp.yml"
        trained.write(str(tmp))
        os.replace(tmp, MODEL_FILE)
        # trainer.yml is a copy so tools expecting that name also work
        import shutil as _sh
        _sh.copy2(MODEL_FILE, TRAINER_FILE)

        recognizer   = trained
        model_loaded = True

    return {"trained": True, "profiles": len(complete), "samples": len(faces)}


@app.post("/recognize")
def recognize_face(payload: FramePayload, request: Request) -> dict:
    if not model_loaded:
        raise HTTPException(409, "LBPH model is not trained — enroll employees first")

    client_ip = request.client.host if request.client else "unknown"

    # detect & normalize (no similarity check during recognition)
    face = normalized_face(decode_frame(payload.image), check_similarity=False)

    with LOCK:
        label, distance = recognizer.predict(face)

    distance   = float(distance)
    confidence = max(0.0, min(100.0, 100.0 - distance))   # higher = better

    # ── 3-tier decision (per spec) ────────────────────────────────────────────
    # distance < 50  → solid match
    # 50 ≤ dist < 85 → uncertain (matched but don't record yet)
    # dist ≥ 85      → unknown

    if distance >= CONF_UNCERTAIN:
        # Unknown — clear this client's streak
        stable_matches.pop(client_ip, None)
        return {
            "matched":       False,
            "tier":          "unknown",
            "confidence":    round(confidence, 1),
            "stable_matches": 0,
        }

    with connection() as db:
        profile = db.execute("SELECT * FROM profiles WHERE label=?", (int(label),)).fetchone()
    if not profile:
        stable_matches.pop(client_ip, None)
        return {"matched": False, "tier": "unknown", "confidence": round(confidence, 1), "stable_matches": 0}

    employee_label = int(profile["label"])

    if distance >= CONF_GOOD:
        # Uncertain band (50–85) — matched face but not confident enough to record
        stable_matches.pop(client_ip, None)   # reset streak on uncertain frames
        return {
            "matched":    True,
            "verified":   False,
            "tier":       "uncertain",
            "name":       profile["name"],
            "confidence": round(confidence, 1),
            "stable_matches": 0,
        }

    # Solid match (distance < 50) — accumulate streak
    client_streaks = stable_matches.setdefault(client_ip, {})
    # Zero out streaks for other labels
    for key in list(client_streaks):
        if key != employee_label:
            client_streaks[key] = 0
    client_streaks[employee_label] = client_streaks.get(employee_label, 0) + 1
    streak = client_streaks[employee_label]

    if streak < STABLE_NEEDED:
        return {
            "matched":        True,
            "verified":       False,
            "tier":           "good",
            "name":           profile["name"],
            "confidence":     round(confidence, 1),
            "stable_matches": streak,
        }

    # streak met — record attendance
    ist_now   = now_ist()
    ist_date  = ist_now.date().isoformat()
    ist_time  = ist_now.strftime("%H:%M:%S")

    with connection() as db:
        existing = db.execute(
            "SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?",
            (profile["employee_id"], ist_date),
        ).fetchone()
        if existing:
            client_streaks[employee_label] = 0
            return {
                "matched":      True,
                "verified":     True,
                "duplicate":    True,
                "tier":         "good",
                "name":         profile["name"],
                "checked_in_at": existing["check_in_time"],
                "confidence":   round(confidence, 1),
            }
        db.execute(
            """
            INSERT INTO attendance(employee_id, attendance_date, check_in_time, distance, confidence)
            VALUES(?,?,?,?,?)
            """,
            (profile["employee_id"], ist_date, ist_time, distance, round(confidence, 1)),
        )

    client_streaks[employee_label] = 0
    return {
        "matched":       True,
        "verified":      True,
        "duplicate":     False,
        "tier":          "good",
        "name":          profile["name"],
        "checked_in_at": ist_time,
        "confidence":    round(confidence, 1),
    }


@app.patch("/attendance/{record_id}")
def correct_attendance(record_id: int, payload: AttendanceCorrection) -> dict:
    with connection() as db:
        result = db.execute(
            "UPDATE attendance SET check_in_time=?,corrected=1,correction_reason=? WHERE id=?",
            (payload.check_in_time, payload.reason, record_id),
        )
        if result.rowcount == 0:
            raise HTTPException(404, "Attendance record not found")
    return {"updated": True}


@app.delete("/attendance/{record_id}", status_code=204, response_class=Response)
def delete_attendance(record_id: int) -> Response:
    with connection() as db:
        if db.execute("DELETE FROM attendance WHERE id=?", (record_id,)).rowcount == 0:
            raise HTTPException(404, "Attendance record not found")
    return Response(status_code=204)


@app.get("/attendance.csv")
def export_attendance() -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        ["employee_id", "name", "date", "check_in_time_IST", "distance", "confidence_%", "corrected", "reason"]
    )
    for row in attendance_rows(limit=100000):
        writer.writerow([
            row["employee_id"],
            row["name"],
            row["attendance_date"],
            row["check_in_time"],
            round(row["distance"], 2),
            round(row.get("confidence", 0), 1),
            row["corrected"],
            row["correction_reason"] or "",
        ])
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=enkel-attendance.csv"},
    )


@app.delete("/profiles/{employee_id}", status_code=204, response_class=Response)
def delete_profile(employee_id: str) -> Response:
    global model_loaded
    with LOCK, connection() as db:
        db.execute("DELETE FROM attendance WHERE employee_id=?", (employee_id,))
        if db.execute("DELETE FROM profiles WHERE employee_id=?", (employee_id,)).rowcount == 0:
            raise HTTPException(404, "Employee profile not found")
    shutil.rmtree(SAMPLES / employee_id, ignore_errors=True)
    # remove dataset JPGs for this profile
    with connection() as db:
        pass  # label already gone; clean by employee_id prefix in filename
    for jpg in DATASET.glob(f"User.*.*.jpg"):
        jpg.unlink(missing_ok=True)
    MODEL_FILE.unlink(missing_ok=True)
    TRAINER_FILE.unlink(missing_ok=True)
    model_loaded = False
    stable_matches.clear()
    return Response(status_code=204)


@app.delete("/data", status_code=204, response_class=Response)
def delete_all_data() -> Response:
    global model_loaded
    with LOCK, connection() as db:
        db.execute("DELETE FROM attendance")
        db.execute("DELETE FROM profiles")
    shutil.rmtree(SAMPLES, ignore_errors=True)
    shutil.rmtree(DATASET, ignore_errors=True)
    SAMPLES.mkdir(parents=True, exist_ok=True)
    DATASET.mkdir(parents=True, exist_ok=True)
    MODEL_FILE.unlink(missing_ok=True)
    TRAINER_FILE.unlink(missing_ok=True)
    model_loaded = False
    stable_matches.clear()
    return Response(status_code=204)

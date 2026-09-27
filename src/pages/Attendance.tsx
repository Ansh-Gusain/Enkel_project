// ─────────────────────────────────────────────────────────────
// Attendance.tsx — face-registration + LBPH recognition
//
// Tabs:
//   Overview       — metrics, employee list, attendance history
//   Enroll         — capture 100 face samples & train model
//   Recognize      — run recognition loop and mark attendance
//   Attendance Sheet — date-picker calendar view of records
//
// The backend (FastAPI on port 8787) must be running locally.
// All biometric data stays on the local machine.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Metric, PageHeader, Tabs } from "../components/ui";
import { AttendanceDashboard, AttendanceRow, RecogState } from "../types";

// Local FastAPI service URL
const API = "http://127.0.0.1:8787";

// The four employees that can be enrolled
const EMPLOYEES = [
  { id: "emp-ananya", name: "Ananya Desai" },
  { id: "emp-karan",  name: "Karan Mehta"  },
  { id: "emp-priya",  name: "Priya Nair"   },
  { id: "emp-arjun",  name: "Arjun Mehta"  },
];

// ── Attendance Sheet sub-component ───────────────────────────
function AttendanceSheet({
  records,
  today,
  onExport,
}: {
  records: AttendanceRow[];
  today: string;
  onExport: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState(today);

  // Unique dates that have at least one record (for quick-select pills)
  const datesWithRecords = Array.from(new Set(records.map((r) => r.attendance_date))).sort().reverse();
  const dayRecords       = records.filter((r) => r.attendance_date === selectedDate);

  // Build employee list from all historical records
  const allEmployees  = Array.from(new Map(records.map((r) => [r.employee_id, r.name])).entries());
  const checkedInIds  = new Set(dayRecords.map((r) => r.employee_id));
  const absentList    = allEmployees.filter(([id]) => !checkedInIds.has(id));

  const formattedDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div>
      {/* Toolbar: date picker + export */}
      <div className="toolbar" style={{ marginTop: 20 }}>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            height: 40, padding: "0 12px", border: "1px solid var(--line)",
            borderRadius: 8, background: "var(--paper)", fontSize: 13,
            fontFamily: "inherit", color: "var(--ink)", outline: "none", cursor: "pointer",
          }}
        />
        <Button variant="secondary" onClick={onExport}>Export CSV</Button>
      </div>

      {/* Quick-select pills for days that have records */}
      {datesWithRecords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
          {datesWithRecords.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              style={{
                padding: "5px 12px", borderRadius: 99, fontSize: 11, border: "1px solid",
                borderColor: selectedDate === d ? "var(--teal)" : "var(--line)",
                background:  selectedDate === d ? "var(--teal-soft)" : "var(--paper)",
                color:       selectedDate === d ? "var(--teal)" : "var(--muted)",
                fontWeight:  selectedDate === d ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </button>
          ))}
        </div>
      )}

      {/* Summary metrics for the selected day */}
      <div className="metrics metrics-3" style={{ marginBottom: 24 }}>
        <Metric value={String(dayRecords.length)} label="Present" tone="green" />
        <Metric value={String(absentList.length)}  label="Absent"  tone={absentList.length > 0 ? "orange" : ""} />
        <Metric value={String(allEmployees.length)} label="Total enrolled" />
      </div>

      {/* Heading with record count */}
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>
          {formattedDate}
          <span className="count">{dayRecords.length}</span>
        </h2>
      </div>

      {/* Present table */}
      {dayRecords.length === 0 ? (
        <div className="panel">
          <div className="empty-row">No attendance recorded for this date.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>EMPLOYEE</th>
                <th>CHECK-IN (IST)</th>
                <th>CONFIDENCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {dayRecords.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="person">
                      <span className="avatar">{rec.name.split(" ").map((p: string) => p[0]).join("")}</span>
                      <span><strong>{rec.name}</strong></span>
                    </div>
                  </td>
                  <td><strong>{rec.check_in_time.slice(0, 5)}</strong></td>
                  <td>{Math.max(0, Math.round(100 - rec.distance))}%</td>
                  <td>
                    <span className={`status ${rec.corrected ? "status-warn" : "status-good"}`}>
                      {rec.corrected ? "Corrected" : "Present"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Absent table */}
      {absentList.length > 0 && (
        <>
          <h2 style={{ marginTop: 28 }}>Absent <span className="count">{absentList.length}</span></h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>EMPLOYEE</th><th>STATUS</th></tr></thead>
              <tbody>
                {absentList.map(([id, name]) => (
                  <tr key={id}>
                    <td>
                      <div className="person">
                        <span className="avatar">{name.split(" ").map((p: string) => p[0]).join("")}</span>
                        <span><strong>{name}</strong></span>
                      </div>
                    </td>
                    <td><span className="status status-danger">Absent</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Attendance component ─────────────────────────────────
export default function Attendance() {
  type AttMode = "Overview" | "Enroll" | "Recognize" | "Attendance Sheet";

  const [mode,          setMode]          = useState<AttMode>("Overview");
  const [camera,        setCamera]        = useState(false);
  const [employee,      setEmployee]      = useState("emp-ananya");
  const [consent,       setConsent]       = useState(false);
  const [samples,       setSamples]       = useState(0);
  const [capturing,     setCapturing]     = useState(false);
  const [recognizing,   setRecognizing]   = useState(false);
  const [enrollDone,    setEnrollDone]    = useState(false);
  const [serviceOnline, setServiceOnline] = useState(false);
  const [message,       setMessage]       = useState("Connect the local attendance service to begin.");
  const [dashboard,     setDashboard]     = useState<AttendanceDashboard>({
    profiles: [], records: [], registered: 0,
    checked_in_today: 0, not_checked_in: 0, model_ready: false,
  });

  // Live recognition UI state (confidence bar, streak dots, result card)
  const [recogResult, setRecogResult] = useState<RecogState>({
    tier: null, name: "", confidence: 0, streak: 0,
    checkedIn: false, checkedInAt: "", duplicate: false,
  });

  const video       = useRef<HTMLVideoElement>(null);
  const stream      = useRef<MediaStream | null>(null);
  const recognizeRef = useRef(false); // controls the recognition while-loop

  const selectedEmployee = EMPLOYEES.find((e) => e.id === employee) ?? EMPLOYEES[0];

  // Reset per-employee state when the dropdown changes
  useEffect(() => {
    setSamples(0);
    setConsent(false);
    setEnrollDone(false);
  }, [employee]);

  // ── Ping the backend every 10 s ──────────────────────────────
  const refresh = async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      if (!res.ok) throw new Error();
      setDashboard(await res.json() as AttendanceDashboard);
      setServiceOnline(true);
      setMessage("Local service connected. Biometric data stays on this machine.");
    } catch {
      setServiceOnline(false);
      setMessage("Local service is offline. Start the FastAPI service on port 8787.");
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => window.clearInterval(timer);
  }, []);

  // Attach webcam stream to the <video> element once camera state is true
  useEffect(() => {
    if (camera && video.current && stream.current) {
      video.current.srcObject = stream.current;
    }
  }, [camera]);

  // Stop all tracks on component unmount
  useEffect(() => () => { stream.current?.getTracks().forEach((t) => t.stop()); }, []);

  // ── Camera helpers ────────────────────────────────────────────
  const stopCamera = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera(false);
    setRecognizing(false);
    setCapturing(false);
    recognizeRef.current = false;
    if (video.current) video.current.srcObject = null;
  };

  const startCamera = async () => {
    if (stream.current) return; // already running
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      setCamera(true);
    } catch {
      setMessage("Camera access was blocked. Allow camera permission and try again.");
    }
  };

  // Grab a JPEG frame from the live video element
  const frame = (): string | null => {
    const v = video.current;
    if (!v || v.videoWidth === 0 || v.readyState < 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width  = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.86);
  };

  // ── Typed fetch wrapper ───────────────────────────────────────
  const apiFetch = async (url: string, options?: RequestInit) => {
    const res  = await fetch(`${API}${url}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
    const body = res.status === 204 ? {} : await res.json();
    if (!res.ok) throw new Error(body.detail ?? "The local service rejected this request.");
    return body;
  };

  // ── Delete a biometric profile ────────────────────────────────
  const deleteProfile = async (empId: string, name: string) => {
    if (!window.confirm(`Delete all biometric data for ${name}? This cannot be undone.`)) return;
    try {
      await fetch(`${API}/profiles/${empId}`, { method: "DELETE" });
      await refresh();
      setMessage(`Biometric data for ${name} deleted.`);
    } catch {
      setMessage("Failed to delete profile. Check the service is running.");
    }
  };

  // ── Enrollment: auto-opens camera, captures 100 samples, trains ──
  const beginCapture = async () => {
    if (!consent || !serviceOnline) return;

    // Auto-open camera if not already on
    if (!stream.current) {
      await startCamera();
      await new Promise((r) => window.setTimeout(r, 2000)); // wait for feed
    }

    setCapturing(true);
    setEnrollDone(false);
    setSamples(0);

    try {
      // Create (or return existing) profile on the server
      await apiFetch("/profiles", {
        method: "POST",
        body: JSON.stringify({ employee_id: employee, name: selectedEmployee.name, consent: true }),
      });

      let accepted = 0;
      while (accepted < 100) {
        const img = frame();
        if (!img) {
          setMessage("Waiting for camera to be ready…");
          await new Promise((r) => window.setTimeout(r, 200));
          continue;
        }
        try {
          const result = await apiFetch(`/profiles/${employee}/samples`, {
            method: "POST",
            body: JSON.stringify({ image: img }),
          }) as { sample_count: number };
          accepted = result.sample_count;
          setSamples(accepted);
          setMessage(`Accepted sample ${accepted} of 100. Slowly turn your head left and right.`);
        } catch (err) {
          setMessage(err instanceof Error ? err.message : "Frame rejected — adjust lighting or position.");
        }
        await new Promise((r) => window.setTimeout(r, 170));
      }

      setMessage("100 samples captured. Training the LBPH model…");
      await apiFetch("/train", { method: "POST" });
      setEnrollDone(true);
      setMessage(`Training complete. ${selectedEmployee.name} is ready for recognition.`);
      await refresh();
      stopCamera(); // auto-off when done

    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Enrollment failed.");
    } finally {
      setCapturing(false);
    }
  };

  // ── Recognition: auto-opens camera, loops until verified ─────
  const startRecognize = async () => {
    if (!dashboard.model_ready || recognizeRef.current) return;

    // Auto-open camera
    if (!stream.current) {
      await startCamera();
      await new Promise((r) => window.setTimeout(r, 2000));
    }

    recognizeRef.current = true;
    setRecognizing(true);
    setRecogResult({ tier: null, name: "", confidence: 0, streak: 0, checkedIn: false, checkedInAt: "", duplicate: false });

    try {
      while (recognizeRef.current) {
        const img = frame();
        if (!img) {
          await new Promise((r) => window.setTimeout(r, 200));
          continue;
        }

        let result: {
          matched: boolean; verified?: boolean; duplicate?: boolean;
          tier?: string; name?: string; checked_in_at?: string;
          stable_matches?: number; confidence?: number;
        };

        try {
          result = await apiFetch("/recognize", { method: "POST", body: JSON.stringify({ image: img }) });
        } catch (err) {
          // 422 from server = face quality issue (blurry, dark, no face)
          setMessage(err instanceof Error ? err.message : "Frame rejected");
          await new Promise((r) => window.setTimeout(r, 300));
          continue;
        }

        const conf   = result.confidence ?? 0;
        const tier   = (result.tier ?? (result.matched ? "good" : "unknown")) as RecogState["tier"];
        const streak = result.stable_matches ?? 0;
        const name   = result.name ?? "";

        if (!result.matched) {
          // Unknown — distance above threshold
          setRecogResult((s) => ({ ...s, tier: "unknown", confidence: conf, streak: 0, name: "" }));
          setMessage("Unknown — face the camera and ensure good lighting.");

        } else if (!result.verified) {
          // Matched but not enough consecutive matches yet
          if (tier === "uncertain") {
            setRecogResult((s) => ({ ...s, tier: "uncertain", confidence: conf, streak: 0, name }));
            setMessage(`Uncertain match (${conf.toFixed(1)}%) — hold still and improve lighting.`);
          } else {
            setRecogResult((s) => ({ ...s, tier: "good", confidence: conf, streak, name }));
            setMessage(`Verifying ${name} — ${streak}/3 stable matches · ${conf.toFixed(1)}%`);
          }

        } else {
          // Verified — attendance recorded or duplicate
          const checkedInAt = result.checked_in_at ?? "";
          const duplicate   = result.duplicate ?? false;
          setRecogResult({ tier: "good", name, confidence: conf, streak: 3, checkedIn: true, checkedInAt, duplicate });
          setMessage(
            duplicate
              ? `${name} already checked in at ${checkedInAt} IST.`
              : `✓ ${name} checked in at ${checkedInAt} IST (${conf.toFixed(1)}%).`,
          );
          await refresh();
          recognizeRef.current = false;
          setRecognizing(false);
          stopCamera(); // auto-off after result
          return;
        }

        await new Promise((r) => window.setTimeout(r, 280));
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Recognition failed.");
    } finally {
      recognizeRef.current = false;
      setRecognizing(false);
    }
  };

  const stopRecognize = () => {
    recognizeRef.current = false;
    setRecognizing(false);
  };

  const currentProfile = dashboard.profiles.find((p) => p.employee_id === employee);
  const alreadyEnrolled = currentProfile?.state === "ready";
  const today = new Date().toISOString().slice(0, 10);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="page attendance-page">
      <PageHeader
        kicker="ATTENDANCE · FACE RECOGNITION"
        title="Attendance"
        description="Local OpenCV face registration, LBPH recognition, and daily attendance."
        action={
          <div className={`system-state ${serviceOnline ? "online" : ""}`}>
            <span />{serviceOnline ? "Local service online" : "Local service offline"}
          </div>
        }
      />

      <Tabs
        items={["Overview", "Enroll", "Recognize", "Attendance Sheet"]}
        active={mode}
        onChange={(v) => { stopCamera(); setMode(v as AttMode); }}
      />

      {/* ── OVERVIEW ── */}
      {mode === "Overview" && (
        <>
          <div className="metrics metrics-4">
            <Metric value={`${dashboard.registered}`}       label="Registered profiles" />
            <Metric value={`${dashboard.checked_in_today}`} label="Checked in today"    tone="green" />
            <Metric value={`${dashboard.not_checked_in}`}   label="Not checked in" />
            <Metric value={dashboard.model_ready ? "Ready" : "Setup"} label="LBPH model" />
          </div>

          <div className="attendance-columns">
            {/* Employee registration status */}
            <section>
              <h2>Employee registration</h2>
              <div className="panel">
                {EMPLOYEES.map((person) => {
                  const profile = dashboard.profiles.find((p) => p.employee_id === person.id);
                  return (
                    <div className="simple-row" key={person.id}>
                      <span className="avatar">{person.name.split(" ").map((p) => p[0]).join("")}</span>
                      <div className="grow">
                        <strong>{person.name}</strong>
                        <small>{profile ? `${profile.sample_count}/100 samples` : "No biometric data"}</small>
                      </div>
                      <span className={`status ${profile?.state === "ready" ? "status-good" : "status-warn"}`}>
                        {profile?.state === "ready" ? "Ready" : profile ? "Incomplete" : "Not registered"}
                      </span>
                      {profile && (
                        <button
                          className="table-actions"
                          style={{ marginLeft: 8 }}
                          onClick={() => void deleteProfile(person.id, person.name)}
                        >
                          <span style={{ color: "var(--orange)", fontSize: 11 }}>Delete</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button className="section-button" onClick={() => setMode("Enroll")}>
                Register an employee
              </Button>
            </section>

            {/* Attendance history */}
            <section>
              <div className="section-heading">
                <h2>Attendance history</h2>
                <Button variant="secondary" onClick={() => window.open(`${API}/attendance.csv`, "_blank")}>
                  Export CSV
                </Button>
              </div>
              <div className="panel">
                {dashboard.records.length ? dashboard.records.slice(0, 8).map((rec) => (
                  <div className="simple-row" key={rec.id}>
                    <span className="avatar">{rec.name.split(" ").map((p) => p[0]).join("")}</span>
                    <div className="grow">
                      <strong>{rec.name}</strong>
                      <small>
                        {rec.attendance_date} · confidence {Math.max(0, Math.round(100 - rec.distance))}%
                        {rec.corrected ? " · corrected" : ""}
                      </small>
                    </div>
                    <strong>{rec.check_in_time.slice(0, 5)}</strong>
                  </div>
                )) : <div className="empty-row">No attendance has been recorded yet.</div>}
              </div>
            </section>
          </div>
        </>
      )}

      {/* ── ENROLL / RECOGNIZE — shared camera layout ── */}
      {(mode === "Enroll" || mode === "Recognize") && (
        <div className="camera-layout">
          {/* Left: webcam feed */}
          <section className="camera-card">
            <div className={`camera-view ${camera ? "camera-live" : ""}`}>
              <video ref={video} autoPlay muted playsInline />
              <div className="face-frame" />
              {!camera && (
                <div className="camera-empty">
                  <Icon name="scan" size={44} />
                  <strong>Camera is off</strong>
                  <small>Frames are sent only to your local service.</small>
                </div>
              )}
              {(recognizing || capturing) && <div className="scanning-line" />}
            </div>
            {/* Manual camera controls only shown in Recognize tab */}
            {mode === "Recognize" && (
              camera
                ? <Button variant="secondary" onClick={stopCamera}>Stop camera</Button>
                : <Button onClick={() => void startCamera()}>Enable camera</Button>
            )}
          </section>

          {/* Right: Enroll panel */}
          {mode === "Enroll" && (
            <section className="setup-panel">
              <p className="eyebrow">FACE REGISTRATION</p>
              <h2>Register an employee</h2>
              <p className="subtle">
                OpenCV accepts 100 quality-controlled grayscale samples, then trains the LBPH model.
              </p>

              {/* Employee selector — stopping camera on change */}
              <label className="field">
                <span>Select employee</span>
                <select value={employee} onChange={(e) => { stopCamera(); setEmployee(e.target.value); }}>
                  {EMPLOYEES.map((p) => {
                    const prof = dashboard.profiles.find((x) => x.employee_id === p.id);
                    const tag  = prof?.state === "ready" ? " ✓" : prof ? " (incomplete)" : "";
                    return <option key={p.id} value={p.id}>{p.name}{tag}</option>;
                  })}
                </select>
              </label>

              {/* Already enrolled warning */}
              {alreadyEnrolled && !capturing && (
                <div className="service-message warning" style={{ marginBottom: 12 }}>
                  {selectedEmployee.name} is already enrolled.
                  <button onClick={() => void deleteProfile(employee, selectedEmployee.name)}>Re-enroll</button>
                </div>
              )}

              {/* Enrollment complete banner */}
              {enrollDone && (
                <div className="service-message success" style={{ marginBottom: 12 }}>
                  Enrollment complete. Switch to Recognize to mark attendance.
                  <button onClick={() => setMode("Recognize")}>Go →</button>
                </div>
              )}

              <label className="consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>I have explicit consent to store this employee's normalized biometric face samples on this local device.</span>
              </label>

              {/* Sample progress bar */}
              <div className="sample-progress">
                <div><strong>{samples}</strong><span>/ 100 accepted samples</span></div>
                <div className="progress"><span style={{ width: `${samples}%` }} /></div>
                <small>Dark, blurry, duplicate, small, missing, or multiple-face frames are rejected.</small>
              </div>

              <Button
                onClick={() => void beginCapture()}
                disabled={!consent || !serviceOnline || capturing || (alreadyEnrolled && !capturing)}
              >
                {capturing ? `Capturing… ${samples}/100` : "Capture 100 samples & train"}
              </Button>

              <div className="tech-note">
                <strong>Privacy</strong>
                <span>Samples, the LBPH model, and SQLite records remain under server/data. No liveness detection.</span>
              </div>
            </section>
          )}

          {/* Right: Recognize panel */}
          {mode === "Recognize" && (
            <section className="setup-panel">
              <p className="eyebrow">MARK ATTENDANCE</p>
              <h2>Recognize & check in</h2>
              <p className="subtle">
                Click Start — the camera opens automatically and runs until a match is confirmed.
              </p>

              {!dashboard.model_ready && (
                <div className="warning" style={{ marginBottom: 16 }}>
                  No trained model available. Go to <strong>Enroll</strong> to register an employee first.
                </div>
              )}

              {/* Result card — shown after a successful recognition */}
              {recogResult.checkedIn ? (
                <div style={{
                  margin: "16px 0", padding: "18px 16px",
                  border: `1px solid ${recogResult.duplicate ? "var(--line)" : "#b9ded1"}`,
                  borderRadius: 10,
                  background: recogResult.duplicate ? "var(--soft)" : "#eff9f5",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <span className="avatar" style={{ background: "var(--teal-soft)", color: "var(--teal)", width: 40, height: 40 }}>
                    {recogResult.name.split(" ").map((x) => x[0]).join("")}
                  </span>
                  <div>
                    <strong style={{ display: "block", fontSize: 15 }}>{recogResult.name}</strong>
                    <small style={{ color: recogResult.duplicate ? "var(--muted)" : "var(--green)", display: "block", marginTop: 3 }}>
                      {recogResult.duplicate
                        ? `Already checked in today · ${recogResult.checkedInAt} IST`
                        : `✓ Checked in · ${recogResult.checkedInAt} IST · ${recogResult.confidence.toFixed(1)}%`}
                    </small>
                  </div>
                </div>
              ) : (
                /* Live confidence card — shown while scanning */
                recogResult.tier !== null && (
                  <div style={{ margin: "16px 0 12px", padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>
                        {recogResult.tier === "unknown"   ? "No match — adjust position"
                        : recogResult.tier === "uncertain" ? "Uncertain — hold still"
                        : `Verifying ${recogResult.name}`}
                      </span>
                      <span style={{ color: "var(--muted)" }}>{recogResult.confidence.toFixed(1)}%</span>
                    </div>
                    {/* Animated progress bar */}
                    <div className="progress" style={{ height: 10, borderRadius: 99 }}>
                      <span style={{
                        width: `${recogResult.confidence}%`,
                        display: "block", height: "100%", borderRadius: 99,
                        background: recogResult.tier === "unknown"   ? "var(--orange)"
                                  : recogResult.tier === "uncertain" ? "#c8860a"
                                  : "var(--teal)",
                        transition: "width .15s ease, background .2s",
                      }} />
                    </div>
                    {/* Streak dots (3 dots fill teal as stable matches accumulate) */}
                    {recogResult.tier === "good" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                        {[1, 2, 3].map((n) => (
                          <span key={n} style={{
                            width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                            background: recogResult.streak >= n ? "var(--teal)" : "var(--line)",
                            transition: "background .2s",
                          }} />
                        ))}
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>
                          {recogResult.streak}/3 stable matches
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {!recogResult.checkedIn && (
                  <Button onClick={() => void startRecognize()} disabled={!dashboard.model_ready || recognizing}>
                    {recognizing ? "Scanning…" : "Start recognition"}
                  </Button>
                )}
                {recognizing && (
                  <Button variant="secondary" onClick={stopRecognize}>Stop</Button>
                )}
              </div>

              <div className="tech-note" style={{ marginTop: 20 }}>
                <strong>Confidence tiers</strong>
                <span>
                  Distance &lt; 50 = solid match (teal) · 50–85 = uncertain (amber) · above 85 = unknown.
                  Three consecutive solid matches record attendance with IST timestamp.
                </span>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── ATTENDANCE SHEET ── */}
      {mode === "Attendance Sheet" && (
        <AttendanceSheet
          records={dashboard.records}
          today={today}
          onExport={() => window.open(`${API}/attendance.csv`, "_blank")}
        />
      )}
    </div>
  );
}

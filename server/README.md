# Enkel local attendance service

This service keeps biometric data on the machine running Enkel. It provides
OpenCV face detection, quality-controlled sampling, LBPH training, stable
three-frame recognition, duplicate check-in protection, SQLite attendance
history, corrections, deletion and CSV export.

## Start

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r server/requirements.txt
uvicorn server.main:app --host 127.0.0.1 --port 8787
```

The frontend expects `http://127.0.0.1:8787`. The API documentation is
available at `http://127.0.0.1:8787/docs`.

## Privacy

All generated data is under `server/data/`, which is gitignored:

- `samples/`: normalized grayscale face crops
- `models/lbph.yml`: trained LBPH model
- `attendance.sqlite3`: profiles and attendance records

The prototype does not implement liveness detection and must not be treated as
high-security authentication.

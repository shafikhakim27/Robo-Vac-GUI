# RoboVac Mapping Web UI

A minimal full-stack simulator that streams occupancy-grid and pose data from FastAPI to a React + TypeScript canvas viewer.

## Project Structure
- `backend/`: FastAPI WebSocket backend and simulator
- `frontend/`: React + TypeScript (Vite) canvas renderer

## Backend (FastAPI + WebSocket)
The backend exposes:
- `GET /` health route
- `WS /ws` websocket stream

On websocket connect, it sends one simulated occupancy-grid map message, then continuously streams pose updates at **15Hz**.

### Run backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Backend dependency update policy
We use **compatible-release version specifiers** in `backend/requirements.txt` (for example `~=0.115.0`). This allows safe patch/minor updates within the same major version while preventing unreviewed major upgrades.

Dependabot should update these ranges via PRs, and major-version bumps should be handled deliberately in a separate review.

## Frontend (React + TypeScript)
The frontend connects to `ws://localhost:8000/ws`, parses map + pose messages, and renders:
- Occupancy grid on HTML canvas
- Robot as a triangle arrow from `(x, y, theta)` in meters
- Zoom (mouse wheel) and pan (drag)

### Run frontend
```bash
cd frontend
npm install
npm run dev
```

For reproducible installs (e.g., CI), prefer:

```bash
cd frontend
npm ci
```

Then open the dev URL (usually `http://localhost:5173`).

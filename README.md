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

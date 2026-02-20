# RoboVac Mapping Web UI

A web-based mapping and control interface for a robot vacuum system.
Built with FastAPI (backend) and React (frontend), streaming live map
and robot pose data over WebSockets.

## Features
- Live occupancy grid map
- Real-time robot pose visualization
- WebSocket streaming
- Zoom & pan map view
- Zone/no-go area support (planned)

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: React + TypeScript
- Communication: WebSocket

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
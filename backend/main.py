from __future__ import annotations

import asyncio
import time

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from simulator import RobotSimulator

app = FastAPI(title="RoboVac Simulator Backend")
simulator = RobotSimulator()


@app.get("/")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/ws")
async def ws_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json(simulator.map_message())

    start = time.perf_counter()
    interval_s = 1.0 / 15.0

    try:
        while True:
            elapsed = time.perf_counter() - start
            await websocket.send_json(simulator.pose_message(elapsed))
            await asyncio.sleep(interval_s)
    except WebSocketDisconnect:
        return

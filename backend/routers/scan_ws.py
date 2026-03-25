from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# store active connections per scan
connections: Dict[int, List[WebSocket]] = {}

# global connections (frontend uses this)
global_connections: List[WebSocket] = []


# ================= GLOBAL WS =================
@router.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket):
    await websocket.accept()

    global_connections.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in global_connections:
            global_connections.remove(websocket)


# ================= PER-SCAN WS =================
@router.websocket("/ws/logs/{scan_id}")
async def websocket_logs(websocket: WebSocket, scan_id: int):
    await websocket.accept()

    if scan_id not in connections:
        connections[scan_id] = []

    connections[scan_id].append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if scan_id in connections and websocket in connections[scan_id]:
            connections[scan_id].remove(websocket)


# ================= SEND LOG FUNCTION =================
async def send_log(scan_id: int, message: str):

    # ---- scan-specific clients ----
    if scan_id in connections:
        dead_ws = []

        for ws in connections[scan_id]:
            try:
                await ws.send_text(message)
            except:
                dead_ws.append(ws)

        # cleanup dead sockets
        for ws in dead_ws:
            connections[scan_id].remove(ws)

    # ---- global clients ----
    dead_global = []

    for ws in global_connections:
        try:
            await ws.send_text(f"[SCAN {scan_id}] {message}")
        except:
            dead_global.append(ws)

    # cleanup
    for ws in dead_global:
        global_connections.remove(ws)
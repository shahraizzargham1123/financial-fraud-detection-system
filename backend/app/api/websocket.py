import json
from typing import Any
from fastapi import WebSocket

_connections: set[WebSocket] = set()


async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    _connections.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive; client sends pings
    except Exception:
        pass
    finally:
        _connections.discard(websocket)


async def broadcast(payload: dict[str, Any]) -> None:
    dead: set[WebSocket] = set()
    for ws in _connections:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.add(ws)
    _connections.difference_update(dead)

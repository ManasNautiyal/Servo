from fastapi import WebSocket
from typing import Dict, List, Optional
import json

class ConnectionManager:
    def __init__(self):
        # Maps user_id (int) to a list of WebSocket connections (supporting multiple devices)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        # Broadcast user's online status
        await self.broadcast_status(user_id, online=True)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                # Broadcast user's offline status
                await self.broadcast_status(user_id, online=False)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might have died, let's clean it up later on disconnect
                    pass

    async def broadcast_status(self, user_id: int, online: bool):
        payload = {
            "type": "online_status",
            "sender_id": user_id,
            "online": online
        }
        for uid, connections in self.active_connections.items():
            if uid != user_id:  # Don't send back to oneself
                for connection in connections:
                    try:
                        await connection.send_json(payload)
                    except Exception:
                        pass

    async def broadcast_typing(self, sender_id: int, receiver_id: int, is_typing: bool):
        payload = {
            "type": "typing",
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "is_typing": is_typing
        }
        await self.send_personal_message(payload, receiver_id)

    async def broadcast_read_receipt(self, sender_id: int, receiver_id: int, message_id: int):
        payload = {
            "type": "read_receipt",
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message_id": message_id
        }
        await self.send_personal_message(payload, receiver_id)

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

manager = ConnectionManager()

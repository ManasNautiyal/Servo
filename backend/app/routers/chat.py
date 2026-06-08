from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
import json
import datetime
import jwt as pyjwt

from app.config import settings
from app.database.session import get_db, SessionLocal
from app.database.models import User, Message, Notification
from app.schemas.message import MessageResponse
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.get("/history/{other_user_id}", response_model=List[MessageResponse])
def get_chat_history(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch historical messages between current_user and other_user
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp.asc()).all()
    
    # Automatically mark messages sent by the other user to me as read
    unread_messages = [m for m in messages if m.sender_id == other_user_id and not m.is_read]
    if unread_messages:
        for m in unread_messages:
            m.is_read = True
        db.commit()
        
    return messages

@router.get("/conversations", response_model=List[dict])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Returns a list of users the current user has chatted with, along with the last message
    # Query sender and receiver IDs
    sent_to = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct().all()
    received_from = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct().all()
    
    chat_partner_ids = list(set([uid[0] for uid in sent_to + received_from]))
    
    conversations = []
    for partner_id in chat_partner_ids:
        partner = db.query(User).filter(User.id == partner_id).first()
        if not partner:
            continue
            
        # Get the latest message
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.timestamp.desc()).first()
        
        # Count unread messages sent by partner to current user
        unread_count = db.query(Message).filter(
            Message.sender_id == partner_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()
        
        conversations.append({
            "partner_id": partner.id,
            "partner_name": partner.name,
            "partner_avatar": partner.profile_picture,
            "partner_online": manager.is_user_online(partner.id),
            "last_message": last_msg.content if last_msg else "",
            "last_message_time": last_msg.timestamp.isoformat() if last_msg else "",
            "unread_count": unread_count
        })
        
    # Sort conversations by last message timestamp descending
    conversations.sort(key=lambda x: x["last_message_time"], reverse=True)
    return conversations

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: Optional[str] = Query(None)
):
    # Verify token
    # Since websockets don't support headers easily, we verify via query string token
    db = SessionLocal()
    authenticated = False
    
    if token:
        try:
            payload = pyjwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            token_user_id = payload.get("user_id")
            if token_user_id == user_id:
                authenticated = True
        except Exception:
            pass
            
    if not authenticated:
        await websocket.close(code=1008)  # Policy violation
        db.close()
        return

    # Add to connection manager
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            # Await messages from this connection
            data = await websocket.receive_text()
            payload = json.loads(data)
            msg_type = payload.get("type")
            
            if msg_type == "message":
                receiver_id = int(payload.get("receiver_id"))
                content = payload.get("content", "").strip()
                
                if not content:
                    continue
                    
                # Save to database
                db_message = Message(
                    sender_id=user_id,
                    receiver_id=receiver_id,
                    content=content,
                    is_read=False
                )
                db.add(db_message)
                db.commit()
                db.refresh(db_message)
                
                # Format response payload
                response_payload = {
                    "type": "message",
                    "id": db_message.id,
                    "sender_id": user_id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "is_read": False,
                    "timestamp": str(db_message.timestamp)
                }
                
                # Send to receiver if online
                await manager.send_personal_message(response_payload, receiver_id)
                # Send confirmation back to sender
                await manager.send_personal_message(response_payload, user_id)
                
                # If receiver is not online, create an in-app notification
                if not manager.is_user_online(receiver_id):
                    sender_user = db.query(User).filter(User.id == user_id).first()
                    sender_name = sender_user.name if sender_user else "Someone"
                    
                    notif = Notification(
                        user_id=receiver_id,
                        type="new_message",
                        content=f"💬 New message from {sender_name}: '{content[:30]}...'",
                        is_read=False
                    )
                    db.add(notif)
                    db.commit()
                    
            elif msg_type == "typing":
                receiver_id = int(payload.get("receiver_id"))
                is_typing = bool(payload.get("is_typing", False))
                await manager.broadcast_typing(user_id, receiver_id, is_typing)
                
            elif msg_type == "read_receipt":
                receiver_id = int(payload.get("receiver_id"))
                message_id = int(payload.get("message_id"))
                
                # Update DB
                db_msg = db.query(Message).filter(Message.id == message_id).first()
                if db_msg and db_msg.receiver_id == user_id:
                    db_msg.is_read = True
                    db.commit()
                    await manager.broadcast_read_receipt(user_id, receiver_id, message_id)
                    
    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        await manager.disconnect(user_id, websocket)
    finally:
        db.close()

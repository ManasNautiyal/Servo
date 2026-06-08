from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.database.session import get_db
from app.database.models import User, Service, Order, Notification
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services.auth import get_current_user
from app.services.websocket import manager

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# Helper to create notification and broadcast
async def send_order_notification(db: Session, user_id: int, notif_type: str, content: str):
    notification = Notification(
        user_id=user_id,
        type=notif_type,
        content=content,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # WebSocket broadcast
    await manager.send_personal_message({
        "type": "notification",
        "notification_id": notification.id,
        "notif_type": notif_type,
        "content": content,
        "is_read": False,
        "created_at": str(notification.created_at)
    }, user_id)

@router.post("", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(Service.id == order_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    if service.provider_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot hire your own service listing."
        )
        
    if service.status != "available":
        raise HTTPException(
            status_code=400,
            detail="This service is currently busy or offline."
        )
        
    new_order = Order(
        buyer_id=current_user.id,
        provider_id=service.provider_id,
        service_id=service.id,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Notify provider
    await send_order_notification(
        db=db,
        user_id=service.provider_id,
        notif_type="new_order",
        content=f"🎓 {current_user.name} has requested to hire your service: '{service.title}'"
    )
    
    return new_order

@router.get("", response_model=List[OrderResponse])
def get_orders(
    role: Optional[str] = None,  # "buyer" or "provider"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    q = db.query(Order)
    
    if role == "buyer":
        q = q.filter(Order.buyer_id == current_user.id)
    elif role == "provider":
        q = q.filter(Order.provider_id == current_user.id)
    else:
        # Fetch both
        q = q.filter((Order.buyer_id == current_user.id) | (Order.provider_id == current_user.id))
        
    return q.order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if order.buyer_id != current_user.id and order.provider_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to view this order")
        
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    new_status = status_update.status.lower()
    allowed_statuses = ["pending", "accepted", "in_progress", "delivered", "completed", "cancelled"]
    
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status.")
        
    # Validation based on current state and user roles
    is_buyer = order.buyer_id == current_user.id
    is_provider = order.provider_id == current_user.id
    
    if not is_buyer and not is_provider:
        raise HTTPException(status_code=403, detail="Unauthorized to update this order status.")
        
    # Transition logs and status enforcement
    if new_status == "accepted":
        if not is_provider:
            raise HTTPException(status_code=400, detail="Only the service provider can accept the order request.")
        if order.status != "pending":
            raise HTTPException(status_code=400, detail="Can only accept pending orders.")
        order.status = "accepted"
        
        await send_order_notification(
            db=db,
            user_id=order.buyer_id,
            notif_type="order_accepted",
            content=f"✅ {current_user.name} accepted your hire request for: '{order.service.title}'!"
        )
        
    elif new_status == "cancelled":
        # Buyer can cancel pending, Provider can reject pending (cancels)
        if order.status != "pending" and order.status != "accepted":
            raise HTTPException(status_code=400, detail="Cannot cancel order in this stage.")
            
        order.status = "cancelled"
        
        # Notify counterpart
        receiver_id = order.buyer_id if is_provider else order.provider_id
        initiator = "Provider" if is_provider else "Buyer"
        await send_order_notification(
            db=db,
            user_id=receiver_id,
            notif_type="order_cancelled",
            content=f"❌ Order for '{order.service.title}' was cancelled by the {initiator.lower()}."
        )
        
    elif new_status == "in_progress":
        if not is_provider:
            raise HTTPException(status_code=400, detail="Only the provider can mark work in progress.")
        if order.status != "accepted":
            raise HTTPException(status_code=400, detail="Can only start progress on accepted orders.")
        order.status = "in_progress"
        
        await send_order_notification(
            db=db,
            user_id=order.buyer_id,
            notif_type="order_in_progress",
            content=f"🛠️ {current_user.name} started working on your order: '{order.service.title}'"
        )
        
    elif new_status == "delivered":
        if not is_provider:
            raise HTTPException(status_code=400, detail="Only the provider can deliver work.")
        if order.status != "in_progress" and order.status != "accepted":
            raise HTTPException(status_code=400, detail="Order must be in progress or accepted to deliver.")
        order.status = "delivered"
        
        await send_order_notification(
            db=db,
            user_id=order.buyer_id,
            notif_type="order_delivered",
            content=f"📦 {current_user.name} has delivered the work for: '{order.service.title}'! Review the delivery now."
        )
        
    elif new_status == "completed":
        if not is_buyer:
            raise HTTPException(status_code=400, detail="Only the buyer can mark the order as completed.")
        if order.status != "delivered":
            raise HTTPException(status_code=400, detail="Order must be delivered before completion.")
        order.status = "completed"
        
        await send_order_notification(
            db=db,
            user_id=order.provider_id,
            notif_type="order_completed",
            content=f"🎉 {current_user.name} approved your delivery and completed the order for '{order.service.title}'!"
        )
        
    db.commit()
    db.refresh(order)
    return order

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from typing import List, Optional
import os

from app.database.session import get_db
from app.database.models import User, Service, Review, Order
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.ai import DescriptionGeneratorRequest, DescriptionGeneratorResponse
from app.services.auth import get_current_user
from app.services.gemini import generate_service_description, recommend_services
from app.services.supabase import upload_file_to_storage

router = APIRouter(prefix="/api/services", tags=["Services"])

@router.post("", response_model=ServiceResponse)
def create_service(
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_service = Service(
        provider_id=current_user.id,
        title=service_in.title,
        description=service_in.description,
        category=service_in.category,
        price=service_in.price,
        delivery_time=service_in.delivery_time,
        image_url=service_in.image_url,
        tags=service_in.tags,
        status=service_in.status or "available"
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.get("", response_model=List[ServiceResponse])
def get_services(
    query: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    branch: Optional[str] = None,
    year: Optional[int] = None,
    sort_by: Optional[str] = "newest",  # newest, price_asc, price_desc, rating_desc, popularity
    db: Session = Depends(get_db)
):
    # Base query joining Service and User (provider) for filters
    q = db.query(Service).join(User, Service.provider_id == User.id)
    
    # Filter active/available services only
    q = q.filter(Service.status == "available")
    
    # Text search
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Service.title.ilike(search_pattern),
                Service.description.ilike(search_pattern),
                Service.tags.ilike(search_pattern),
                User.name.ilike(search_pattern)
            )
        )
        
    # Category Filter
    if category:
        q = q.filter(Service.category.ilike(category))
        
    # Price Filters
    if min_price is not None:
        q = q.filter(Service.price >= min_price)
    if max_price is not None:
        q = q.filter(Service.price <= max_price)
        
    # Provider Branch Filter
    if branch:
        q = q.filter(User.branch.ilike(branch))
        
    # Provider Year Filter
    if year is not None:
        q = q.filter(User.year == year)
        
    # Sorting logic
    if sort_by == "price_asc":
        q = q.order_by(asc(Service.price))
    elif sort_by == "price_desc":
        q = q.order_by(desc(Service.price))
    elif sort_by == "rating_desc":
        # Sort by average review rating of the service
        subq = db.query(
            Review.service_id,
            func.avg(Review.rating).label("avg_rating")
        ).group_by(Review.service_id).subquery()
        
        q = q.outerjoin(subq, Service.id == subq.c.service_id).order_by(
            desc(subq.c.avg_rating),
            desc(Service.created_at)
        )
    elif sort_by == "popularity":
        # Sort by completed orders count
        subq = db.query(
            Order.service_id,
            func.count(Order.id).label("order_count")
        ).filter(Order.status == "completed").group_by(Order.service_id).subquery()
        
        q = q.outerjoin(subq, Service.id == subq.c.service_id).order_by(
            desc(subq.c.order_count),
            desc(Service.created_at)
        )
    else:  # default "newest"
        q = q.order_by(desc(Service.created_at))
        
    return q.all()

@router.get("/my-services", response_model=List[ServiceResponse])
def get_my_services(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Service).filter(Service.provider_id == current_user.id).order_by(desc(Service.created_at)).all()

@router.get("/recommendations", response_model=List[ServiceResponse])
def get_service_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all active services
    all_services = db.query(Service).filter(
        Service.status == "available",
        Service.provider_id != current_user.id  # Don't recommend own services
    ).all()
    
    if not all_services:
        return []
        
    # Format current user details
    skills_list = [s.skill_name for s in current_user.skills]
    user_profile = {
        "branch": current_user.branch,
        "skills": skills_list,
        "bio": current_user.bio
    }
    
    # Format all services list for the AI engine
    services_list = [
        {"id": s.id, "title": s.title, "category": s.category, "tags": s.tags}
        for s in all_services
    ]
    
    # Call Gemini recommendation engine to get a sorted list of IDs
    recommended_ids = recommend_services(user_profile, services_list)
    
    # Retrieve recommended services in order of recommendation
    # Map by id to maintain recommendation sorting order
    service_map = {s.id: s for s in all_services}
    ordered_recommendations = []
    
    # Add ordered suggestions
    for rid in recommended_ids:
        if rid in service_map:
            ordered_recommendations.append(service_map[rid])
            
    # Add remaining services that might have been skipped by recommendations
    for s in all_services:
        if s not in ordered_recommendations:
            ordered_recommendations.append(s)
            
    # Return top 6 recommendations
    return ordered_recommendations[:6]

@router.get("/{service_id}", response_model=ServiceResponse)
def get_service_details(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.provider_id == current_user.id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized.")
        
    if service_update.title is not None:
        service.title = service_update.title
    if service_update.description is not None:
        service.description = service_update.description
    if service_update.category is not None:
        service.category = service_update.category
    if service_update.price is not None:
        service.price = service_update.price
    if service_update.delivery_time is not None:
        service.delivery_time = service_update.delivery_time
    if service_update.image_url is not None:
        service.image_url = service_update.image_url
    if service_update.tags is not None:
        service.tags = service_update.tags
    if service_update.status is not None:
        service.status = service_update.status
        
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{service_id}", response_model=dict)
def delete_service(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(
        Service.id == service_id,
        Service.provider_id == current_user.id
    ).first()
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found or unauthorized.")
        
    db.delete(service)
    db.commit()
    return {"message": "Service successfully deleted."}

@router.post("/upload-image", response_model=dict)
async def upload_service_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    allowed_extensions = [".png", ".jpg", ".jpeg", ".webp"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only service images (.png, .jpg, .jpeg, .webp) are allowed.")
        
    url = await upload_file_to_storage(file, folder="services")
    return {"url": url}

@router.post("/generate-description", response_model=DescriptionGeneratorResponse)
def generate_description(
    payload: DescriptionGeneratorRequest,
    current_user: User = Depends(get_current_user)
):
    desc_text = generate_service_description(payload.brief)
    return {"generated_description": desc_text}

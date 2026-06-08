from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.database.session import get_db
from app.database.models import User, Skill, Order, Review, Service
from app.schemas.user import UserResponse, UserProfileUpdate, UserStats
from app.schemas.ai import SkillExtractionResponse, ProfileSuggestionResponse
from app.services.auth import get_current_user
from app.services.gemini import extract_skills_from_text, suggest_profile_improvements
from app.services.supabase import upload_file_to_storage

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/stats/{user_id}", response_model=UserStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    # 1. Orders completed
    completed_orders = db.query(Order).filter(
        Order.provider_id == user_id,
        Order.status == "completed"
    ).count()
    
    # 2. Reviews received and average rating
    reviews = db.query(
        func.count(Review.id).label("count"),
        func.avg(Review.rating).label("avg_rating")
    ).filter(Review.provider_id == user_id).first()
    
    review_count = reviews.count or 0
    avg_rating = float(round(reviews.avg_rating, 1)) if reviews.avg_rating else 0.0
    
    # 3. Active services count
    active_services = db.query(Service).filter(
        Service.provider_id == user_id,
        Service.status == "available"
    ).count()
    
    return UserStats(
        orders_completed=completed_orders,
        reviews_received_count=review_count,
        average_rating=avg_rating,
        active_services_count=active_services
    )

@router.put("/profile/update", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update fields on the User model
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.branch is not None:
        current_user.branch = profile_data.branch
    if profile_data.year is not None:
        current_user.year = profile_data.year
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio
    if profile_data.profile_picture is not None:
        current_user.profile_picture = profile_data.profile_picture
    if profile_data.github_link is not None:
        current_user.github_link = profile_data.github_link
    if profile_data.resume_url is not None:
        current_user.resume_url = profile_data.resume_url
        
    # Update skills if provided
    if profile_data.skills is not None:
        # Delete old skills
        db.query(Skill).filter(Skill.user_id == current_user.id).delete()
        # Add new skills
        for skill_name in profile_data.skills:
            if skill_name.strip():
                new_skill = Skill(user_id=current_user.id, skill_name=skill_name.strip())
                db.add(new_skill)
                
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/upload-resume", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file format
    allowed_extensions = [".pdf", ".doc", ".docx"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only resume documents (.pdf, .doc, .docx) are allowed.")
        
    url = await upload_file_to_storage(file, folder="resumes")
    current_user.resume_url = url
    db.commit()
    return {"url": url}

@router.post("/upload-avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_extensions = [".png", ".jpg", ".jpeg", ".webp"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only images (.png, .jpg, .jpeg, .webp) are allowed.")
        
    url = await upload_file_to_storage(file, folder="avatars")
    current_user.profile_picture = url
    db.commit()
    return {"url": url}

@router.post("/extract-skills", response_model=SkillExtractionResponse)
def extract_skills(
    payload: dict,  # Expects {"text": "resume/certificate text"}
    current_user: User = Depends(get_current_user)
):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    extracted = extract_skills_from_text(text)
    return extracted

@router.get("/suggestions", response_model=ProfileSuggestionResponse)
def get_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Build profile summary for Gemini suggestions
    skills_list = [s.skill_name for s in current_user.skills]
    user_profile = {
        "name": current_user.name,
        "branch": current_user.branch,
        "year": current_user.year,
        "bio": current_user.bio,
        "skills": skills_list
    }
    suggestions = suggest_profile_improvements(user_profile)
    return suggestions
import os

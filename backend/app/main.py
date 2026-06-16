from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database.session import engine, Base, SessionLocal
from app.database.models import User, Skill, Service, Order, Review, Message, Notification
from app.services.auth import hash_password
from app.routers import auth, users, services, orders, reviews, chat, notifications, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Servo API",
    description="Backend API for Campus Service Marketplace",
    version="1.0.0"
)

# CORS Configuration
# In production, specify actual frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist and mount static files router
os.makedirs(os.path.join(os.getcwd(), "static", "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.include_router(chat.router)
app.include_router(notifications.router)
app.include_router(admin.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Servo API"}


# Seed database on startup if empty
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("🚀 Seeding database with initial sample data...")
            
            # 1. Create Admin
            admin_user = User(
                name="Prof. Sharma (Admin)",
                email="admin@servo.com",
                password_hash=hash_password("admin123"),
                college_id="ADM-001",
                branch="Administration",
                year=5,
                bio="Campus marketplace moderator and administrator.",
                role="admin"
            )
            db.add(admin_user)
            
            # 2. Create Students
            student_1 = User(
                name="Rahul Verma",
                email="rahul@college.edu",
                password_hash=hash_password("student123"),
                college_id="CS-2023-045",
                branch="Computer Science",
                year=3,
                bio="Passionate developer specializing in Python, React, and Machine Learning. Always down to build campus projects!",
                profile_picture="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
                github_link="https://github.com",
                role="student"
            )
            
            student_2 = User(
                name="Priya Patel",
                email="priya@college.edu",
                password_hash=hash_password("student123"),
                college_id="EC-2024-102",
                branch="Electronics",
                year=2,
                bio="Graphic designer and video editor. I love creating beautiful presentations, logos, and YouTube/Instagram video edits.",
                profile_picture="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                github_link="https://github.com",
                role="student"
            )
            
            student_3 = User(
                name="Amit Singh",
                email="amit@college.edu",
                password_hash=hash_password("student123"),
                college_id="ME-2022-088",
                branch="Mechanical",
                year=4,
                bio="Academic tutoring and resume builder. I help students structure their resumes and write cover letters for campus placements.",
                profile_picture="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
                github_link="https://github.com",
                role="student"
            )
            
            db.add_all([student_1, student_2, student_3])
            db.commit() # Commit to generate user IDs
            
            # 3. Add Skills
            db.add_all([
                Skill(user_id=student_1.id, skill_name="Python"),
                Skill(user_id=student_1.id, skill_name="React"),
                Skill(user_id=student_1.id, skill_name="Machine Learning"),
                Skill(user_id=student_2.id, skill_name="Graphic Design"),
                Skill(user_id=student_2.id, skill_name="Video Editing"),
                Skill(user_id=student_2.id, skill_name="Photoshop"),
                Skill(user_id=student_3.id, skill_name="Resume Writing"),
                Skill(user_id=student_3.id, skill_name="Tutoring"),
                Skill(user_id=student_3.id, skill_name="Career Coaching")
            ])
            
            # 4. Add Services
            service_1 = Service(
                provider_id=student_1.id,
                title="Python Project & Assignment Guidance",
                description="Are you struggling with Python assignments, loops, OOP, or data structures? I will help you build your college projects, write clean modular Python code, and explain the logic line-by-line via Google Meet. Perfect for second and third-year programming courses.",
                category="Technical",
                price=500.0,
                delivery_time=2,
                image_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600",
                tags="python,programming,dsa,assignment",
                status="available"
            )
            
            service_2 = Service(
                provider_id=student_2.id,
                title="Premium Poster & Logo Design for Clubs",
                description="Need graphics for college festivals, club events, or presentations? I am a graphic designer with 2 years of experience. I create highly custom Canva/Photoshop poster templates, social media flyers, and official club logos. Free unlimited revisions!",
                category="Creative",
                price=300.0,
                delivery_time=1,
                image_url="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600",
                tags="design,logo,club,poster",
                status="available"
            )
            
            service_3 = Service(
                provider_id=student_3.id,
                title="Placement Resume Review & LinkedIn Makeover",
                description="Get your resume shortlisted! As a fourth-year student who secured offers from 3 top-tier companies, I know exactly what recruiters look for. I will audit your resume, align it with standard templates, and revamp your LinkedIn headline/summary to stand out.",
                category="Career",
                price=400.0,
                delivery_time=3,
                image_url="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600",
                tags="resume,placement,linkedin,career",
                status="available"
            )
            
            db.add_all([service_1, service_2, service_3])
            db.commit() # Commit to generate service IDs
            
            # 5. Add Orders & Reviews
            order_1 = Order(
                buyer_id=student_2.id,
                provider_id=student_1.id,
                service_id=service_1.id,
                status="completed"
            )
            db.add(order_1)
            db.commit()
            
            review_1 = Review(
                reviewer_id=student_2.id,
                provider_id=student_1.id,
                service_id=service_1.id,
                order_id=order_1.id,
                rating=5,
                comment="Rahul is an excellent coder! He helped me structure my Python assignments and explained loops and list comprehensions really well. Highly recommended!"
            )
            db.add(review_1)
            
            # Create a pending order for testing
            order_pending = Order(
                buyer_id=student_1.id,
                provider_id=student_2.id,
                service_id=service_2.id,
                status="pending"
            )
            db.add(order_pending)
            
            # Create a notification
            db.add(Notification(
                user_id=student_2.id,
                type="new_order",
                content=f"🎓 Rahul Verma has requested to hire your service: 'Premium Poster & Logo Design for Clubs'",
                is_read=False
            ))
            
            # Create some message history
            db.add_all([
                Message(sender_id=student_2.id, receiver_id=student_1.id, content="Hi Rahul, do you tutor Python 1-on-1?"),
                Message(sender_id=student_1.id, receiver_id=student_2.id, content="Yes Priya! I teach basic OOP, libraries like pandas, and assignments. What do you need help with?"),
                Message(sender_id=student_2.id, receiver_id=student_1.id, content="I need help with my lab assignments for this week. Can we meet?"),
                Message(sender_id=student_1.id, receiver_id=student_2.id, content="Sure, let's schedule an order. I'll explain it over Zoom.")
            ])
            
            db.commit()
            print("🚀 Seeding completed successfully!")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


# Serve frontend static files and handle client-side routing fallback
from fastapi.responses import HTMLResponse, FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend-assets")
    
    @app.get("/{fallback_path:path}", response_class=HTMLResponse)
    def serve_react_app(fallback_path: str):
        # Do not catch API, documentation, or static file endpoints
        if (
            fallback_path.startswith("api/") or fallback_path == "api" or
            fallback_path.startswith("docs/") or fallback_path == "docs" or
            fallback_path.startswith("redoc/") or fallback_path == "redoc" or
            fallback_path.startswith("openapi.json") or
            fallback_path.startswith("static/") or fallback_path == "static"
        ):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
            
        # Check if the requested path is a file in the dist directory (e.g. favicon.svg)
        file_path = os.path.join(frontend_dist, fallback_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise, fall back to index.html
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
            
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="index.html not found in frontend/dist")

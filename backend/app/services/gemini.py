import os
import json
import google.generativeai as genai
from typing import List, Dict, Any
from app.config import settings

# Configure Gemini if the key is provided
is_gemini_active = False
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        is_gemini_active = True
    except Exception as e:
        print(f"Error configuring Gemini API: {e}. AI features will run in mock mode.")

def generate_service_description(brief: str) -> str:
    """
    AI Feature 1: Generates a professional service description based on a brief statement.
    """
    if not is_gemini_active:
        return (
            f"🚀 **Professional Service: Specialized Tutoring & Support**\n\n"
            f"Are you struggling with your coursework or looking to excel in your technical path? "
            f"I am offering a comprehensive assistance package centered around: **{brief}**.\n\n"
            f"**What You Can Expect:**\n"
            f"• 1-on-1 hands-on guidance tailored to your learning pace.\n"
            f"• Thorough explanations of core theoretical and practical concepts.\n"
            f"• Clean code structures, documentation, and troubleshooting tips.\n"
            f"• Quick turnaround time with dedicated post-delivery doubt clearing.\n\n"
            f"**Why Choose Me?**\n"
            f"As a fellow student who has secured top grades in this domain, I explain things simply and practically. "
            f"Let's collaborate to boost your grades and build solid projects!"
        )

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"You are a professional copywriter for a student freelancing marketplace called Servo. "
            f"Generate a professional, compelling, and formatted service description (using Markdown) "
            f"for a student service described as: '{brief}'. "
            f"Highlight features, benefits, and call to action. Keep it suitable for a college context."
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return f"Service description for {brief}. (Fallback: Please add details about your service, experience, and pricing details here!)"


def extract_skills_from_text(text: str) -> Dict[str, List[str]]:
    """
    AI Feature 2: Analyzes text (resume or portfolio text) and extracts Skills, Technologies, and Domains.
    """
    if not is_gemini_active:
        # Simple heuristic extraction for fallback
        skills = []
        technologies = []
        domains = []
        
        words = text.lower().replace(",", " ").replace("\n", " ").split()
        
        tech_map = {
            "python": "Python", "java": "Java", "react": "React", "javascript": "JavaScript",
            "html": "HTML/CSS", "css": "HTML/CSS", "sql": "SQL", "postgresql": "PostgreSQL",
            "mongodb": "MongoDB", "node": "Node.js", "express": "Express.js", "git": "Git/GitHub",
            "docker": "Docker", "aws": "AWS", "fastapi": "FastAPI", "flask": "Flask"
        }
        skill_map = {
            "programming": "Programming", "development": "Web Development", "design": "UI/UX Design",
            "testing": "Software Testing", "writing": "Content Writing", "tutoring": "Academic Tutoring",
            "resume": "Resume Building", "marketing": "Digital Marketing", "editing": "Video Editing"
        }
        domain_map = {
            "ai": "Artificial Intelligence", "ml": "Machine Learning", "deep": "Deep Learning",
            "frontend": "Frontend Development", "backend": "Backend Development",
            "fullstack": "Fullstack Development", "dsa": "Data Structures & Algorithms",
            "cybersecurity": "Cybersecurity", "cloud": "Cloud Computing"
        }

        for word in words:
            if word in tech_map:
                technologies.append(tech_map[word])
            if word in skill_map:
                skills.append(skill_map[word])
            if word in domain_map:
                domains.append(domain_map[word])
                
        # Fallbacks if text is too short or doesn't match keys
        if not skills:
            skills = ["Web Development", "Programming", "Problem Solving"]
        if not technologies:
            technologies = ["React", "Python", "JavaScript"]
        if not domains:
            domains = ["Frontend Development", "Data Structures & Algorithms"]
            
        return {
            "skills": list(set(skills)),
            "technologies": list(set(technologies)),
            "domains": list(set(domains))
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"Analyze the following resume, portfolio, or certificate text and extract:\n"
            f"1. Core Skills (soft skills, organizational, general skills)\n"
            f"2. Specific Technologies (languages, frameworks, databases, libraries)\n"
            f"3. General Domains (e.g. AI/ML, Frontend, Career Prep, Mobile Development)\n\n"
            f"Text content:\n'''\n{text}\n'''\n\n"
            f"Respond STRICTLY in a JSON format with exactly three keys: 'skills', 'technologies', and 'domains'. "
            f"Provide list of strings for each."
        )
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        # Clean JSON markdown fences if returned
        if text_response.startswith("```json"):
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif text_response.startswith("```"):
            text_response = text_response.split("```")[1].split("```")[0].strip()
            
        return json.loads(text_response)
    except Exception as e:
        print(f"Gemini API Error in skill extraction: {e}")
        return {
            "skills": ["Programming", "Web Development"],
            "technologies": ["Python", "React"],
            "domains": ["Frontend Development", "Backend Development"]
        }


def recommend_services(user_profile: Dict[str, Any], services: List[Dict[str, Any]]) -> List[int]:
    """
    AI Feature 3: Service Recommendation Engine.
    Filters and ranks service listings based on user interests, searches, and skills.
    Returns a sorted list of service IDs.
    """
    if not services:
        return []

    # Fast fallback logic
    if not is_gemini_active:
        # Check matching tags, skills, or category in user profile
        user_skills = [s.lower() for s in user_profile.get("skills", [])]
        user_branch = user_profile.get("branch", "").lower()
        
        ranked_services = []
        for service in services:
            score = 0
            # Check for keyword matches
            category = service.get("category", "").lower()
            title = service.get("title", "").lower()
            tags = service.get("tags", "").lower() if service.get("tags") else ""
            
            # Boost score if category matches branch interests (e.g., Computer Science -> Technical)
            if "computer" in user_branch or "it" in user_branch:
                if category == "technical":
                    score += 3
            
            # Boost score if service title/tags contain user skill keywords
            for skill in user_skills:
                if skill in title or skill in tags:
                    score += 5
            
            # Add small random weight for sorting variety
            score += (service.get("id", 0) % 3)
            
            ranked_services.append((score, service.get("id")))
            
        # Sort by score descending and return IDs
        ranked_services.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in ranked_services]

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        # Structure profile and services summary to minimize token usage
        profile_summary = {
            "branch": user_profile.get("branch"),
            "skills": user_profile.get("skills"),
            "bio": user_profile.get("bio")
        }
        services_summary = [
            {"id": s.get("id"), "title": s.get("title"), "category": s.get("category"), "tags": s.get("tags")}
            for s in services
        ]
        
        prompt = (
            f"You are a recommendation engine for Servo, a student service marketplace. "
            f"Given the user's profile: {json.dumps(profile_summary)} "
            f"and a list of available campus services: {json.dumps(services_summary)}, "
            f"recommend the most relevant services. "
            f"Return a JSON list of service IDs sorted by relevance (highest relevance first). "
            f"Return ONLY the raw JSON list of integers like [3, 1, 5]."
        )
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif text_response.startswith("```"):
            text_response = text_response.split("```")[1].split("```")[0].strip()
            
        result = json.loads(text_response)
        if isinstance(result, list):
            return [int(x) for x in result]
        return [s.get("id") for s in services]
    except Exception as e:
        print(f"Gemini API Error in recommendations: {e}")
        return [s.get("id") for s in services]


def suggest_profile_improvements(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    AI Feature 4: Suggests improvements for a user's profile based on their skills, bio, and descriptions.
    """
    if not is_gemini_active:
        # Fallback suggestions
        skills = user_profile.get("skills", [])
        missing = []
        if "React" not in skills and "HTML" not in skills:
            missing.append("React.js & Frontend Styling")
        if "Python" not in skills and "Java" not in skills:
            missing.append("Object-Oriented Programming (Python/Java)")
        if "DSA" not in skills:
            missing.append("Data Structures & Algorithms")
        if not missing:
            missing = ["Advanced AI Deployment", "Docker & CI/CD Pipelines"]
            
        bio = user_profile.get("bio") or ""
        better_bio = (
            f"Hi! I'm a specialized developer studying {user_profile.get('branch', 'Engineering')}. "
            f"I have hands-on experience building web application systems. "
            f"Looking to support peers with high-quality assignment code, resume reviews, and tutoring sessions."
        )
        
        return {
            "missing_skills": missing,
            "portfolio_improvements": [
                "Link at least 2 active GitHub repositories showcasing code readability.",
                "Upload a high-quality PDF Resume detailing academic projects.",
                "Include project images with descriptions to demonstrate visual UI excellence."
            ],
            "better_service_description": better_bio
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"Analyze the following student profile on Servo: {json.dumps(user_profile)}. "
            f"Provide actionable suggestions to improve the profile:\n"
            f"1. A list of 2-3 missing skills that would make them more employable on campus.\n"
            f"2. A list of 2-3 portfolio improvement suggestions (e.g. GitHub links, certificates).\n"
            f"3. A rewritten, professional bio/service description.\n\n"
            f"Respond STRICTLY in JSON format with three keys: 'missing_skills', 'portfolio_improvements', 'better_service_description'."
        )
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response.split("```json")[1].split("```")[0].strip()
        elif text_response.startswith("```"):
            text_response = text_response.split("```")[1].split("```")[0].strip()
            
        return json.loads(text_response)
    except Exception as e:
        print(f"Gemini API Error in profile suggestions: {e}")
        return {
            "missing_skills": ["React.js", "Docker"],
            "portfolio_improvements": ["Add GitHub repository links", "Upload a professional resume PDF"],
            "better_service_description": "Passionate developer looking to solve technical problems on campus."
        }

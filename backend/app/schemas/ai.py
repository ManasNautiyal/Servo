from pydantic import BaseModel
from typing import List

class DescriptionGeneratorRequest(BaseModel):
    brief: str  # e.g., "I teach Python, focus on OOP and algorithms"

class DescriptionGeneratorResponse(BaseModel):
    generated_description: str

class SkillExtractionResponse(BaseModel):
    skills: List[str]
    technologies: List[str]
    domains: List[str]

class ProfileSuggestionResponse(BaseModel):
    missing_skills: List[str]
    portfolio_improvements: List[str]
    better_service_description: str

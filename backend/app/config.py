import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database Configuration
    # Fallback to local SQLite if PostgreSQL is not active, for ease of development/testing
    DATABASE_URL: str = "sqlite:///./servo.db"
    
    # Security Configuration
    JWT_SECRET: str = "supersecretjwtsecretkeychangeinproduction123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Supabase (Optional for local testing, fallback to mock if credentials missing)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_BUCKET: str = "servo-storage"
    
    # Gemini AI API Key (Optional, fallback to mock responses if not set)
    GEMINI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

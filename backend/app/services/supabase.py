import os
import uuid
import httpx
from typing import Optional
from fastapi import UploadFile
from app.config import settings

UPLOAD_DIR = os.path.join(os.getcwd(), "static", "uploads")

# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_file_to_storage(file: UploadFile, folder: str = "general") -> str:
    """
    Uploads a file to Supabase storage if credentials exist.
    Otherwise, saves the file locally to backend/static/uploads/ for easy local development.
    """
    file_content = await file.read()
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
    
    # 1. Check if Supabase storage configuration is available
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            # Construct the supabase storage rest URL
            # POST: {supabase_url}/storage/v1/object/{bucket}/{filename}
            url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/{settings.SUPABASE_BUCKET}/{unique_filename}"
            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "apikey": settings.SUPABASE_KEY,
                "Content-Type": file.content_type or "application/octet-stream"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, content=file_content)
                if response.status_code == 200:
                    # Return public URL of the uploaded object
                    # Public URL format: {supabase_url}/storage/v1/object/public/{bucket}/{filename}
                    public_url = f"{settings.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{unique_filename}"
                    return public_url
                else:
                    print(f"Supabase storage upload failed: {response.text}. Falling back to local storage.")
        except Exception as e:
            print(f"Supabase upload error: {e}. Falling back to local storage.")
            
    # 2. Local fallback storage
    # Create folder directories if needed
    local_folder = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(local_folder, exist_ok=True)
    
    filename_only = f"{uuid.uuid4()}{file_extension}"
    local_path = os.path.join(local_folder, filename_only)
    
    with open(local_path, "wb") as f:
        f.write(file_content)
        
    # Return path relative to server root
    return f"/static/uploads/{folder}/{filename_only}"

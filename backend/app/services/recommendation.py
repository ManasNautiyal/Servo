import re
import logging
from typing import List, Dict, Any, Union

# Configure Logger for recommendation service module
logger = logging.getLogger(__name__)

# Delay scikit-learn imports to runtime or catch ImportError for environment safety
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


def clean_text(text: str) -> str:
    """
    Cleans raw text by removing punctuation, special characters, 
    lowercasing, and removing redundant whitespaces.
    
    Args:
        text (str): Raw unstructured text content.
        
    Returns:
        str: Cleaned and normalized text.
    """
    if not text or not isinstance(text, str):
        return ""
    # Lowercase
    cleaned = text.lower()
    # Replace special characters/punctuation with space
    cleaned = re.sub(r"[^\w\s]", " ", cleaned)
    # Remove extra whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def build_user_profile_document(user_profile: Union[Dict[str, Any], Any]) -> str:
    """
    Aggregates user branch, bio, and skills list into a single normalized document string.
    Supports both Python dictionaries and object instances (e.g. SQLAlchemy model instances).
    
    Args:
        user_profile (Union[Dict[str, Any], Any]): The user data mapping or object instance.
        
    Returns:
        str: Combined and cleaned preference document.
    """
    if not user_profile:
        return ""
        
    components = []
    
    # 1. Fetch and clean branch
    branch = (
        user_profile.get("branch") 
        if isinstance(user_profile, dict) 
        else getattr(user_profile, "branch", None)
    )
    if branch:
        components.append(str(branch))
        
    # 2. Fetch and clean bio
    bio = (
        user_profile.get("bio") 
        if isinstance(user_profile, dict) 
        else getattr(user_profile, "bio", None)
    )
    if bio:
        components.append(str(bio))
        
    # 3. Fetch and clean skills
    skills = (
        user_profile.get("skills") 
        if isinstance(user_profile, dict) 
        else getattr(user_profile, "skills", None)
    )
    
    if isinstance(skills, list):
        for s in skills:
            # Handle potential Skill objects or raw string formats
            if isinstance(s, str):
                components.append(s)
            elif s is not None:
                # Fallback check for SQLAlchemy Skill.skill_name attribute
                skill_name = getattr(s, "skill_name", None)
                if skill_name:
                    components.append(str(skill_name))
    elif isinstance(skills, str):
        components.append(skills)
        
    text_content = " ".join(components)
    return clean_text(text_content)


def build_service_document(service: Union[Dict[str, Any], Any]) -> str:
    """
    Aggregates service title, description, category, and tags into a single normalized document string.
    Supports both Python dictionaries and object instances (e.g. SQLAlchemy model instances).
    
    Args:
        service (Union[Dict[str, Any], Any]): The service data mapping or object instance.
        
    Returns:
        str: Combined and cleaned service document.
    """
    if not service:
        return ""
        
    components = []
    
    # 1. Title
    title = (
        service.get("title") 
        if isinstance(service, dict) 
        else getattr(service, "title", None)
    )
    if title:
        components.append(str(title))
        
    # 2. Description
    description = (
        service.get("description") 
        if isinstance(service, dict) 
        else getattr(service, "description", None)
    )
    if description:
        components.append(str(description))
        
    # 3. Category
    category = (
        service.get("category") 
        if isinstance(service, dict) 
        else getattr(service, "category", None)
    )
    if category:
        components.append(str(category))
        
    # 4. Tags
    tags = (
        service.get("tags") 
        if isinstance(service, dict) 
        else getattr(service, "tags", None)
    )
    if isinstance(tags, list):
        components.extend([str(t) for t in tags])
    elif isinstance(tags, str):
        # Handle comma-separated tags string format
        split_tags = [t.strip() for t in tags.split(",") if t.strip()]
        components.extend(split_tags)
        
    text_content = " ".join(components)
    return clean_text(text_content)


def get_content_recommendations(
    user_profile: Union[Dict[str, Any], Any], 
    services: List[Union[Dict[str, Any], Any]], 
    top_n: int = 6
) -> List[Dict[str, Any]]:
    """
    Calculates TF-IDF similarity vectors between the user's profile document and 
    available service documents, returning the top N sorted recommendations as dictionaries.
    Supports both dict and object formats for inputs.
    
    Args:
        user_profile (Union[Dict[str, Any], Any]): The active user's profile.
        services (List[Union[Dict[str, Any], Any]]): The list of candidate services to recommend.
        top_n (int): Max number of recommended items to return.
        
    Returns:
        List[Dict[str, Any]]: List of recommended service dictionaries sorted by similarity score.
    """
    if not services or not user_profile:
        return []
        
    # Determine user id to skip recommending the user's own services
    user_id = (
        user_profile.get("id") 
        if isinstance(user_profile, dict) 
        else getattr(user_profile, "id", None)
    )
    
    candidate_services: List[Dict[str, Any]] = []
    
    # Standardize and copy objects to dict representation
    for s in services:
        if s is None:
            continue
            
        provider_id = (
            s.get("provider_id") 
            if isinstance(s, dict) 
            else getattr(s, "provider_id", None)
        )
        
        # Skip user's own services
        if user_id is not None and provider_id == user_id:
            continue
            
        # Convert object or duplicate dict to isolate mutations
        if isinstance(s, dict):
            s_copy = s.copy()
        else:
            s_copy = {
                "id": getattr(s, "id", None),
                "provider_id": provider_id,
                "title": getattr(s, "title", None),
                "description": getattr(s, "description", None),
                "category": getattr(s, "category", None),
                "tags": getattr(s, "tags", None),
                "price": getattr(s, "price", 0.0),
                "delivery_time": getattr(s, "delivery_time", 1),
                "image_url": getattr(s, "image_url", None),
                "status": getattr(s, "status", "available")
            }
        candidate_services.append(s_copy)
        
    if not candidate_services:
        return []

    # Fallback if Scikit-Learn is not installed in the execution environment
    if not SKLEARN_AVAILABLE:
        logger.warning("Scikit-Learn or NumPy is not available. Falling back to default ordering.")
        for service in candidate_services:
            service["similarity_score"] = 0.0
        return candidate_services[:top_n]

    try:
        # Build document vectors
        user_doc = build_user_profile_document(user_profile)
        service_docs = [build_service_document(s) for s in candidate_services]
        
        # Guard against completely empty document spaces
        if not user_doc and not any(service_docs):
            for service in candidate_services:
                service["similarity_score"] = 0.0
            return candidate_services[:top_n]
            
        # Combine user document and service documents to fit the vocabulary space
        corpus = [user_doc] + service_docs
        
        # Vectorize text corpus using TF-IDF representation
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # User vector is index 0
        user_vector = tfidf_matrix[0]
        # Service vectors are indices 1 onwards
        service_vectors = tfidf_matrix[1:]
        
        # Compute pairwise cosine similarity between user vector and services matrix
        similarity_scores = cosine_similarity(user_vector, service_vectors).flatten()
        
        # Assign similarity scores back to service dictionaries
        for idx, score in enumerate(similarity_scores):
            candidate_services[idx]["similarity_score"] = float(score)
            
        # Sort candidate services by similarity score descending, and resolve ties by service id
        candidate_services.sort(
            key=lambda x: (x.get("similarity_score", 0.0), -x.get("id", 0) if x.get("id") is not None else 0), 
            reverse=True
        )
        
        return candidate_services[:top_n]
        
    except Exception as e:
        logger.exception("Content-based recommendation pipeline encountered a runtime error")
        # Return default services on failure with score of 0.0
        for service in candidate_services:
            if "similarity_score" not in service:
                service["similarity_score"] = 0.0
        return candidate_services[:top_n]

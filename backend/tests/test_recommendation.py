from app.services.recommendation import (
    clean_text,
    build_user_profile_document,
    build_service_document,
    get_content_recommendations,
    SKLEARN_AVAILABLE
)

# Mock classes to simulate database model behavior (SQLAlchemy objects)
class MockSkill:
    def __init__(self, skill_name):
        self.skill_name = skill_name

class MockUser:
    def __init__(self, user_id, branch, bio, skills):
        self.id = user_id
        self.branch = branch
        self.bio = bio
        self.skills = skills

class MockService:
    def __init__(self, service_id, provider_id, title, description, category, tags):
        self.id = service_id
        self.provider_id = provider_id
        self.title = title
        self.description = description
        self.category = category
        self.tags = tags


def test_clean_text():
    """Test text cleaning helper for correct stripping and formatting."""
    # Test typical cases
    assert clean_text("Hello, World! React.js and Python...") == "hello world react js and python"
    # Test None and empty inputs
    assert clean_text(None) == ""
    assert clean_text("") == ""
    # Test numeric values or types that are not string
    assert clean_text(12345) == ""


def test_build_user_profile_document_dict():
    """Test assembling preference document from user profile dictionaries."""
    mock_user_dict = {
        "branch": "Computer Science",
        "bio": "Enthusiastic developer",
        "skills": ["Python", "Flask", "React"]
    }
    expected = "computer science enthusiastic developer python flask react"
    assert build_user_profile_document(mock_user_dict) == expected


def test_build_user_profile_document_obj():
    """Test assembling preference document from user profile class objects (SQLAlchemy models)."""
    mock_user_obj = MockUser(
        user_id=1,
        branch="Electronics",
        bio="Embedded system designer",
        skills=[MockSkill("C++"), MockSkill("Arduino")]
    )
    expected = "electronics embedded system designer c arduino"
    assert build_user_profile_document(mock_user_obj) == expected


def test_build_service_document_dict():
    """Test assembling service document from service dictionaries."""
    mock_service_dict = {
        "title": "Machine Learning Model Setup",
        "description": "I help with writing regression models and pandas preprocessing scripts.",
        "category": "Technical",
        "tags": "python, ml, machine-learning"
    }
    expected = "machine learning model setup i help with writing regression models and pandas preprocessing scripts technical python ml machine learning"
    assert build_service_document(mock_service_dict) == expected


def test_build_service_document_obj():
    """Test assembling service document from service class objects (SQLAlchemy models)."""
    mock_service_obj = MockService(
        service_id=10,
        provider_id=3,
        title="Web Design Customization",
        description="HTML and CSS formatting styling service.",
        category="Creative",
        tags="css,html,design"
    )
    expected = "web design customization html and css formatting styling service creative css html design"
    assert build_service_document(mock_service_obj) == expected


def test_get_content_recommendations_dict():
    """Test recommendation engine ranking logic using dictionary inputs."""
    user = {
        "id": 1,
        "branch": "Computer Science",
        "bio": "I write code in Python and Javascript, specializing in React and APIs",
        "skills": ["Python", "JavaScript", "React"]
    }
    
    services = [
        {
            "id": 101,
            "provider_id": 2,
            "title": "React Frontend Development",
            "description": "I construct beautiful web frontend layouts using React.js",
            "category": "Technical",
            "tags": "react, front-end"
        },
        {
            "id": 102,
            "provider_id": 2,
            "title": "Logo Design Services",
            "description": "Custom high-quality vectors with Adobe Illustrator.",
            "category": "Creative",
            "tags": "illustrator, logo"
        },
        {
            "id": 103,
            "provider_id": 1,  # Owned by the user, must be filtered out
            "title": "Python Scripting Utility",
            "description": "Custom automation scripts written in clean Python.",
            "category": "Technical",
            "tags": "python, scripts"
        }
    ]
    
    results = get_content_recommendations(user, services, top_n=2)
    
    # Assertions
    assert len(results) <= 2
    assert all(r["id"] != 103 for r in results), "User's own service was recommended"
    
    if SKLEARN_AVAILABLE:
        # React listing (101) must rank higher than Logo Design (102) due to skills overlap
        assert results[0]["id"] == 101
        assert results[0]["similarity_score"] > 0.0
        assert results[1]["id"] == 102
        assert results[0]["similarity_score"] > results[1]["similarity_score"]


def test_get_content_recommendations_obj():
    """Test recommendation engine logic using object inputs (database model lists)."""
    user = MockUser(
        user_id=1,
        branch="Electrical",
        bio="Circuit building and Arduino micro-controllers",
        skills=[MockSkill("Arduino"), MockSkill("C++")]
    )
    
    services = [
        MockService(
            service_id=201,
            provider_id=3,
            title="Custom PCB Design",
            description="Schema routing and PCB layouts in Altium and Arduino code.",
            category="Technical",
            tags="pcb, arduino, circuit"
        ),
        MockService(
            service_id=202,
            provider_id=3,
            title="Resume Writing Advice",
            description="Professional feedback for tech job placement applications.",
            category="Career",
            tags="resume, placement"
        )
    ]
    
    results = get_content_recommendations(user, services, top_n=2)
    
    assert len(results) == 2
    assert isinstance(results[0], dict), "Output services are not dictionaries"
    
    if SKLEARN_AVAILABLE:
        assert results[0]["id"] == 201
        assert results[1]["id"] == 202
        assert results[0]["similarity_score"] > results[1]["similarity_score"]


def test_recommendation_empty_graceful_handling():
    """Test graceful responses when encountering None or empty data matrices."""
    # Test empty inputs
    assert get_content_recommendations(None, []) == []
    assert get_content_recommendations({"id": 1}, []) == []
    assert get_content_recommendations(None, [{"id": 101}]) == []
    
    # Test missing fields handles safely
    user = {"id": 1} # No branch, no bio, no skills
    services = [{"id": 101, "provider_id": 2}] # No title, no description, no tags
    results = get_content_recommendations(user, services)
    assert len(results) == 1
    assert results[0]["similarity_score"] == 0.0


if __name__ == "__main__":
    print("Running recommendation tests...")
    try:
        import pytest
        import sys
        print("[INFO] pytest available. Running through pytest...")
        sys.exit(pytest.main(sys.argv))
    except ImportError:
        print("[INFO] pytest not available. Executing tests sequentially...")
        # Run manually
        test_clean_text()
        print("- test_clean_text passed.")
        test_build_user_profile_document_dict()
        print("- test_build_user_profile_document_dict passed.")
        test_build_user_profile_document_obj()
        print("- test_build_user_profile_document_obj passed.")
        test_build_service_document_dict()
        print("- test_build_service_document_dict passed.")
        test_build_service_document_obj()
        print("- test_build_service_document_obj passed.")
        test_get_content_recommendations_dict()
        print("- test_get_content_recommendations_dict passed.")
        test_get_content_recommendations_obj()
        print("- test_get_content_recommendations_obj passed.")
        test_recommendation_empty_graceful_handling()
        print("- test_recommendation_empty_graceful_handling passed.")
        print("[OK] All tests passed successfully.")

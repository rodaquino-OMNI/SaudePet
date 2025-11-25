"""
Pytest configuration and fixtures for PetVet AI Services tests.
"""
import os
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

# Set test environment variables
os.environ["ENVIRONMENT"] = "test"
os.environ["PORT"] = "8000"
os.environ["REDIS_URL"] = "redis://localhost:6379"
os.environ["OPENAI_API_KEY"] = "test-openai-key"
os.environ["ANTHROPIC_API_KEY"] = "test-anthropic-key"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://localhost:5173"


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock_client = MagicMock()
    mock_client.chat.completions.create = AsyncMock(
        return_value=MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content="This is a mock AI response for testing purposes."
                    )
                )
            ]
        )
    )
    return mock_client


@pytest.fixture
def mock_redis_client():
    """Mock Redis client for testing."""
    mock_client = MagicMock()
    mock_client.get = AsyncMock(return_value=None)
    mock_client.set = AsyncMock(return_value=True)
    mock_client.delete = AsyncMock(return_value=1)
    mock_client.expire = AsyncMock(return_value=True)
    return mock_client


@pytest.fixture
def test_client():
    """Create a test client for the FastAPI app."""
    from src.main import app

    with TestClient(app) as client:
        yield client


@pytest.fixture
def sample_symptom_data():
    """Sample symptom data for testing diagnosis endpoints."""
    return {
        "pet_type": "dog",
        "pet_age": "5 years",
        "pet_breed": "Golden Retriever",
        "symptoms": ["lethargy", "loss of appetite", "vomiting"],
        "duration": "2 days",
        "additional_info": "Started after eating something in the park",
    }


@pytest.fixture
def sample_nlp_data():
    """Sample NLP data for testing text processing endpoints."""
    return {
        "text": "My dog hasn't been eating well for the past two days and seems very tired.",
        "language": "en",
    }

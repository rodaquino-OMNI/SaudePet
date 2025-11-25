"""
Health check endpoints.
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "petvet-ai-services",
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with dependencies."""
    # TODO: Check Redis connection, LLM provider availability
    return {
        "status": "healthy",
        "service": "petvet-ai-services",
        "checks": {
            "openai": "healthy",
            "anthropic": "healthy",
            "redis": "healthy",
        },
    }

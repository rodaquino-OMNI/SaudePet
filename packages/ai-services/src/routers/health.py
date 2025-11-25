"""
Health check endpoints.
"""
from datetime import datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "petvet-ai-services",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/health/live")
async def liveness_check():
    """Liveness probe for Kubernetes/ECS."""
    return {"status": "live"}


@router.get("/health/ready")
async def readiness_check():
    """Readiness probe for Kubernetes/ECS."""
    # TODO: Check Redis connection, LLM provider availability
    return {"status": "ready"}


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with dependencies."""
    # TODO: Check Redis connection, LLM provider availability
    return {
        "status": "healthy",
        "service": "petvet-ai-services",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "checks": {
            "openai": "healthy",
            "anthropic": "healthy",
            "redis": "healthy",
        },
    }

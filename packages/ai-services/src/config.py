"""
Configuration settings for PetVet AI Services.
"""
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Environment
    environment: str = "development"
    port: int = 8000
    log_level: str = "INFO"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4-turbo-preview"

    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-opus-20240229"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Cache settings
    cache_ttl_seconds: int = 3600  # 1 hour

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

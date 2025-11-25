"""
Tests for health check endpoints.
"""
import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoints:
    """Test cases for health check endpoints."""

    def test_root_endpoint(self, test_client: TestClient):
        """Test the root endpoint returns service info."""
        response = test_client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "petvet-ai-services"
        assert data["version"] == "1.0.0"
        assert data["status"] == "running"

    def test_health_endpoint(self, test_client: TestClient):
        """Test the health endpoint returns healthy status."""
        response = test_client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["service"] == "petvet-ai-services"

    def test_health_live_endpoint(self, test_client: TestClient):
        """Test the liveness probe endpoint."""
        response = test_client.get("/health/live")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "live"

    def test_health_ready_endpoint(self, test_client: TestClient):
        """Test the readiness probe endpoint."""
        response = test_client.get("/health/ready")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"


class TestHealthResponseFormat:
    """Test cases for health response format validation."""

    def test_health_response_has_required_fields(self, test_client: TestClient):
        """Test that health response contains all required fields."""
        response = test_client.get("/health")
        data = response.json()

        required_fields = ["status", "timestamp", "service"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_health_timestamp_format(self, test_client: TestClient):
        """Test that timestamp is in valid ISO format."""
        response = test_client.get("/health")
        data = response.json()

        # Check timestamp contains expected ISO format characters
        timestamp = data["timestamp"]
        assert "T" in timestamp or "-" in timestamp

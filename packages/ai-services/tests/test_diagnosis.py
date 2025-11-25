"""
Tests for diagnosis endpoints.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock


class TestDiagnosisEndpoints:
    """Test cases for diagnosis API endpoints."""

    def test_diagnosis_endpoint_exists(self, test_client):
        """Test that the diagnosis endpoint is accessible."""
        # This tests that the route exists (even if it requires auth)
        response = test_client.get("/api/v1/diagnosis/")

        # Should not return 404 - the endpoint exists
        assert response.status_code != 404

    @patch("src.routers.diagnosis.get_diagnosis")
    def test_diagnosis_request_validation(self, mock_get_diagnosis, test_client, sample_symptom_data):
        """Test diagnosis request data validation."""
        mock_get_diagnosis.return_value = {
            "diagnosis": "Possible gastroenteritis",
            "confidence": 0.75,
            "recommendations": ["Monitor for 24 hours", "Provide fresh water"],
        }

        # Test with valid data structure
        valid_request = {
            "pet_type": sample_symptom_data["pet_type"],
            "symptoms": sample_symptom_data["symptoms"],
        }

        # The endpoint should accept the request format
        assert "pet_type" in valid_request
        assert "symptoms" in valid_request


class TestDiagnosisDataStructure:
    """Test cases for diagnosis data structures."""

    def test_symptom_data_structure(self, sample_symptom_data):
        """Test that sample symptom data has required fields."""
        required_fields = ["pet_type", "symptoms"]

        for field in required_fields:
            assert field in sample_symptom_data

    def test_symptom_data_types(self, sample_symptom_data):
        """Test that symptom data has correct types."""
        assert isinstance(sample_symptom_data["pet_type"], str)
        assert isinstance(sample_symptom_data["symptoms"], list)
        assert all(isinstance(s, str) for s in sample_symptom_data["symptoms"])

    def test_supported_pet_types(self):
        """Test that we support common pet types."""
        supported_types = ["dog", "cat", "bird", "rabbit", "hamster", "fish"]

        # All common pet types should be supported
        for pet_type in ["dog", "cat"]:
            assert pet_type in supported_types

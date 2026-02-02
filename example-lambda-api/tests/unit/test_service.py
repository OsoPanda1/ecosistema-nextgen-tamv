"""
Unit tests for service layer following cloud-architect testing strategy.
Fast execution with mocks for external dependencies.
"""

import pytest
from src.functions.service import ApiService
from src.functions.models import ApiRequest


class TestApiService:
    """Unit tests for ApiService following cloud-architect guidelines."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = ApiService()
    
    def test_handle_health_check(self):
        """Test health check endpoint returns correct response."""
        # Arrange
        request = ApiRequest(path="/health", method="GET")
        
        # Act
        response = self.service.handle_request(request)
        
        # Assert
        assert response.status_code == 200
        assert response.body["status"] == "healthy"
        assert response.body["service"] == "lambda-api"
    
    def test_handle_root_endpoint(self):
        """Test root endpoint returns welcome message."""
        # Arrange
        request = ApiRequest(path="/", method="GET")
        
        # Act
        response = self.service.handle_request(request)
        
        # Assert
        assert response.status_code == 200
        assert "Welcome to Lambda API" in response.body["message"]
        assert "endpoints" in response.body
    
    def test_handle_unknown_endpoint(self):
        """Test unknown endpoint returns 404."""
        # Arrange
        request = ApiRequest(path="/unknown", method="GET")
        
        # Act
        response = self.service.handle_request(request)
        
        # Assert
        assert response.status_code == 404
        assert "not found" in response.body["error"].lower()
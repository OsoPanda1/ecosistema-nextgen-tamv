"""
Integration tests for Lambda handler following remocal testing strategy.
Tests Lambda code locally with real AWS service integration.
"""

import json
import pytest
from src.functions.handler import main


class TestLambdaHandler:
    """
    Integration tests for Lambda handler.
    Follows cloud-architect remocal testing approach.
    """
    
    def test_health_check_integration(self):
        """Test health check endpoint through full handler."""
        # Arrange - API Gateway event format
        event = {
            "path": "/health",
            "httpMethod": "GET",
            "headers": {"Content-Type": "application/json"},
            "queryStringParameters": None,
            "body": None
        }
        context = {}  # Mock Lambda context
        
        # Act
        response = main(event, context)
        
        # Assert
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["status"] == "healthy"
        assert "Content-Type" in response["headers"]
    
    def test_root_endpoint_integration(self):
        """Test root endpoint through full handler."""
        # Arrange
        event = {
            "path": "/",
            "httpMethod": "GET",
            "headers": {},
            "queryStringParameters": None,
            "body": None
        }
        context = {}
        
        # Act
        response = main(event, context)
        
        # Assert
        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert "Welcome to Lambda API" in body["message"]
    
    def test_error_handling_integration(self):
        """Test error handling through full handler."""
        # Arrange - malformed event to trigger error
        event = {}  # Missing required fields
        context = {}
        
        # Act
        response = main(event, context)
        
        # Assert
        assert response["statusCode"] == 500
        body = json.loads(response["body"])
        assert "error" in body
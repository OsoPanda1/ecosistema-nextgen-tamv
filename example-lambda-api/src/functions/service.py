"""
Service layer: Business logic and AWS service integrations.
Can be shared across multiple Lambda handlers.
"""

from aws_lambda_powertools import Logger
from models import ApiRequest, ApiResponse

logger = Logger()


class ApiService:
    """
    Service layer containing business logic.
    Follows cloud-architect guidelines for separation of concerns.
    """
    
    def handle_request(self, request: ApiRequest) -> ApiResponse:
        """
        Process the API request and return appropriate response.
        
        Args:
            request: Validated API request model
            
        Returns:
            ApiResponse: Formatted response
        """
        logger.info("Processing request in service layer")
        
        if request.path == "/health":
            return self._handle_health_check()
        elif request.path == "/":
            return self._handle_root()
        else:
            return self._handle_not_found()
    
    def _handle_health_check(self) -> ApiResponse:
        """Handle health check endpoint."""
        return ApiResponse(
            status_code=200,
            body={"status": "healthy", "service": "lambda-api"},
            headers={"Content-Type": "application/json"}
        )
    
    def _handle_root(self) -> ApiResponse:
        """Handle root endpoint."""
        return ApiResponse(
            status_code=200,
            body={
                "message": "Welcome to Lambda API",
                "version": "1.0.0",
                "endpoints": ["/", "/health"]
            },
            headers={"Content-Type": "application/json"}
        )
    
    def _handle_not_found(self) -> ApiResponse:
        """Handle unknown endpoints."""
        return ApiResponse(
            status_code=404,
            body={"error": "Endpoint not found"},
            headers={"Content-Type": "application/json"}
        )
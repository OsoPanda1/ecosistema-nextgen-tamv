"""
Model layer: Pydantic models for request/response validation.
Can be shared across multiple Lambda handlers and services.
"""

import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ApiRequest(BaseModel):
    """
    API request model following cloud-architect guidelines.
    Provides input validation and type safety.
    """
    path: str = Field(..., description="Request path")
    method: str = Field(..., description="HTTP method")
    headers: Dict[str, str] = Field(default_factory=dict, description="Request headers")
    query_parameters: Dict[str, str] = Field(default_factory=dict, description="Query parameters")
    body: Optional[str] = Field(None, description="Request body")
    
    @classmethod
    def from_event(cls, event: Dict[str, Any]) -> "ApiRequest":
        """
        Create ApiRequest from Lambda event.
        
        Args:
            event: Lambda event dictionary
            
        Returns:
            ApiRequest: Validated request model
        """
        return cls(
            path=event.get("path", "/"),
            method=event.get("httpMethod", "GET"),
            headers=event.get("headers", {}),
            query_parameters=event.get("queryStringParameters") or {},
            body=event.get("body")
        )


class ApiResponse(BaseModel):
    """
    API response model for consistent response formatting.
    """
    status_code: int = Field(..., description="HTTP status code")
    body: Dict[str, Any] = Field(..., description="Response body")
    headers: Dict[str, str] = Field(default_factory=dict, description="Response headers")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert to Lambda response format.
        
        Returns:
            Dict: Lambda-compatible response
        """
        return {
            "statusCode": self.status_code,
            "body": json.dumps(self.body),
            "headers": {
                "Content-Type": "application/json",
                **self.headers
            }
        }
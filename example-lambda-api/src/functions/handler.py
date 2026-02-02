"""
Lambda handler following cloud-architect layered architecture.
Handler layer -> Service layer -> Model layer pattern.
"""

import json
import logging
from typing import Dict, Any
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.logging import correlation_paths
from aws_lambda_powertools.metrics import MetricUnit

from service import ApiService
from models import ApiRequest, ApiResponse

# Initialize AWS Powertools
logger = Logger()
tracer = Tracer()
metrics = Metrics()


@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_REST)
@tracer.capture_lambda_handler
@metrics.log_metrics(capture_cold_start_metric=True)
def main(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler layer: Input validation, initialization, and response formatting.
    Follows cloud-architect guidelines for Lambda design.
    """
    try:
        # Parse and validate input
        api_request = ApiRequest.from_event(event)
        logger.info("Processing request", extra={"path": api_request.path})
        
        # Initialize service layer
        service = ApiService()
        
        # Process request through service layer
        response = service.handle_request(api_request)
        
        # Add custom metric
        metrics.add_metric(name="SuccessfulRequests", unit=MetricUnit.Count, value=1)
        
        # Return formatted response
        return response.to_dict()
        
    except Exception as e:
        logger.exception("Request processing failed")
        metrics.add_metric(name="FailedRequests", unit=MetricUnit.Count, value=1)
        
        error_response = ApiResponse(
            status_code=500,
            body={"error": "Internal server error"},
            headers={"Content-Type": "application/json"}
        )
        return error_response.to_dict()
"""
Lambda API Stack following cloud-architect power best practices.
Single stack design with clear interfaces and L2 constructs.
"""

from typing import Dict, Any
from aws_cdk import (
    Stack,
    StackProps,
    Duration,
    aws_lambda as lambda_,
    aws_apigateway as apigateway,
    aws_logs as logs
)
from constructs import Construct


class LambdaApiStackProps(StackProps):
    """Stack properties with clear interface."""
    config: Dict[str, Any]


class LambdaApiStack(Stack):
    """
    Single stack for Lambda API service.
    Follows cloud-architect guidelines for CDK design.
    """

    def __init__(
        self, 
        scope: Construct, 
        construct_id: str, 
        config: Dict[str, Any],
        **kwargs
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        self.config = config
        
        # Create Lambda function using L2 construct
        self._create_lambda_function()
        
        # Create API Gateway using L2 construct
        self._create_api_gateway()

    def _create_lambda_function(self) -> None:
        """Create the Lambda function with proper configuration."""
        self.lambda_function = lambda_.Function(
            self,
            "ApiHandlerFunction",  # Logical ID describes purpose
            runtime=lambda_.Runtime.PYTHON_3_11,
            handler="handler.main",
            code=lambda_.Code.from_asset("src/functions"),
            memory_size=self.config["memory_size"],
            timeout=Duration.seconds(self.config["timeout"]),
            environment={
                "LOG_LEVEL": self.config["log_level"]
            },
            log_retention=logs.RetentionDays.ONE_WEEK
        )

    def _create_api_gateway(self) -> None:
        """Create API Gateway with Lambda integration."""
        self.api = apigateway.RestApi(
            self,
            "ApiGateway",
            rest_api_name="Lambda API Service",
            description="Simple API powered by Lambda",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS
            )
        )
        
        # Create Lambda integration
        lambda_integration = apigateway.LambdaIntegration(
            self.lambda_function,
            request_templates={"application/json": '{ "statusCode": "200" }'}
        )
        
        # Add resource and method
        self.api.root.add_method("GET", lambda_integration)
        
        # Add health check endpoint
        health = self.api.root.add_resource("health")
        health.add_method("GET", lambda_integration)
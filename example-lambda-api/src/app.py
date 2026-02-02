#!/usr/bin/env python3
"""
CDK App entry point for a simple Lambda API service.
Following cloud-architect power guidelines.
"""

import aws_cdk as cdk
from stack import LambdaApiStack

# Environment configuration
dev_config = {
    "memory_size": 128,
    "timeout": 30,
    "log_level": "DEBUG"
}

prod_config = {
    "memory_size": 256,
    "timeout": 10,
    "log_level": "INFO"
}

app = cdk.App()

# Development environment
LambdaApiStack(
    app, 
    "lambda-api-dev",
    env=cdk.Environment(
        account="123456789012",  # Replace with your account
        region="us-east-1"
    ),
    config=dev_config
)

# Production environment
LambdaApiStack(
    app, 
    "lambda-api-prod",
    env=cdk.Environment(
        account="123456789012",  # Replace with your account
        region="us-east-1"
    ),
    config=prod_config
)

app.synth()
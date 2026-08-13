"""
AWS Database Client Abstraction.
Supports AWS RDS (PostgreSQL/MySQL via SQLAlchemy) and AWS DynamoDB via Boto3.
All credentials come from environment variables.
"""
import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from app.core.config import settings
from app.core.logger import logger

class AWSDBClient:
    def __init__(self):
        self.region = settings.AWS_REGION
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        self.db_type = settings.AWS_DATABASE_TYPE
        self._dynamo_client = None

    def get_dynamodb_resource(self):
        if not self._dynamo_client:
            try:
                kwargs = {"region_name": self.region}
                if self.access_key and self.secret_key:
                    kwargs["aws_access_key_id"] = self.access_key
                    kwargs["aws_secret_access_key"] = self.secret_key
                
                self._dynamo_client = boto3.resource('dynamodb', **kwargs)
                logger.info("Successfully connected to AWS DynamoDB resource.")
            except (BotoCoreError, ClientError) as e:
                logger.warning(f"Could not connect to AWS DynamoDB directly: {e}. Falling back to Relational DB mode.")
                return None
        return self._dynamo_client

    def is_aws_configured(self) -> bool:
        return bool(self.access_key and self.secret_key) or self.db_type.startswith("rds")

aws_db_client = AWSDBClient()

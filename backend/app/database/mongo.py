import os
from typing import Optional
from app.core.config import settings
from app.core.logger import logger

class MongoDBManager:
    def __init__(self):
        self.client = None
        self.db = None
        self._disabled = False

    def connect(self):
        if self._disabled:
            return

        try:
            from pymongo import MongoClient
            uri = os.getenv("MONGODB_URI") or settings.MONGODB_URI
            db_name = os.getenv("MONGODB_DB_NAME") or settings.MONGODB_DB_NAME

            if not uri or "<db_username>" in uri:
                return

            self.client = MongoClient(
                uri,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
                socketTimeoutMS=2000
            )
            self.db = self.client[db_name]
            logger.info(f"MongoDB Atlas Cluster connected: {db_name}")
        except Exception as e:
            self._disabled = True
            logger.warning(f"MongoDB connection notice: {e}")

    def get_db(self):
        if self.db is None and not self._disabled:
            self.connect()
        return self.db

    def get_collection(self, name: str):
        db = self.get_db()
        if db is not None:
            try:
                return db[name]
            except Exception:
                return None
        return None

    def save_prediction(self, user_email: str, disease_type: str, risk_score: float, risk_category: str, key_factors: list, input_data: dict, recommendations: dict):
        db = self.get_db()
        if db is not None:
            try:
                from datetime import datetime
                doc = {
                    "user_email": user_email,
                    "disease_type": disease_type,
                    "risk_score": risk_score,
                    "risk_category": risk_category,
                    "key_factors": key_factors,
                    "input_data": input_data,
                    "recommendations": recommendations,
                    "timestamp": str(datetime.now())
                }
                db["risk_predictions"].insert_one(doc)
            except Exception as err:
                logger.warning(f"Notice saving prediction: {err}")

mongo_manager = MongoDBManager()

def get_mongo_db():
    return mongo_manager.get_db()

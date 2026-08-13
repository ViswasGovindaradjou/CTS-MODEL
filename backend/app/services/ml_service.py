import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List
from app.core.config import settings
from app.core.logger import logger

def _patch_model_compat(model):
    """Fixes scikit-learn version differences for unpickled pipelines."""
    if model is None:
        return
    
    if 'SimpleImputer' in type(model).__name__ and not hasattr(model, '_fill_dtype'):
        stats = getattr(model, 'statistics_', None)
        setattr(model, '_fill_dtype', stats.dtype if hasattr(stats, 'dtype') else None)

    for attr in ['transformers_', 'transformers', 'steps']:
        if hasattr(model, attr):
            val = getattr(model, attr)
            if isinstance(val, (list, tuple)):
                for item in val:
                    if isinstance(item, (list, tuple)):
                        for sub in item:
                            if hasattr(sub, '__dict__'):
                                _patch_model_compat(sub)
                    elif hasattr(item, '__dict__'):
                        _patch_model_compat(item)
                        
    if hasattr(model, '__dict__'):
        for k, v in list(model.__dict__.items()):
            if isinstance(v, (list, tuple)):
                for item in v:
                    if isinstance(item, (list, tuple)):
                        for sub in item:
                            if hasattr(sub, '__dict__'):
                                _patch_model_compat(sub)
                    elif hasattr(item, '__dict__'):
                        _patch_model_compat(item)
            elif hasattr(v, '__dict__') and not isinstance(v, (pd.DataFrame, pd.Series, np.ndarray)):
                _patch_model_compat(v)

class MLModelManager:
    def __init__(self):
        self.diabetes_model = None
        self.heart_model = None
        self.brfss_model = None
        self.is_loaded = False

    def load_models(self):
        """Loads all existing .pkl pipelines safely at startup"""
        try:
            model_dir = settings.MODEL_DIR
            if not os.path.exists(model_dir):
                model_dir = settings.BASE_DIR

            diabetes_path = os.path.join(model_dir, 'diabetes_pipeline.pkl')
            heart_path = os.path.join(model_dir, 'heart_pipeline.pkl')
            brfss_path = os.path.join(model_dir, 'brfss_pipeline.pkl')

            logger.info(f"Loading ML models from: {model_dir}")
            
            if os.path.exists(diabetes_path):
                self.diabetes_model = joblib.load(diabetes_path)
                _patch_model_compat(self.diabetes_model)
                logger.info("Loaded diabetes_pipeline.pkl successfully.")
            else:
                logger.error(f"File not found: {diabetes_path}")

            if os.path.exists(heart_path):
                self.heart_model = joblib.load(heart_path)
                _patch_model_compat(self.heart_model)
                logger.info("Loaded heart_pipeline.pkl successfully.")
            else:
                logger.error(f"File not found: {heart_path}")

            if os.path.exists(brfss_path):
                self.brfss_model = joblib.load(brfss_path)
                _patch_model_compat(self.brfss_model)
                logger.info("Loaded brfss_pipeline.pkl successfully.")
            else:
                logger.error(f"File not found: {brfss_path}")

            self.is_loaded = True
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            raise e

    def predict_diabetes(self, input_dict: Dict[str, Any]) -> Tuple[float, str, List[str]]:
        if not self.diabetes_model:
            self.load_models()
        
        # Required features in exact order
        columns = ['preg', 'plas', 'pres', 'skin', 'insu', 'mass', 'pedi', 'age']
        df = pd.DataFrame([{col: input_dict[col] for col in columns}])
        
        # Predict probability
        try:
            prob = float(self.diabetes_model.predict_proba(df)[0, 1])
        except AttributeError:
            pred = int(self.diabetes_model.predict(df)[0])
            prob = 0.85 if pred == 1 else 0.15

        category = "HIGH" if prob >= 0.7 else ("MODERATE" if prob >= 0.3 else "LOW")

        # Identify key risk factors
        key_factors = []
        if input_dict.get('plas', 0) > 140:
            key_factors.append("Elevated Blood Glucose (> 140 mg/dL)")
        if input_dict.get('mass', 0) >= 30:
            key_factors.append("High Body Mass Index (BMI >= 30)")
        if input_dict.get('pres', 0) >= 80:
            key_factors.append("Elevated Diastolic Blood Pressure")
        if input_dict.get('age', 0) >= 45:
            key_factors.append("Age factor (>= 45 years)")
        if input_dict.get('pedi', 0) > 0.5:
            key_factors.append("Strong Diabetes Family History (Pedigree > 0.5)")

        if not key_factors:
            key_factors.append("All primary metrics within normal range")

        return prob, category, key_factors

    def predict_heart_disease(self, input_dict: Dict[str, Any]) -> Tuple[float, str, List[str]]:
        if not self.heart_model:
            self.load_models()
        
        columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        df = pd.DataFrame([{col: input_dict[col] for col in columns}])
        
        try:
            prob = float(self.heart_model.predict_proba(df)[0, 1])
        except AttributeError:
            _patch_model_compat(self.heart_model)
            try:
                prob = float(self.heart_model.predict_proba(df)[0, 1])
            except Exception:
                pred = int(self.heart_model.predict(df)[0])
                prob = 0.85 if pred == 1 else 0.15

        category = "HIGH" if prob >= 0.7 else ("MODERATE" if prob >= 0.3 else "LOW")

        key_factors = []
        if input_dict.get('trestbps', 0) > 130:
            key_factors.append("High Resting Blood Pressure (> 130 mm Hg)")
        if input_dict.get('chol', 0) > 200:
            key_factors.append("Elevated Cholesterol Level (> 200 mg/dL)")
        if input_dict.get('exang', 0) == 1:
            key_factors.append("Exercise-Induced Angina Present")
        if input_dict.get('oldpeak', 0) > 1.5:
            key_factors.append("Significant ST Depression (oldpeak > 1.5)")
        if input_dict.get('cp') in ['asymptomatic', 'typical angina']:
            key_factors.append(f"Chest Pain Type: {input_dict.get('cp')}")
        if input_dict.get('thalach', 200) < 120:
            key_factors.append("Low Maximum Heart Rate (< 120 bpm)")

        if not key_factors:
            key_factors.append("Cardiovascular metrics appear stable")

        return prob, category, key_factors

    def predict_brfss_chronic(self, input_dict: Dict[str, Any]) -> Tuple[float, str, List[str]]:
        if not self.brfss_model:
            self.load_models()

        columns = [
            'HighBP', 'HighChol', 'BMI', 'Smoker', 'Stroke', 'HeartDiseaseorAttack', 
            'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 
            'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 'Education', 'Income'
        ]
        df = pd.DataFrame([{col: input_dict[col] for col in columns}])

        try:
            prob = float(self.brfss_model.predict_proba(df)[0, 1])
        except AttributeError:
            _patch_model_compat(self.brfss_model)
            try:
                prob = float(self.brfss_model.predict_proba(df)[0, 1])
            except Exception:
                pred = int(self.brfss_model.predict(df)[0])
                prob = 0.85 if pred == 1 else 0.15

        category = "HIGH" if prob >= 0.7 else ("MODERATE" if prob >= 0.3 else "LOW")

        key_factors = []
        if input_dict.get('HighBP', 0) == 1:
            key_factors.append("History of High Blood Pressure")
        if input_dict.get('HighChol', 0) == 1:
            key_factors.append("History of High Cholesterol")
        if input_dict.get('BMI', 0) >= 30:
            key_factors.append("High BMI (Obesity stage)")
        if input_dict.get('Smoker', 0) == 1:
            key_factors.append("Active or Past Smoking History")
        if input_dict.get('GenHlth', 1) >= 4:
            key_factors.append("Self-reported Fair/Poor General Health")
        if input_dict.get('PhysActivity', 1) == 0:
            key_factors.append("Lack of regular physical activity")

        if not key_factors:
            key_factors.append("Overall lifestyle indicators are favorable")

        return prob, category, key_factors

ml_manager = MLModelManager()
ml_service = ml_manager

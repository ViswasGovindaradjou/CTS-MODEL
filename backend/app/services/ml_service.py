import os
import joblib
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

class MLModelManager:
    def __init__(self):
        self.diabetes_model = None
        self.heart_model = None
        self.brfss_model = None
        self.is_loaded = False

    def load_models(self):
        """Loads existing .pkl pipelines safely if available"""
        try:
            model_dir = settings.MODEL_DIR
            if not os.path.exists(model_dir):
                model_dir = settings.BASE_DIR

            diabetes_path = os.path.join(model_dir, 'diabetes_pipeline.pkl')
            heart_path = os.path.join(model_dir, 'heart_pipeline.pkl')
            brfss_path = os.path.join(model_dir, 'brfss_pipeline.pkl')

            if os.path.exists(diabetes_path):
                try:
                    self.diabetes_model = joblib.load(diabetes_path)
                    _patch_model_compat(self.diabetes_model)
                    logger.info("Loaded diabetes_pipeline.pkl successfully.")
                except Exception as e:
                    logger.warning(f"Diabetes model unpickle notice: {e}")

            if os.path.exists(heart_path):
                try:
                    self.heart_model = joblib.load(heart_path)
                    _patch_model_compat(self.heart_model)
                    logger.info("Loaded heart_pipeline.pkl successfully.")
                except Exception as e:
                    logger.warning(f"Heart model unpickle notice: {e}")

            if os.path.exists(brfss_path):
                try:
                    self.brfss_model = joblib.load(brfss_path)
                    _patch_model_compat(self.brfss_model)
                    logger.info("Loaded brfss_pipeline.pkl successfully.")
                except Exception as e:
                    logger.warning(f"BRFSS model unpickle notice: {e}")

            self.is_loaded = True
        except Exception as e:
            logger.warning(f"ML models loading notice: {e}")
            self.is_loaded = True

    def predict_diabetes(self, input_dict: Dict[str, Any]) -> Tuple[float, str, List[str]]:
        prob = None
        if self.diabetes_model:
            try:
                import pandas as pd
                columns = ['preg', 'plas', 'pres', 'skin', 'insu', 'mass', 'pedi', 'age']
                df = pd.DataFrame([{col: input_dict[col] for col in columns}])
                prob = float(self.diabetes_model.predict_proba(df)[0, 1])
            except Exception as e:
                logger.warning(f"Pipeline calculation notice: {e}")

        if prob is None:
            plas = float(input_dict.get('plas', 100))
            mass = float(input_dict.get('mass', 25))
            pres = float(input_dict.get('pres', 70))
            age = float(input_dict.get('age', 30))
            pedi = float(input_dict.get('pedi', 0.2))
            preg = float(input_dict.get('preg', 0))
            
            score = 0.05
            if plas > 180: score += 0.45
            elif plas > 140: score += 0.32
            elif plas > 110: score += 0.15
            
            if mass >= 35: score += 0.30
            elif mass >= 30: score += 0.22
            elif mass >= 25: score += 0.10
            
            if pres >= 90: score += 0.15
            elif pres >= 80: score += 0.08
            
            if age >= 60: score += 0.18
            elif age >= 45: score += 0.12
            
            if pedi > 0.8: score += 0.15
            elif pedi > 0.5: score += 0.08
            
            if preg >= 5: score += 0.08
            
            prob = round(min(0.96, max(0.04, score)), 4)

        category = "HIGH" if prob >= 0.7 else ("MODERATE" if prob >= 0.3 else "LOW")

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
        prob = None
        if self.heart_model:
            try:
                import pandas as pd
                columns = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
                df = pd.DataFrame([{col: input_dict[col] for col in columns}])
                prob = float(self.heart_model.predict_proba(df)[0, 1])
            except Exception as e:
                logger.warning(f"Heart model calculation notice: {e}")

        if prob is None:
            age = float(input_dict.get('age', 45))
            trestbps = float(input_dict.get('trestbps', 120))
            chol = float(input_dict.get('chol', 200))
            thalach = float(input_dict.get('thalach', 150))
            oldpeak = float(input_dict.get('oldpeak', 0.0))
            exang = int(input_dict.get('exang', 0))
            cp = str(input_dict.get('cp', 'asymptomatic')).lower()
            
            score = 0.08
            if trestbps > 160: score += 0.25
            elif trestbps > 130: score += 0.15
            
            if chol > 260: score += 0.22
            elif chol > 200: score += 0.12
            
            if exang == 1: score += 0.20
            if oldpeak > 2.0: score += 0.22
            elif oldpeak > 1.0: score += 0.12
            
            if cp in ['asymptomatic', 'typical angina']: score += 0.15
            if thalach < 120: score += 0.12
            if age >= 55: score += 0.12
            
            prob = round(min(0.95, max(0.05, score)), 4)

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
        prob = None
        if self.brfss_model:
            try:
                import pandas as pd
                columns = [
                    'HighBP', 'HighChol', 'BMI', 'Smoker', 'Stroke', 'HeartDiseaseorAttack', 
                    'PhysActivity', 'Fruits', 'Veggies', 'HvyAlcoholConsump', 'AnyHealthcare', 
                    'GenHlth', 'MentHlth', 'PhysHlth', 'DiffWalk', 'Sex', 'Age', 'Education', 'Income'
                ]
                df = pd.DataFrame([{col: input_dict[col] for col in columns}])
                prob = float(self.brfss_model.predict_proba(df)[0, 1])
            except Exception as e:
                logger.warning(f"BRFSS model calculation notice: {e}")

        if prob is None:
            high_bp = int(input_dict.get('HighBP', 0))
            high_chol = int(input_dict.get('HighChol', 0))
            bmi = float(input_dict.get('BMI', 25))
            smoker = int(input_dict.get('Smoker', 0))
            stroke = int(input_dict.get('Stroke', 0))
            heart_dis = int(input_dict.get('HeartDiseaseorAttack', 0))
            gen_hlth = int(input_dict.get('GenHlth', 2))
            phys_act = int(input_dict.get('PhysActivity', 1))
            
            score = 0.06
            if heart_dis == 1: score += 0.35
            if stroke == 1: score += 0.30
            if high_bp == 1: score += 0.18
            if high_chol == 1: score += 0.15
            if bmi >= 30: score += 0.18
            if smoker == 1: score += 0.12
            if gen_hlth >= 4: score += 0.15
            if phys_act == 0: score += 0.08
            
            prob = round(min(0.96, max(0.04, score)), 4)

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

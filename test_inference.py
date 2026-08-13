import os
import joblib
import pandas as pd
import numpy as np

def _patch_model_compat(model):
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

def test_inference():
    base_dir = os.path.dirname(__file__)
    models_dir = base_dir
    
    diabetes_model_path = os.path.join(models_dir, 'diabetes_pipeline.pkl')
    heart_model_path = os.path.join(models_dir, 'heart_pipeline.pkl')
    brfss_model_path = os.path.join(models_dir, 'brfss_pipeline.pkl')
    
    # Load Models
    try:
        diabetes_model = joblib.load(diabetes_model_path)
        heart_model = joblib.load(heart_model_path)
        brfss_model = joblib.load(brfss_model_path)

        _patch_model_compat(diabetes_model)
        _patch_model_compat(heart_model)
        _patch_model_compat(brfss_model)
    except Exception as e:
        print(f"Failed to load models: {e}")
        return

    print("=====================================================")
    print("      LIVE INFERENCE TESTS (AWS LAMBDA SIMULATION)   ")
    print("=====================================================")
    
    np.random.seed(42)

    # ---------------------------------------------------------
    # 1. DIABETES RISK (Pima Indians Dataset)
    # Features: preg, plas, pres, skin, insu, mass, pedi, age
    # ---------------------------------------------------------
    print("\n--- 1. DIABETES RISK (Pima Indians) ---")
    diabetes_data = pd.DataFrame({
        'preg': [0, 5],
        'plas': [100, 185], # Normal vs High Glucose
        'pres': [70, 85],
        'skin': [20, 35],
        'insu': [80, 200],
        'mass': [23.5, 38.0], # Normal vs High BMI
        'pedi': [0.2, 0.8],
        'age': [25, 55]
    })
    
    diabetes_probs = diabetes_model.predict_proba(diabetes_data)[:, 1]
    
    for i in range(len(diabetes_data)):
        print(f"\nPatient {i+1} [Glucose={diabetes_data['plas'][i]}, BMI={diabetes_data['mass'][i]}, Age={diabetes_data['age'][i]}]")
        print(f"Predicted Diabetes Risk: {diabetes_probs[i]:.2%}")
        category = "HIGH" if diabetes_probs[i] >= 0.7 else ("MODERATE" if diabetes_probs[i] >= 0.3 else "LOW")
        print(f"Risk Category: {category}")


    # ---------------------------------------------------------
    # 2. HEART DISEASE RISK (UCI Dataset)
    # Features: age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal
    # ---------------------------------------------------------
    print("\n\n--- 2. HEART DISEASE RISK (UCI Cleveland) ---")
    heart_data = pd.DataFrame({
        'age': [35, 65],
        'sex': [0, 1],
        'cp': ['asymptomatic', 'typical angina'],
        'trestbps': [110, 160], # Normal vs High BP
        'chol': [180, 280],     # Normal vs High Cholesterol
        'fbs': [0, 1],
        'restecg': ['normal', 'ventricular hypertrophy'],
        'thalach': [150, 110],
        'exang': [0, 1],
        'oldpeak': [0.0, 2.5],
        'slope': ['upsloping', 'downsloping'],
        'ca': [0, 2],
        'thal': ['normal', 'reversible defect']
    })
    
    heart_probs = heart_model.predict_proba(heart_data)[:, 1]
    
    for i in range(len(heart_data)):
        print(f"\nPatient {i+1} [Age={heart_data['age'][i]}, BP={heart_data['trestbps'][i]}, Chol={heart_data['chol'][i]}]")
        print(f"Predicted Heart Disease Risk: {heart_probs[i]:.2%}")
        category = "HIGH" if heart_probs[i] >= 0.7 else ("MODERATE" if heart_probs[i] >= 0.3 else "LOW")
        print(f"Risk Category: {category}")


    # ---------------------------------------------------------
    # 3. CHRONIC DISEASE RISK (BRFSS Dataset)
    # Features: HighBP, HighChol, BMI, Smoker, Stroke, HeartDiseaseorAttack, ...
    # ---------------------------------------------------------
    print("\n\n--- 3. CHRONIC DISEASE RISK (BRFSS) ---")
    brfss_data = pd.DataFrame({
        'HighBP': [0, 1],
        'HighChol': [0, 1],
        'BMI': [22, 35],
        'Smoker': [0, 1],
        'Stroke': [0, 1],
        'HeartDiseaseorAttack': [0, 1],
        'PhysActivity': [1, 0],
        'Fruits': [1, 0],
        'Veggies': [1, 0],
        'HvyAlcoholConsump': [0, 1],
        'AnyHealthcare': [1, 1],
        'GenHlth': [1, 5], # 1=Excellent, 5=Poor
        'MentHlth': [0, 15],
        'PhysHlth': [0, 20],
        'DiffWalk': [0, 1],
        'Sex': [0, 1],
        'Age': [3, 11], # Age brackets
        'Education': [6, 3],
        'Income': [8, 3]
    })
    
    brfss_probs = brfss_model.predict_proba(brfss_data)[:, 1]
    
    for i in range(len(brfss_data)):
        print(f"\nPatient {i+1} [HighBP={brfss_data['HighBP'][i]}, BMI={brfss_data['BMI'][i]}, GenHlth={brfss_data['GenHlth'][i]}]")
        print(f"Predicted Chronic Disease Risk: {brfss_probs[i]:.2%}")
        category = "HIGH" if brfss_probs[i] >= 0.7 else ("MODERATE" if brfss_probs[i] >= 0.3 else "LOW")
        print(f"Risk Category: {category}")

if __name__ == '__main__':
    test_inference()

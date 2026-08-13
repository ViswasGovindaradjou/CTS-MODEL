from pydantic import BaseModel, Field
from typing import Optional, Union, Dict, Any
from datetime import datetime

class DiabetesHealthInput(BaseModel):
    preg: int = Field(..., ge=0, description="Number of times pregnant")
    plas: float = Field(..., ge=0, description="Plasma glucose concentration a 2 hours in an oral glucose tolerance test")
    pres: float = Field(..., ge=0, description="Diastolic blood pressure (mm Hg)")
    skin: float = Field(..., ge=0, description="Triceps skin fold thickness (mm)")
    insu: float = Field(..., ge=0, description="2-Hour serum insulin (mu U/ml)")
    mass: float = Field(..., ge=0, description="Body mass index (weight in kg/(height in m)^2)")
    pedi: float = Field(..., ge=0, description="Diabetes pedigree function")
    age: int = Field(..., ge=1, le=120, description="Age in years")

class HeartHealthInput(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="0 = female, 1 = male")
    cp: str = Field(..., description="Chest pain type ('asymptomatic', 'typical angina', 'atypical angina', 'non-anginal')")
    trestbps: float = Field(..., ge=0, description="Resting blood pressure (mm Hg)")
    chol: float = Field(..., ge=0, description="Serum cholesterol in mg/dl")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: str = Field(..., description="Resting electrocardiographic results ('normal', 'ventricular hypertrophy', 'ST-T wave abnormality')")
    thalach: float = Field(..., ge=0, description="Maximum heart rate achieved")
    exang: int = Field(..., ge=0, le=1, description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(..., ge=0, description="ST depression induced by exercise relative to rest")
    slope: str = Field(..., description="Slope of the peak exercise ST segment ('upsloping', 'flat', 'downsloping')")
    ca: int = Field(..., ge=0, le=4, description="Number of major vessels (0-4) colored by flourosopy")
    thal: str = Field(..., description="Thalassemia ('normal', 'fixed defect', 'reversible defect')")

class BRFSSHealthInput(BaseModel):
    HighBP: int = Field(..., ge=0, le=1, description="High Blood Pressure (0 = no, 1 = yes)")
    HighChol: int = Field(..., ge=0, le=1, description="High Cholesterol (0 = no, 1 = yes)")
    BMI: float = Field(..., ge=10, le=100, description="Body Mass Index")
    Smoker: int = Field(..., ge=0, le=1, description="Smoked at least 100 cigarettes (0 = no, 1 = yes)")
    Stroke: int = Field(..., ge=0, le=1, description="Ever told you had a stroke (0 = no, 1 = yes)")
    HeartDiseaseorAttack: int = Field(..., ge=0, le=1, description="Coronary heart disease or myocardial infarction (0 = no, 1 = yes)")
    PhysActivity: int = Field(..., ge=0, le=1, description="Physical activity in past 30 days (0 = no, 1 = yes)")
    Fruits: int = Field(..., ge=0, le=1, description="Consume Fruit 1 or more times per day (0 = no, 1 = yes)")
    Veggies: int = Field(..., ge=0, le=1, description="Consume Vegetables 1 or more times per day (0 = no, 1 = yes)")
    HvyAlcoholConsump: int = Field(..., ge=0, le=1, description="Heavy drinkers (adult men >= 14 drinks/week, women >= 7) (0 = no, 1 = yes)")
    AnyHealthcare: int = Field(..., ge=0, le=1, description="Have any kind of health care coverage (0 = no, 1 = yes)")
    GenHlth: int = Field(..., ge=1, le=5, description="General health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)")
    MentHlth: int = Field(..., ge=0, le=30, description="Days mental health not good past 30 days")
    PhysHlth: int = Field(..., ge=0, le=30, description="Days physical health not good past 30 days")
    DiffWalk: int = Field(..., ge=0, le=1, description="Serious difficulty walking or climbing stairs (0 = no, 1 = yes)")
    Sex: int = Field(..., ge=0, le=1, description="0 = female, 1 = male")
    Age: int = Field(..., ge=1, le=13, description="14-level age category (1 = 18-24, 9 = 60-64, 13 = 80+)")
    Education: int = Field(..., ge=1, le=6, description="Education level (1=Never attended, 6=College 4 years+)")
    Income: int = Field(..., ge=1, le=8, description="Income scale (1=<$10k, 8>=$75k)")

class PatientHealthRecordResponse(BaseModel):
    id: int
    user_id: int
    age: Optional[int] = None
    sex: Optional[int] = None
    bmi: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    cholesterol: Optional[float] = None
    raw_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

import random
import time
from typing import Dict, Any

class WearableDeviceSimulator:
    def __init__(self):
        self.device_name = "AuraRing Pro / Apple Watch Ultra"
        self.device_id = "WEAR-9842-IOT"
        self.is_connected = True

    def get_live_telemetry(self) -> Dict[str, Any]:
        """Generates realistic live IoT biometric wearable sensor data."""
        base_hr = 78
        hr = int(base_hr + random.randint(-12, 35))
        
        systolic = int(122 + random.randint(-10, 38))
        diastolic = int(82 + random.randint(-8, 22))

        glucose = round(105.0 + random.uniform(-15.0, 65.0), 1)

        cholesterol = int(195 + random.randint(-25, 65))

        bmi = round(26.8 + random.uniform(-2.0, 4.5), 1)

        spo2 = round(97.5 + random.uniform(-1.5, 1.5), 1)

        oldpeak = round(0.2 + random.uniform(0.0, 1.8), 1) if hr > 95 else 0.4

        if hr > 105 and systolic > 140:
            cp = "typical angina"
        elif hr > 95:
            cp = "atypical angina"
        else:
            cp = "asymptomatic"

        if oldpeak > 1.2 or systolic > 145:
            restecg = "ST-T wave abnormality"
        elif diastolic > 90:
            restecg = "ventricular hypertrophy"
        else:
            restecg = "normal"

        exang_flag = 1 if (hr > 105 or cp != "asymptomatic") else 0
        heart_disease_flag = 1 if (oldpeak > 1.0 or cp == "typical angina" or systolic >= 140) else 0
        steps = 6420 + random.randint(0, 500)
        phys_activity = 1 if steps > 4000 else 0

        return {
            "device_id": self.device_id,
            "device_name": self.device_name,
            "status": "connected" if self.is_connected else "disconnected",
            "timestamp": time.time(),
            "telemetry": {
                "heart_rate_bpm": hr,
                "blood_pressure_systolic": systolic,
                "blood_pressure_diastolic": diastolic,
                "blood_glucose_mg_dl": glucose,
                "cholesterol_mg_dl": cholesterol,
                "bmi": bmi,
                "spo2_percentage": spo2,
                "oldpeak_st": oldpeak,
                "chest_pain": cp,
                "restecg": restecg,
                "fasting_sugar_flag": 1 if glucose > 120 else 0,
                "high_bp_flag": 1 if (systolic >= 130 or diastolic >= 80) else 0,
                "high_chol_flag": 1 if cholesterol > 200 else 0,
                "exang_flag": exang_flag,
                "heart_disease_flag": heart_disease_flag,
                "phys_activity_flag": phys_activity,
                "steps_today": steps,
                "skin_temp_f": 98.6
            }
        }

wearable_simulator = WearableDeviceSimulator()


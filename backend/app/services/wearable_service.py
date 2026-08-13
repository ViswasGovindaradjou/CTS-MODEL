import random
import time
from typing import Dict, Any

class WearableDeviceSimulator:
    def __init__(self):
        self.device_name = "AuraRing Pro / Apple Watch Ultra"
        self.device_id = "WEAR-9842-IOT"
        self.is_connected = True
        
        # Stateful current biometric values
        self.hr = 98.0
        self.target_hr = 75.0
        
        self.systolic = 132.0
        self.target_systolic = 120.0
        
        self.diastolic = 86.0
        self.target_diastolic = 80.0
        
        self.glucose = 128.0
        self.target_glucose = 105.0
        
        self.cholesterol = 210.0
        self.target_cholesterol = 195.0
        
        self.bmi = 27.5
        self.target_bmi = 26.2
        
        self.spo2 = 98.0
        self.target_spo2 = 98.5
        
        self.skin_temp = 98.6

    def get_live_telemetry(self) -> Dict[str, Any]:
        """Generates realistic, smooth live IoT biometric wearable sensor data with gradual transitions."""
        # Check if close to targets, if so pick new wandering targets
        if abs(self.hr - self.target_hr) < 2.0:
            self.target_hr = float(random.randint(68, 112))
        
        if abs(self.systolic - self.target_systolic) < 3.0:
            self.target_systolic = float(random.randint(115, 142))

        if abs(self.diastolic - self.target_diastolic) < 2.0:
            self.target_diastolic = float(random.randint(75, 92))

        if abs(self.glucose - self.target_glucose) < 3.0:
            self.target_glucose = round(random.uniform(92.0, 148.0), 1)

        # Step values gradually towards target
        hr_step = 1.5 if self.target_hr > self.hr else -1.5
        if abs(self.target_hr - self.hr) < 1.5:
            self.hr = self.target_hr
        else:
            self.hr += hr_step

        sys_step = 1.0 if self.target_systolic > self.systolic else -1.0
        if abs(self.target_systolic - self.systolic) < 1.0:
            self.systolic = self.target_systolic
        else:
            self.systolic += sys_step

        dia_step = 0.8 if self.target_diastolic > self.diastolic else -0.8
        if abs(self.target_diastolic - self.diastolic) < 0.8:
            self.diastolic = self.target_diastolic
        else:
            self.diastolic += dia_step

        gluc_step = 1.2 if self.target_glucose > self.glucose else -1.2
        if abs(self.target_glucose - self.glucose) < 1.2:
            self.glucose = self.target_glucose
        else:
            self.glucose += gluc_step

        curr_hr = int(round(self.hr))
        curr_sys = int(round(self.systolic))
        curr_dia = int(round(self.diastolic))
        curr_gluc = round(self.glucose, 1)
        curr_chol = int(round(self.cholesterol))
        curr_bmi = round(self.bmi, 1)
        curr_spo2 = round(self.spo2, 1)

        oldpeak = round(0.2 + random.uniform(0.0, 0.4), 1) if curr_hr > 98 else 0.3

        if curr_hr > 105 and curr_sys > 138:
            cp = "typical angina"
        elif curr_hr > 95:
            cp = "atypical angina"
        else:
            cp = "asymptomatic"

        if oldpeak > 1.2 or curr_sys > 140:
            restecg = "ST-T wave abnormality"
        elif curr_dia > 88:
            restecg = "ventricular hypertrophy"
        else:
            restecg = "normal"

        exang_flag = 1 if (curr_hr > 102 or cp != "asymptomatic") else 0
        heart_disease_flag = 1 if (oldpeak > 1.0 or cp == "typical angina" or curr_sys >= 135) else 0
        steps = 6420 + random.randint(0, 50)
        phys_activity = 1 if steps > 4000 else 0

        return {
            "device_id": self.device_id,
            "device_name": self.device_name,
            "status": "connected" if self.is_connected else "disconnected",
            "timestamp": time.time(),
            "telemetry": {
                "heart_rate_bpm": curr_hr,
                "blood_pressure_systolic": curr_sys,
                "blood_pressure_diastolic": curr_dia,
                "blood_glucose_mg_dl": curr_gluc,
                "cholesterol_mg_dl": curr_chol,
                "bmi": curr_bmi,
                "spo2_percentage": curr_spo2,
                "oldpeak_st": oldpeak,
                "chest_pain": cp,
                "restecg": restecg,
                "fasting_sugar_flag": 1 if curr_gluc > 120 else 0,
                "high_bp_flag": 1 if (curr_sys >= 130 or curr_dia >= 80) else 0,
                "high_chol_flag": 1 if curr_chol > 200 else 0,
                "exang_flag": exang_flag,
                "heart_disease_flag": heart_disease_flag,
                "phys_activity_flag": phys_activity,
                "steps_today": steps,
                "skin_temp_f": round(self.skin_temp + random.uniform(-0.1, 0.1), 1)
            }
        }

wearable_simulator = WearableDeviceSimulator()



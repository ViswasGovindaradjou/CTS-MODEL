import io
import re
import json
from typing import Dict, Any, Tuple
from pypdf import PdfReader
from app.core.logger import logger
from app.services.groq_service import groq_service

# Recognized medical keywords that must appear in valid health reports
MEDICAL_KEYWORDS = [
    "glucose", "blood pressure", "cholesterol", "bmi", "insulin", "triceps", 
    "heart rate", "pulse", "st depression", "angina", "ecg", "ekg", "hemoglobin",
    "hba1c", "lab report", "diagnostic", "blood test", "patient", "clinical",
    "serum", "triglycerides", "lipid", "plasma", "thyroid", "urine"
]

class PDFExtractionService:
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract plain text content from uploaded PDF bytes."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            extracted_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)
            full_text = "\n".join(extracted_text)
            logger.info(f"Extracted {len(full_text)} chars of text from PDF.")
            return full_text
        except Exception as e:
            logger.error(f"Error reading PDF bytes: {e}")
            raise ValueError("Could not parse PDF file. Please ensure it is a valid PDF document.")

    def parse_health_metrics_from_text(self, text: str) -> Tuple[bool, Dict[str, Any], str]:
        """
        Parses structured health metrics from raw PDF text.
        Returns: (is_valid_medical_report: bool, metrics_dict: dict, message: str)
        """
        if not text.strip():
            return False, {}, "PDF document is empty or contains no readable text."

        text_lower = text.lower()
        
        # Check if text has basic medical context
        keyword_hits = [kw for kw in MEDICAL_KEYWORDS if kw in text_lower]
        
        # 1. Try Groq API extraction if available
        extracted = {}
        if groq_service.api_key:
            try:
                system_prompt = (
                    "You are a medical lab report entity extractor. Analyze the provided clinical text and extract "
                    "the numeric and categorical health parameters into a strict JSON object. "
                    "If the document is NOT a medical lab report, return an empty JSON object {}. "
                    "Output JSON keys must strictly use these names if present:\n"
                    "- preg: number of pregnancies (integer)\n"
                    "- plas: blood glucose / plasma glucose level in mg/dL (number)\n"
                    "- pres: resting diastolic blood pressure in mmHg (number)\n"
                    "- trestbps: resting systolic blood pressure in mmHg (number)\n"
                    "- skin: triceps skin fold thickness in mm (number)\n"
                    "- insu: 2-hour serum insulin in mu U/ml (number)\n"
                    "- mass: body mass index / BMI (number)\n"
                    "- pedi: diabetes pedigree function / family history score (number)\n"
                    "- age: age in years (integer)\n"
                    "- sex: 1 for male, 0 for female (integer)\n"
                    "- cp: chest pain type ('typical angina', 'atypical angina', 'non-anginal', 'asymptomatic')\n"
                    "- chol: serum cholesterol in mg/dL (number)\n"
                    "- fbs: fasting blood sugar > 120 mg/dL (1 if true, 0 if false)\n"
                    "- restecg: resting ECG result ('normal', 'ST-T wave abnormality', 'ventricular hypertrophy')\n"
                    "- thalach: maximum heart rate achieved (number)\n"
                    "- exang: exercise induced angina (1 for yes, 0 for no)\n"
                    "- oldpeak: ST depression induced by exercise (number)\n"
                    "- slope: slope of peak exercise ST segment ('upsloping', 'flat', 'downsloping')\n"
                    "- ca: number of major vessels (0-3)\n"
                    "- thal: thalium stress test ('normal', 'fixed defect', 'reversible defect')\n"
                    "- HighBP: 1 if high blood pressure, 0 otherwise\n"
                    "- HighChol: 1 if high cholesterol, 0 otherwise\n"
                    "- Smoker: 1 if smoker, 0 otherwise\n"
                    "- Stroke: 1 if stroke history, 0 otherwise\n\n"
                    "Respond with ONLY a raw valid JSON object without markdown formatting or code blocks."
                )
                
                raw_response = groq_service._call_groq([
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract health metrics from this document:\n\n{text[:3000]}"}
                ], temperature=0.1)

                if raw_response:
                    cleaned_text = raw_response.replace("```json", "").replace("```", "").strip()
                    extracted = json.loads(cleaned_text)
            except Exception as e:
                logger.warning(f"Groq PDF extraction fallback triggered: {e}")

        # 2. Smart Regex rule-based extraction fallback if Groq returned empty or failed
        if not extracted:
            # Age
            age_match = re.search(r'(?:age|years old)[^\d]*(\d{1,3})', text, re.IGNORECASE)
            if age_match:
                extracted['age'] = int(age_match.group(1))

            # Sex / Gender
            if re.search(r'gender[^\w]*female|sex[^\w]*female|female', text, re.IGNORECASE):
                extracted['sex'] = 0
                extracted['Sex'] = 0
            elif re.search(r'gender[^\w]*male|sex[^\w]*male|male', text, re.IGNORECASE):
                extracted['sex'] = 1
                extracted['Sex'] = 1

            # Glucose / Sugar (plas)
            glucose_match = re.search(r'(?:glucose|fasting sugar|blood sugar|plas)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if glucose_match:
                val = float(glucose_match.group(1))
                extracted['plas'] = val
                extracted['fbs'] = 1 if val > 120 else 0

            # Blood Pressure (systolic / diastolic)
            bp_match = re.search(r'(?:blood pressure|bp|pres|trestbps)[^\d]*(\d{2,3})\s*/\s*(\d{2,3})', text, re.IGNORECASE)
            if bp_match:
                systolic = float(bp_match.group(1))
                diastolic = float(bp_match.group(2))
                extracted['trestbps'] = systolic
                extracted['pres'] = diastolic
                extracted['HighBP'] = 1 if systolic >= 130 or diastolic >= 80 else 0
            else:
                bp_single = re.search(r'(?:resting bp|blood pressure|pres|trestbps)[^\d]*(\d{2,3})', text, re.IGNORECASE)
                if bp_single:
                    val = float(bp_single.group(1))
                    extracted['pres'] = val
                    extracted['trestbps'] = val
                    extracted['HighBP'] = 1 if val >= 130 else 0

            # Cholesterol
            chol_match = re.search(r'(?:cholesterol|chol)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if chol_match:
                val = float(chol_match.group(1))
                extracted['chol'] = val
                extracted['HighChol'] = 1 if val >= 200 else 0

            # BMI / Mass
            bmi_match = re.search(r'(?:bmi|body mass index|mass)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if bmi_match:
                val = float(bmi_match.group(1))
                extracted['mass'] = val
                extracted['BMI'] = val

            # Insulin
            insu_match = re.search(r'(?:insulin|insu)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if insu_match:
                extracted['insu'] = float(insu_match.group(1))

            # Skin fold thickness
            skin_match = re.search(r'(?:skin fold|skin thickness|skin)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if skin_match:
                extracted['skin'] = float(skin_match.group(1))

            # Heart Rate / Thalach
            hr_match = re.search(r'(?:heart rate|max hr|pulse|thalach)[^\d]*(\d{2,3})', text, re.IGNORECASE)
            if hr_match:
                extracted['thalach'] = float(hr_match.group(1))

            # ST Depression (oldpeak)
            oldpeak_match = re.search(r'(?:st depression|oldpeak)[^\d]*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if oldpeak_match:
                extracted['oldpeak'] = float(oldpeak_match.group(1))

            # Chest Pain (cp)
            if re.search(r'atypical angina', text, re.IGNORECASE):
                extracted['cp'] = 'atypical angina'
            elif re.search(r'typical angina', text, re.IGNORECASE):
                extracted['cp'] = 'typical angina'
            elif re.search(r'non-anginal', text, re.IGNORECASE):
                extracted['cp'] = 'non-anginal'
            elif re.search(r'asymptomatic', text, re.IGNORECASE):
                extracted['cp'] = 'asymptomatic'

        # Validation Rule: PDF MUST contain at least 1 clinical metric OR 2+ medical keywords
        if len(extracted) == 0 and len(keyword_hits) < 2:
            return False, {}, "Invalid Document: The uploaded PDF is not a valid medical report. No clinical health data found."

        return True, extracted, f"Extracted {len(extracted)} clinical parameter(s) successfully."

pdf_service = PDFExtractionService()

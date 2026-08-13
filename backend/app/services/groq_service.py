import json
import requests
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logger import logger

DISCLAIMER_TEXT = (
    "DISCLAIMER: This platform provides AI-assisted health risk insights and general wellness guidance. "
    "It is NOT a medical diagnosis or treatment plan. Always consult with a qualified healthcare professional "
    "or doctor before making any changes to your medical regimen, diet, or treatment."
)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY or ""
        self.model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    def _call_groq(self, messages: List[Dict[str, str]], temperature: float = 0.4, max_tokens: int = 3000) -> str:
        # Reload API key dynamically from env/settings on every request
        import os
        api_key = os.getenv("GROQ_API_KEY") or settings.GROQ_API_KEY or self.api_key
        model = os.getenv("GROQ_MODEL") or settings.GROQ_MODEL or self.model

        if not api_key:
            logger.warning("GROQ_API_KEY is not set in environment. Falling back to local AI rules.")
            return ""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content'].strip()
                logger.info("Successfully received Groq API response.")
                return content
            else:
                logger.error(f"Groq API error HTTP {response.status_code}: {response.text}")
                return ""
        except Exception as e:
            logger.error(f"Failed to communicate with Groq API: {e}")
            return ""

    def generate_recommendations(
        self, 
        disease_type: str, 
        risk_score: float, 
        risk_category: str, 
        key_factors: List[str], 
        patient_data: Dict[str, Any],
        patient_profile: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Generates deeply personalized care recommendations using Groq API (llama-3.3-70b-versatile)
        tailored specifically to a single patient's clinical metrics and profile.
        """
        patient_name = patient_profile.get("full_name", "Patient") if patient_profile else "Patient"
        patient_age = patient_profile.get("age", patient_data.get("age", 45)) if patient_profile else patient_data.get("age", 45)
        patient_gender = patient_profile.get("gender", "male") if patient_profile else "male"

        prompt = f"""
You are an elite clinical AI specialist. Generate deeply personalized, highly specific medical care recommendations for this specific patient:

PATIENT PERSONAL PROFILE:
- Full Name: {patient_name}
- Age: {patient_age} years old
- Gender: {patient_gender}
- Primary Assessment: {disease_type.upper()} Risk Analysis

COMPUTED ML RISK PREDICTION:
- Risk Probability Score: {risk_score * 100:.1f}%
- Risk Classification: {risk_category} Risk Level
- Contriving Risk Drivers Identified: {', '.join(key_factors) if key_factors else 'None'}
- Specific Patient Metrics Input: {json.dumps(patient_data)}
- Output Target Language: {language} (en = English, ta = Tamil, hi = Hindi)

CLINICAL INSTRUCTIONS:
- Tailor every advice bullet explicitly to {patient_name}'s specific numbers (e.g. reference their exact blood glucose, blood pressure, BMI, or cholesterol values if elevated).
- Provide 3 clear, actionable, evidence-based bullet points for EACH of the 6 categories below.
- Do NOT use generic templates; make it feel like a private consultation report for {patient_name}.

RESPOND ONLY IN VALID RAW JSON FORMAT matching this exact structure:
{{
  "general_lifestyle": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "diet_suggestions": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "physical_activity": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "monitoring_suggestions": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "follow_up_suggestions": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "preventive_guidance": ["Specific point 1", "Specific point 2", "Specific point 3"]
}}
Do NOT include markdown block markers or any commentary outside the raw JSON object.
"""

        messages = [
            {"role": "system", "content": "You are a professional medical wellness consultant returning raw JSON personalized care plans."},
            {"role": "user", "content": prompt}
        ]

        raw_output = self._call_groq(messages, temperature=0.2)
        
        if raw_output:
            try:
                clean_json = raw_output.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_json)
                parsed["disclaimer"] = DISCLAIMER_TEXT
                logger.info("Successfully generated personalized Groq AI care recommendations.")
                return parsed
            except Exception as parse_err:
                logger.warning(f"Could not parse JSON from Groq response: {parse_err}. Using rule-based fallback generator.")

        # Rule-based fallback if Groq API key is unavailable or request fails
        return self._generate_fallback_recommendations(disease_type, risk_score, risk_category, key_factors, language)

    def _repair_and_parse_json(self, raw_str: str) -> Optional[Dict[str, Any]]:
        if not raw_str:
            return None
        clean = raw_str.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(clean)
        except Exception:
            pass

        import re
        try:
            fixed = re.sub(r'[\r\n]+', ' ', clean)
            return json.loads(fixed)
        except Exception:
            pass

        try:
            start = clean.find("{")
            end = clean.rfind("}")
            if start != -1 and end != -1:
                substring = clean[start:end+1]
                substring = re.sub(r'[\r\n]+', ' ', substring)
                return json.loads(substring)
        except Exception:
            pass
        return None

    def translate_recommendations(self, recommendations: Dict[str, Any], target_language: str = "en") -> Dict[str, Any]:
        """
        Translates an existing Care Recommendation JSON object into target language (ta = Tamil, hi = Hindi, en = English) using Groq API.
        """
        if not recommendations:
            return {}

        if target_language == "en":
            return recommendations

        lang_name = "Tamil (தமிழ் script)" if target_language == "ta" else ("Hindi (हिंदी Devanagari script)" if target_language == "hi" else "English")

        prompt = f"""
Translate every text string item inside the given medical care recommendations object strictly into {lang_name}.
Keep all clinical numerical values, units (e.g. mg/dL, mmHg, kg, steps), and structure identical.

INPUT RECOMMENDATIONS JSON:
{json.dumps(recommendations, ensure_ascii=False)}

RESPOND ONLY IN VALID RAW JSON FORMAT matching this exact structure:
{{
  "general_lifestyle": ["Translated point 1", "Translated point 2", ...],
  "diet_suggestions": ["Translated point 1", "Translated point 2", ...],
  "physical_activity": ["Translated point 1", "Translated point 2", ...],
  "monitoring_suggestions": ["Translated point 1", "Translated point 2", ...],
  "follow_up_suggestions": ["Translated point 1", "Translated point 2", ...],
  "preventive_guidance": ["Translated point 1", "Translated point 2", ...],
  "disclaimer": "Translated disclaimer text"
}}
Do NOT include markdown block markers or any commentary outside the raw JSON object.
"""

        messages = [
            {"role": "system", "content": "You are a professional medical translator returning valid raw JSON output without unescaped newlines or quotes inside strings."},
            {"role": "user", "content": prompt}
        ]

        raw_output = self._call_groq(messages, temperature=0.2, max_tokens=3500)
        if raw_output:
            parsed = self._repair_and_parse_json(raw_output)
            if parsed and parsed.get("general_lifestyle"):
                logger.info(f"Successfully translated care recommendations to {target_language} via Groq API.")
                return parsed
            else:
                logger.warning(f"Could not parse translated JSON from Groq response: {raw_output[:150]}")

        return recommendations

    def chat(self, user_message: str, language: str = "en", patient_context: Optional[Dict[str, Any]] = None) -> str:
        """
        Multilingual Healthcare Chatbot using Groq API supporting English, Tamil (தமிழ்), and Hindi (हिंदी).
        Deeply personalized with the patient's actual health context.
        """
        context_str = ""
        if patient_context:
            name = patient_context.get("full_name", "User")
            age = patient_context.get("age", "")
            gender = patient_context.get("gender", "")
            latest_recs = patient_context.get("latest_assessment", "")
            metrics = patient_context.get("key_metrics", "")
            context_str = f"\nPATIENT PROFILE & HEALTH CONTEXT:\n- Name: {name}\n- Demographics: Age {age}, Gender: {gender}\n- Latest ML Risk Predictions: {latest_recs}\n- Current Clinical Metrics: {metrics}\n"

        lang_instruction = "English"
        if language == "ta":
            lang_instruction = "Tamil (தமிழ்) - Use natural, polite, and grammatically accurate Tamil script"
        elif language == "hi":
            lang_instruction = "Hindi (हिंदी) - Use natural, polite, and grammatically accurate Devanagari Hindi script"

        system_prompt = (
            "You are 'AuraHealth AI', a world-class compassionate, highly knowledgeable, and personalized healthcare chatbot. "
            "You provide individualized health explanations, risk assessment guidance, and preventive advice. "
            f"{context_str}\n"
            "STRICT GUIDELINES:\n"
            f"1. You MUST respond strictly in {lang_instruction}.\n"
            "2. Address the user naturally and refer to their specific health numbers (e.g. glucose, blood pressure, BMI) when relevant to their query.\n"
            "3. Do NOT prescribe specific prescription pharmaceutical drugs or claim to render definitive final diagnosis.\n"
            "4. Encourage routine consultation with a doctor for emergency or diagnostic procedures.\n"
            "5. Keep responses concise, warm, professional, and easy to read."
        )

        user_content = f"User Message: {user_message}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        response = self._call_groq(messages, temperature=0.5)
        if response:
            return response

        # Multilingual fallback if Groq API call fails
        return self._generate_fallback_chat_response(user_message, language)

    def _generate_fallback_recommendations(
        self, disease_type: str, risk_score: float, risk_category: str, key_factors: List[str], language: str
    ) -> Dict[str, Any]:
        if disease_type.lower() == "diabetes":
            if risk_category == "HIGH":
                lifestyle = [
                    "Maintain strict daily monitoring of blood glucose levels before and 2 hours after meals.",
                    "Establish a regular routine for sleep (7-8 hours per night) to regulate cortisol levels.",
                    "Avoid high glycemic index foods and sugary beverages completely."
                ]
                diet = [
                    "Adopt a low-carb, fiber-rich diet with non-starchy vegetables, leafy greens, and legumes.",
                    "Limit refined sugars, white rice, white bread, and processed snacks.",
                    "Incorporate healthy fats such as seeds, nuts, and olive oil in moderation."
                ]
                activity = [
                    "Engage in at least 30 minutes of moderate aerobic exercise (brisk walking) 5 days a week.",
                    "Incorporate post-meal 10-minute short walks to lower postprandial glucose spikes.",
                    "Include light resistance or strength training 2 days per week."
                ]
                monitoring = [
                    "Test fasting blood sugar daily or as advised by your physician.",
                    "Schedule an HbA1c test every 3 months to assess long-term glycemic control.",
                    "Monitor blood pressure and body weight weekly."
                ]
                follow_up = [
                    "Consult an Endocrinologist or General Practitioner within 1-2 weeks.",
                    "Schedule a comprehensive diabetic eye exam (dilated retinal exam) annually.",
                    "Consult a registered dietitian for a personalized medical nutrition plan."
                ]
                preventive = [
                    "Inspect feet daily for cuts, blisters, or skin changes.",
                    "Stay well hydrated with plain water (2-3 liters per day).",
                    "Avoid tobacco use and limit alcohol intake completely."
                ]
            else:
                lifestyle = [
                    "Maintain a balanced daily routine with consistent meal timing.",
                    "Keep stress levels managed through daily mindfulness or exercise."
                ]
                diet = [
                    "Focus on whole grains (oats, quinoa, brown rice) and high-fiber foods.",
                    "Reduce intake of added sugars, sodas, and ultra-processed foods."
                ]
                activity = [
                    "Aim for 150 minutes of moderate-intensity physical activity per week."
                ]
                monitoring = [
                    "Check fasting blood glucose during annual health check-ups."
                ]
                follow_up = [
                    "Schedule an annual wellness examination with your primary physician."
                ]
                preventive = [
                    "Maintain a healthy Body Mass Index (BMI between 18.5 and 24.9)."
                ]
        else: # Cardiovascular / Heart Disease
            if risk_category == "HIGH":
                lifestyle = [
                    "Prioritize cardiovascular rest and maintain blood pressure control.",
                    "Avoid physical overexertion without prior medical clearance.",
                    "Implement stress reduction practices like deep breathing exercises."
                ]
                diet = [
                    "Adopt the DASH (Dietary Approaches to Stop Hypertension) or Mediterranean diet.",
                    "Strictly limit dietary sodium intake to under 2,000 mg (1 teaspoon of salt) daily.",
                    "Eliminate trans fats and saturated fats; choose heart-healthy omega-3 rich foods."
                ]
                activity = [
                    "Engage in low-to-moderate physician-approved cardiovascular activities like walking.",
                    "Avoid heavy isometric lifting until evaluated by a cardiologist.",
                    "Listen to your body and stop immediately if chest discomfort or dizziness occurs."
                ]
                monitoring = [
                    "Log blood pressure twice daily (morning and evening).",
                    "Check lipid profile (cholesterol, HDL, LDL, triglycerides) every 3-6 months.",
                    "Track resting heart rate and report sudden spikes or irregularities."
                ]
                follow_up = [
                    "Schedule an appointment with a Cardiologist promptly.",
                    "Discuss an Electrocardiogram (ECG/EKG) and Echocardiogram assessment.",
                    "Review all ongoing medications with your physician."
                ]
                preventive = [
                    "Cease smoking immediately; seek medical smoking cessation support if needed.",
                    "Maintain optimal body weight and avoid rapid weight fluctuations."
                ]
            else:
                lifestyle = [
                    "Maintain regular active physical movement and adequate rest."
                ]
                diet = [
                    "Eat a heart-healthy diet rich in fruits, vegetables, and lean proteins.",
                    "Keep sodium and processed food intake low."
                ]
                activity = [
                    "Participate in brisk walking, swimming, or cycling 3-5 times a week."
                ]
                monitoring = [
                    "Monitor blood pressure and cholesterol during routine physical exams."
                ]
                follow_up = [
                    "Schedule regular routine health screenings."
                ]
                preventive = [
                    "Maintain an active, smoke-free lifestyle."
                ]

        return {
            "general_lifestyle": lifestyle,
            "diet_suggestions": diet,
            "physical_activity": activity,
            "monitoring_suggestions": monitoring,
            "follow_up_suggestions": follow_up,
            "preventive_guidance": preventive,
            "disclaimer": DISCLAIMER_TEXT
        }

    def _generate_fallback_chat_response(self, query: str, language: str) -> str:
        q_lower = query.lower()
        
        if language == "ta":
            if "நீரிழிவு" in q_lower or "diabetes" in q_lower or "சர்க்கரை" in q_lower:
                return (
                    "நீரிழிவு நோய் (Diabetes) என்பது இரத்தத்தில் சர்க்கரை அளவு அதிகரிக்கும் நிலை ஆகும். "
                    "வழக்கமான உடற்பயிற்சி, நார்ச்சத்து நிறைந்த உணவுகள், மற்றும் சரியான இரத்த சர்க்கரை பரிசோதனை "
                    "மூலம் இதை சிறப்பாக கட்டுப்படுத்தலாம். மேலும் விவரங்களுக்கு மருத்துவரை அணுகவும். "
                    "\n\n(குறிப்பு: இது பொதுவான சுகாதாரத் தகவல் மட்டுமே)."
                )
            elif "இதயம்" in q_lower or "heart" in q_lower or "பிபி" in q_lower or "bp" in q_lower:
                return (
                    "இதய ஆரோக்கியத்திற்கு குறைந்த உப்பு, ஆரோக்கியமான உணவு, புகைபிடிக்காமை மற்றும் "
                    "தினசரி 30 நிமிட நடைபயிற்சி மிகவும் அவசியம். இரத்த அழுத்தத்தை (BP) தொடர்ந்து கண்காணிக்கவும். "
                    "\n\n(குறிப்பு: இது பொதுவான சுகாதாரத் தகவல் மட்டுமே)."
                )
            else:
                return (
                    "வணக்கம்! நான் உங்கள் AuraHealth AI உதவியாளன். "
                    "உங்கள் ஆரோக்கியம், நீரிழிவு நோய், இதய நோய் மற்றும் நல்வாழ்வு பற்றிய கேள்விகளுக்கு நான் பதிலளிக்க முடியும். "
                    "உங்களுக்கு என்ன உதவி தேவை? "
                    "\n\n(குறிப்பு: அவசர சிகிச்சைக்கு உடனடியாக மருத்துவரை தொடர்பு கொள்ளவும்)."
                )
        elif language == "hi":
            if "मधुमेह" in q_lower or "diabetes" in q_lower or "शुगर" in q_lower:
                return (
                    "मधुमेह (Diabetes) एक ऐसी स्थिति है जिसमें रक्त शर्करा (Blood Sugar) का स्तर बढ़ जाता है। "
                    "नियमित व्यायाम, संतुलित कम-कार्ब आहार और समय पर जांच से इसे नियंत्रित किया जा सकता है। "
                    "अधिक जानकारी के लिए कृपया अपने चिकित्सक से परामर्श करें। "
                    "\n\n(अस्वीकरण: यह केवल सामान्य स्वास्थ्य जानकारी है)।"
                )
            elif "हृदय" in q_lower or "heart" in q_lower or "बीपी" in q_lower or "bp" in q_lower:
                return (
                    "हृदय स्वास्थ्य के लिए कम नमक वाला आहार, नियमित वॉक (कम से कम 30 मिनट), धूम्रपान न करना "
                    "और तनाव मुक्त रहना अत्यंत आवश्यक है। नियमित रूप से ब्लड प्रेशर की जांच करवाएं। "
                    "\n\n(अस्वीकरण: यह केवल सामान्य स्वास्थ्य जानकारी है)।"
                )
            else:
                return (
                    "नमस्ते! मैं आपका AuraHealth AI स्वास्थ्य सहायक हूँ। "
                    "मैं मधुमेह, हृदय रोग और सामान्य स्वास्थ्य से जुड़े आपके प्रश्नों का उत्तर दे सकता हूँ। "
                    "आज मैं आपकी क्या सहायता कर सकता हूँ? "
                    "\n\n(अस्वीकरण: चिकित्सा आपात स्थिति में तुरंत डॉक्टर से संपर्क करें)।"
                )
        else: # English
            if "diabetes" in q_lower or "glucose" in q_lower or "sugar" in q_lower:
                return (
                    "Diabetes is a chronic metabolic condition characterized by elevated blood glucose levels. "
                    "Key management strategies include maintaining a balanced low-glycemic index diet, regular physical activity, "
                    "weight management, and periodic HbA1c testing. "
                    "\n\nDisclaimer: This is general health information. Please consult a physician for clinical advice."
                )
            elif "heart" in q_lower or "cardio" in q_lower or "bp" in q_lower or "blood pressure" in q_lower:
                return (
                    "Cardiovascular health can be significantly improved by following a low-sodium, heart-healthy diet (like DASH), "
                    "engaging in 150 minutes of moderate aerobic exercise weekly, managing stress, and maintaining blood pressure under 120/80 mmHg. "
                    "\n\nDisclaimer: Always consult a cardiologist or primary care doctor for medical evaluation."
                )
            else:
                return (
                    "Hello! I am AuraHealth AI, your personalized health companion. "
                    "I can answer healthcare questions, explain risk assessment scores, and share preventive lifestyle guidance. "
                    "How can I help you today? "
                    "\n\nDisclaimer: For medical diagnosis or urgent care, please see a qualified medical professional."
                )

groq_service = GroqService()

# Chronic Disease Health Monitoring & Risk Prediction Platform

A production-ready chronic disease health monitoring and risk prediction platform for **Diabetes** and **Cardiovascular / Heart Disease** risk assessment.

Built with **React.js**, **Python + FastAPI**, existing pre-trained **`.pkl` ML pipelines**, **AWS DB readiness**, and **Groq API** powering personalized care recommendations and an interactive **multilingual healthcare chatbot (Tamil, English, Hindi)**.

---

## 🌟 Key Features

1. **Machine Learning Risk Prediction**:
   - **Diabetes Risk (`diabetes_pipeline.pkl`)**: 8 clinical features (Glucose, BMI, Blood Pressure, Insulin, Pedigree, Age, etc.).
   - **Cardiovascular Risk (`heart_pipeline.pkl`)**: 13 features (Age, Chest Pain, Resting BP, Cholesterol, Max Heart Rate, ST depression, etc.).
   - **Chronic Disease Risk (`brfss_pipeline.pkl`)**: 19 CDC BRFSS epidemiological parameters.
2. **Groq AI Personalized Care Recommendations**:
   - Generates structured guidance across 6 categories: General Lifestyle, Diet Suggestions, Physical Activity, Health Monitoring, Follow-up Actions, and Preventive Guidance + Medical Disclaimer.
3. **Multilingual Healthcare Chatbot (Groq API)**:
   - Interactive AI assistant fluent in **Tamil (தமிழ்)**, **English**, and **Hindi (हिंदी)** for health queries.
4. **Interactive Dashboard & Risk Visualization**:
   - Circular SVG risk probability gauges, key factor badges, trend trajectory charts (`recharts`), and health alerts.
5. **AWS Cloud & DB Compatibility**:
   - Configured for local development with SQLite and production deployment on AWS RDS (PostgreSQL/MySQL) or AWS DynamoDB.

---

## 🏗️ Project Architecture

```
                                 ┌──────────────────┐
                                 │      USER        │
                                 └────────┬─────────┘
                                          │
                                 ┌────────▼─────────┐
                                 │   React.js       │
                                 │    Frontend      │
                                 └────────┬─────────┘
                                          │ REST API (JWT)
                                 ┌────────▼─────────┐
                                 │ Python + FastAPI │
                                 │     Backend      │
                                 └───┬───────────┬──┘
                                     │           │
           ┌─────────────────────────▼──┐     ┌──▼──────────────────────────┐
           │ Existing .pkl ML Pipelines │     │ Groq API (AI Care & Chat)   │
           │ (Diabetes, Heart, BRFSS)   │     │ (Tamil, English, Hindi)     │
           └────────────────────────────┘     └─────────────────────────────┘
```

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run FastAPI Backend

```bash
# Navigate to project root
cd /path/to/ML_Models_Delivery

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
pip install -r backend/requirements.txt

# Start FastAPI backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI Swagger Documentation will be available at: `http://127.0.0.1:8000/docs`

---

### 2. Run React Frontend

```bash
# In a new terminal window:
cd /path/to/ML_Models_Delivery/frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

The React Web Application will open at: `http://localhost:5173`

---

## 🔑 Environment Variables (`backend/.env`)

```env
# Backend Settings
PROJECT_NAME="Chronic Disease Health Monitoring Platform"
JWT_SECRET_KEY="your_secure_jwt_secret_key"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (Local SQLite default or AWS RDS)
DATABASE_URL="sqlite:///./health_platform.db"

# AWS Configuration
AWS_DATABASE_TYPE="sqlite" # Options: sqlite, rds_postgres, rds_mysql, dynamodb
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Groq API Configuration
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL="llama-3.3-70b-versatile"
```

---

## 🤖 ML Models Integration Details

| Disease Risk | Pipeline File | Expected Features | Output Format |
|---|---|---|---|
| **Diabetes** | `diabetes_pipeline.pkl` | `preg`, `plas`, `pres`, `skin`, `insu`, `mass`, `pedi`, `age` | `predict_proba()[:, 1]` probability (0-100%) & Risk Category (`LOW`, `MODERATE`, `HIGH`) |
| **Cardiovascular** | `heart_pipeline.pkl` | `age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal` | `predict_proba()[:, 1]` probability & Risk Category |
| **Chronic Risk** | `brfss_pipeline.pkl` | `HighBP`, `HighChol`, `BMI`, `Smoker`, `Stroke`, `HeartDiseaseorAttack`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcoholConsump`, `AnyHealthcare`, `GenHlth`, `MentHlth`, `PhysHlth`, `DiffWalk`, `Sex`, `Age`, `Education`, `Income` | `predict_proba()[:, 1]` probability & Risk Category |

---

## 🐳 Docker Orchestration

Run the entire application stack using Docker Compose:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:80`
- Backend: `http://localhost:8000`

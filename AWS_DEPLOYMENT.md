# AWS Deployment & Production Setup Guide

This document details how to deploy the **Chronic Disease Health Monitoring & Risk Prediction Platform** to **Amazon Web Services (AWS)** adhering to standard enterprise cloud practices.

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────┐
                      │    End User (Browser)│
                      └──────────┬───────────┘
                                 │
                 ┌───────────────▼────────────────┐
                 │ React.js Frontend (AWS Amplify) │
                 └───────────────┬────────────────┘
                                 │ REST API (HTTPS)
                 ┌───────────────▼────────────────┐
                 │ FastAPI Backend (App Runner/ECS)│
                 └──────┬──────────────────┬──────┘
                        │                  │
       ┌────────────────▼──────┐  ┌────────▼─────────────────┐
       │ AWS RDS PostgreSQL DB │  │ Groq API (AI Care & Chat)│
       └───────────────────────┘  └──────────────────────────┘
```

---

## 1. 🗄️ AWS Database Setup (AWS RDS PostgreSQL)

### Option A: AWS RDS (PostgreSQL)
1. Navigate to **AWS RDS Console** -> **Create Database**.
2. Select Engine: **PostgreSQL** (version 15+).
3. Under **Templates**, select *Free tier* or *Dev/Test*.
4. DB instance identifier: `aurahealth-db`.
5. Master username: `dbadmin`. Set a strong password.
6. Under **Connectivity**:
   - Virtual Private Cloud (VPC): Default VPC
   - Publicly Accessible: `No` (recommended) or `Yes` (for testing).
7. Copy the Database Endpoint: e.g. `aurahealth-db.c123456789.us-east-1.rds.amazonaws.com`.
8. Set environment variable:
   ```bash
   DATABASE_URL="postgresql://dbadmin:YOUR_PASSWORD@aurahealth-db.c123456789.us-east-1.rds.amazonaws.com:5432/aurahealth"
   AWS_DATABASE_TYPE="rds_postgres"
   ```

---

## 2. ⚡ AWS Backend Deployment (AWS App Runner / Elastic Beanstalk)

### Option A: AWS App Runner (Easiest & Automatic SSL)
1. Push your repository to GitHub or container image to **AWS ECR**.
2. In AWS Console, go to **App Runner** -> **Create Service**.
3. Choose **Repository Type**: Source code repository or Container image.
4. Select repository and branch (`main`).
5. Build settings:
   - Runtime: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
6. Add Environment Variables:
   ```env
   GROQ_API_KEY=gsk_...
   JWT_SECRET_KEY=your_production_jwt_secret_key
   DATABASE_URL=postgresql://dbadmin:password@rds-endpoint:5432/aurahealth
   AWS_REGION=us-east-1
   ```
7. Click **Create & Deploy**. AWS App Runner will provide an HTTPS endpoint (e.g. `https://xyz.us-east-1.awsapprunner.com`).

---

## 3. 🌐 AWS Frontend Deployment (AWS Amplify / AWS S3 + CloudFront)

### Option A: AWS Amplify (Recommended)
1. Open **AWS Amplify Console** -> **New app** -> **Host web app**.
2. Connect your GitHub repository and select `main` branch.
3. Select `frontend` directory.
4. Build Settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend && npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
5. Deploy. Add environment rewrite rule in Amplify Console for API calls pointing to AWS App Runner URL.

---

## 4. 🔑 Security Checklist

1. **NEVER** commit `.env` files with actual AWS credentials or Groq API keys to source control.
2. Ensure **CORS_ORIGINS** in `backend/app/core/config.py` is restricted to your production frontend domain (e.g. `https://aurahealth.amplifyapp.com`).
3. Store `GROQ_API_KEY` and `JWT_SECRET_KEY` in AWS Secrets Manager or App Runner Environment Secrets.

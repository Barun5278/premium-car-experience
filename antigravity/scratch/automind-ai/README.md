# AUTOMIND AI — Enterprise Automotive Intelligence Platform

<div align="center">
  <h3>Next-Generation Automotive Intelligence Platform</h3>
  <p>Photorealistic 3D Vehicle Showcase • Gemini AI Car Assistant • XGBoost Valuation Engine • Multimodal Recommendations</p>
</div>

---

## 1. System Architecture Overview

```
                                  +---------------------------------------+
                                  |         AUTOMIND AI CLIENT            |
                                  |  Next.js 15 (App Router) + TypeScript |
                                  |  Tailwind CSS v4 + Framer Motion      |
                                  |  Three.js / React Three Fiber (3D)    |
                                  +---------------------------------------+
                                                     |
                                                     | HTTP / JSON (REST)
                                                     v
                                  +---------------------------------------+
                                  |         FASTAPI BACKEND CORE          |
                                  |  Python 3.12 + Uvicorn + Pydantic v2  |
                                  |  API Versioning (/api/v1/...)         |
                                  +---------------------------------------+
                                    /                 |                 \
                                   /                  |                  \
                                  v                   v                   v
                     +--------------------+  +------------------+  +--------------------+
                     |  GOOGLE GEMINI AI  |  |   DATABASE / ORM |  |  ML PRICE ENGINE   |
                     |  google-genai SDK  |  |  PostgreSQL /    |  |  XGBoost + Sklearn |
                     |  - Assistant Chat  |  |  Supabase Async  |  |  - Valuations      |
                     |  - Smart Advisor   |  |  - Car Catalog   |  |  - Feature Impact  |
                     |  - Spec Analysis   |  |  - User Profiles |  |  - Trends & CI     |
                     +--------------------+  +------------------+  +--------------------+
```

---

## 2. Directory Structure

```
automind-ai/
├── README.md                      # Architecture & Developer Guide
├── package.json                   # Root scripts orchestrator
├── .gitignore                     # Monorepo git exclusion rules
│
├── frontend/                      # Client-Side Application
│   ├── app/                       # Next.js App Router (Layouts, Pages, Globals)
│   ├── components/                # Modular Component Architecture
│   │   ├── ui/                    # Base Design System (Button, Card, Badge, Input, Container)
│   │   ├── 3d/                    # Three.js / R3F Canvas & Vehicle Meshes
│   │   ├── layout/                # Shell, Navbar, Navigation Drawers
│   │   └── ai/                    # AI Assistant Dialog & Recommendation Cards
│   ├── lib/
│   │   ├── api/                   # Typed API Client (api.cars, api.ml, api.ai)
│   │   ├── hooks/                 # Custom React Hooks
│   │   └── constants/             # Design Tokens & Navigation Map
│   └── types/                     # Strict TypeScript Definitions (car.ts, ml.ts, ai.ts)
│
├── backend/                       # Core API & Service Layer
│   ├── main.py                    # FastAPI Entrypoint & Middleware Configuration
│   ├── requirements.txt           # Backend Dependencies
│   └── app/
│       ├── core/                  # Configuration & Environment Settings
│       ├── db/                    # Supabase & PostgreSQL Session Handlers
│       ├── schemas/               # Pydantic Request/Response DTOs
│       ├── services/              # Decoupled Business Logic (AI, ML, Cars)
│       └── api/v1/                # Versioned REST Endpoints (/health, /cars, /ml, /ai)
│
└── ml/                            # Machine Learning Subsystem
    ├── data/                      # Raw & Processed Datasets
    ├── notebooks/                 # Exploratory Data Analysis & Validation
    ├── src/
    │   ├── data_pipeline.py       # ColumnTransformer & Preprocessing
    │   ├── train.py               # XGBoost Model Training Pipeline
    │   └── predict.py             # Production Inference Engine
    └── models/                    # Serialized Joblib Artifacts (.joblib)
```

---

## 3. Key Architectural Principles

1. **Zero Client Secret Exposure**: All AI keys (`GEMINI_API_KEY`) and database credentials remain strictly within the FastAPI environment. The frontend communicates exclusively through `/api/v1/` endpoints.
2. **Decoupled Machine Learning**: The ML pipeline can be trained independently, evaluated, and serialized to disk. The FastAPI backend loads the inference pipeline seamlessly without hardcoding predictions.
3. **Automotive Luxury Design System**: Pre-configured dark-mode tokens (`#07090E` obsidian background, `#00F0FF` cyan accents, `#FF2A54` crimson highlights) with frosted glass panels (`backdrop-blur-md`).
4. **End-to-End Type Safety**: TypeScript interfaces in `frontend/types/` strictly mirror Pydantic schemas in `backend/app/schemas/`.

---

## 4. Setup & Local Development

### Prerequisites
- Node.js >= 20
- Python >= 3.11

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
# API Docs available at http://localhost:8000/api/v1/docs
```

### ML Pipeline Training
```bash
cd ml
python -m venv .venv
# Activate venv, then:
pip install -r requirements.txt
python src/train.py
# Exports trained artifacts to ml/models/
```

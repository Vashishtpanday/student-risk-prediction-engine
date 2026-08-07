# AI-Based Student Risk Prediction Engine — ML Service

## Assigned To
Person 1 — ML Engineer + Python Backend Lead

## Module Overview
This module contains the Machine Learning model and the Python-based
microservice (Flask/FastAPI) that handles all prediction logic.
It receives student academic data, processes it through the trained ML model,
and returns a risk category (Low / Moderate / High) along with
confidence scores.

---

## Folder Structure

ml-service/
│
├── data/
│   ├── raw/
│   │   └── student_raw_data.csv
│   ├── processed/
│   │   └── student_cleaned_data.csv
│   └── sample/
│       └── sample_input.json
│
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_model_training.ipynb
│   └── 04_model_evaluation.ipynb
│
├── models/
│   ├── logistic_regression_model.pkl
│   ├── decision_tree_model.pkl
│   ├── random_forest_model.pkl
│   └── best_model.pkl
│
├── src/
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   ├── cleaner.py
│   │   ├── encoder.py
│   │   └── normalizer.py
│   │
│   ├── training/
│   │   ├── __init__.py
│   │   ├── train_logistic.py
│   │   ├── train_decision_tree.py
│   │   ├── train_random_forest.py
│   │   └── evaluate.py
│   │
│   ├── prediction/
│   │   ├── __init__.py
│   │   ├── predictor.py
│   │   └── risk_classifier.py
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py
│
├── api/
│   ├── __init__.py
│   ├── app.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── predict.py
│   │   └── batch_predict.py
│   └── middleware/
│       ├── __init__.py
│       └── validator.py
│
├── tests/
│   ├── test_model.py
│   ├── test_api.py
│   └── test_preprocessing.py
│
├── requirements.txt
├── .env
├── .env.example
├── .gitignore
└── README.md

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Python 3.10+ | Core programming language |
| Flask / FastAPI | ML microservice API |
| Scikit-learn | ML algorithms |
| Pandas | Data manipulation |
| NumPy | Numerical operations |
| Matplotlib / Seaborn | Model evaluation plots |
| Joblib / Pickle | Model serialization |

---

## API Endpoints

### POST /predict

Accepts single student data and returns risk prediction.

Request Body:

{
  "student_id": "STU001",
  "attendance_pct": 72.5,
  "internal_marks": 38,
  "cp_ncp": "NCP",
  "semester": 3
}

Response:

{
  "student_id": "STU001",
  "risk_category": "High Risk",
  "confidence_score": 0.87,
  "contributing_factors": {
    "attendance_pct": "60%",
    "internal_marks": "30%",
    "cp_ncp": "10%"
  }
}

---

### POST /batch-predict

Accepts a list of students and returns predictions for all.

Request Body:

{
  "students": [
    {
      "student_id": "STU001",
      "attendance_pct": 72.5,
      "internal_marks": 38,
      "cp_ncp": "NCP",
      "semester": 3
    },
    {
      "student_id": "STU002",
      "attendance_pct": 90.0,
      "internal_marks": 75,
      "cp_ncp": "CP",
      "semester": 3
    }
  ]
}

Response:

{
  "predictions": [
    {
      "student_id": "STU001",
      "risk_category": "High Risk",
      "confidence_score": 0.87
    },
    {
      "student_id": "STU002",
      "risk_category": "Low Risk",
      "confidence_score": 0.92
    }
  ]
}

---

## How to Run Locally

Step 1 — Clone the repo and go to ml-service folder

git clone https://github.com/[owner]/student-risk-prediction-engine.git
cd student-risk-prediction-engine/ml-service

Step 2 — Switch to your branch

git checkout feature/ml-service

Step 3 — Create a virtual environment

python -m venv venv

Step 4 — Activate virtual environment

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

Step 5 — Install dependencies

pip install -r requirements.txt

Step 6 — Create your .env file

cp .env.example .env

Step 7 — Run the API server

python api/app.py

The ML API will run on: http://localhost:5001

---

## requirements.txt

flask==3.0.0
fastapi==0.104.0
uvicorn==0.24.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.26.2
matplotlib==3.8.2
seaborn==0.13.0
joblib==1.3.2
python-dotenv==1.0.0
pydantic==2.5.2

---

## ML Models to Train

| Model | Expected Use |
|-------|-------------|
| Logistic Regression | Baseline model |
| Decision Tree | Interpretable model |
| Random Forest | Best performance |

Target Variable: risk_category — Low Risk / Moderate Risk / High Risk

Features Used:
- attendance_pct — Attendance percentage
- internal_marks — Internal assessment marks
- cp_ncp — CP or NCP status
- semester — Current semester number

---

## Coordination Points

- Receive clean dataset CSV from Person 4
- Share /predict and /batch-predict API details with Person 2
- Share feature importance output format with Person 4
- ML service runs on port 5001

---

## Weekly Plan

| Week | Tasks |
|------|-------|
| Week 1 | Data collection, cleaning, EDA, feature engineering |
| Week 2 | Train models, evaluate, select best model, save .pkl |
| Week 3 | Build Flask API, create /predict and /batch-predict routes |
| Week 4 | Test API, integrate with Node.js backend, fix issues |

---

## Git Workflow

Start working:
git checkout feature/ml-service
git pull origin feature/ml-service

After making changes:
git add .
git commit -m "Add: trained random forest model with 89% accuracy"
git push origin feature/ml-service

Raise a Pull Request to merge into the dev branch when your feature is complete.

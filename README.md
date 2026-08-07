# AI-Based Student Risk Prediction Engine — Data and AI Features

## Assigned To
Person 4 — Data Engineer + AI Features

## Module Overview
This module is responsible for:
1. Creating and preparing the student dataset
2. Performing Exploratory Data Analysis (EDA)
3. Building the Explainable AI module using SHAP and Feature Importance
4. Building the AI Recommendation Engine
5. Building the AI Academic Assistant for natural language queries

The outputs of this module are shared with Person 1 for model training
and integrated into the backend and frontend by Person 2 and Person 3.

---

## Folder Structure

data-ai/
│
├── dataset/
│   ├── raw/
│   │   └── student_data_raw.csv
│   ├── processed/
│   │   └── student_data_cleaned.csv
│   └── synthetic/
│       └── generate_data.py
│
├── eda/
│   ├── 01_basic_statistics.ipynb
│   ├── 02_univariate_analysis.ipynb
│   ├── 03_bivariate_analysis.ipynb
│   ├── 04_correlation_analysis.ipynb
│   ├── 05_class_distribution.ipynb
│   └── eda_report/
│       └── eda_summary.pdf
│
├── explainability/
│   ├── __init__.py
│   ├── shap_explainer.py
│   ├── feature_importance.py
│   ├── explanation_formatter.py
│   └── notebooks/
│       └── explainability_demo.ipynb
│
├── recommendation_engine/
│   ├── __init__.py
│   ├── rule_engine.py
│   ├── recommendation_mapper.py
│   ├── templates/
│   │   └── recommendation_templates.json
│   └── notebooks/
│       └── recommendation_demo.ipynb
│
├── ai_assistant/
│   ├── __init__.py
│   ├── query_parser.py
│   ├── intent_classifier.py
│   ├── response_builder.py
│   ├── assistant_api.py
│   └── notebooks/
│       └── assistant_demo.ipynb
│
├── tests/
│   ├── test_recommendation.py
│   ├── test_explainability.py
│   └── test_assistant.py
│
├── outputs/
│   ├── shap_plots/
│   ├── eda_plots/
│   └── sample_outputs/
│       ├── sample_explanation.json
│       └── sample_recommendations.json
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
| Python 3.10+ | Core language |
| Pandas | Data manipulation |
| NumPy | Numerical computing |
| Matplotlib / Seaborn | EDA visualizations |
| SHAP | Explainable AI |
| Scikit-learn | Feature importance |
| Flask | AI assistant mini API |
| Faker | Synthetic data generation |

---

## Dataset Column Reference

| Column | Type | Description |
|--------|------|-------------|
| student_id | String | Unique student identifier |
| name | String | Student name |
| department | String | CSE, ECE, MECH etc |
| semester | Integer | 1 to 8 |
| attendance_pct | Float | 0 to 100 |
| internal_marks | Float | 0 to 100 |
| cp_ncp | String | CP or NCP |
| previous_backlogs | Integer | Number of past backlogs |
| risk_category | String | Low Risk / Moderate Risk / High Risk |

---

## Explainability Output Format

Your explanation_formatter.py must return this structure
so Person 1 can include it in the ML API response:

{
  "student_id": "STU001",
  "contributing_factors": {
    "attendance_pct": {
      "contribution_pct": 58,
      "impact": "negative",
      "message": "Low attendance is the primary risk factor"
    },
    "internal_marks": {
      "contribution_pct": 32,
      "impact": "negative",
      "message": "Below average internal marks increasing risk"
    },
    "cp_ncp": {
      "contribution_pct": 10,
      "impact": "negative",
      "message": "NCP status adds to academic risk"
    }
  }
}

---

## Recommendation Engine Rule Table

| Condition | Recommendation |
|-----------|---------------|
| attendance_pct less than 60 | Attendance is critically low. Attend all remaining classes immediately. |
| attendance_pct between 60 and 75 | Attendance is below required 75%. Improve to avoid debarment. |
| internal_marks less than 40 | Internal marks are very low. Focus on assignments and internal exams. |
| internal_marks between 40 and 60 | Marks are average. Target improvement in upcoming assessments. |
| cp_ncp equals NCP | NCP status detected. Attend remedial sessions and consult your faculty. |
| risk_category equals High Risk | Immediate faculty intervention recommended. Schedule a counselling session. |
| previous_backlogs greater than 2 | Multiple backlogs detected. Consider academic counselling. |

Recommendation Output Format:

{
  "student_id": "STU001",
  "risk_category": "High Risk",
  "recommendations": [
    {
      "priority": "High",
      "category": "Attendance",
      "message": "Your attendance is critically low. Attend all remaining classes immediately."
    },
    {
      "priority": "High",
      "category": "Assessment",
      "message": "Internal marks are very low. Focus on assignments and internal exams."
    },
    {
      "priority": "Medium",
      "category": "Status",
      "message": "NCP status detected. Attend remedial sessions and consult your faculty."
    }
  ]
}

---

## AI Academic Assistant Example Queries

| Faculty Query | System Response |
|---------------|----------------|
| Show high risk students in CSE | Returns filtered list of high risk CSE students |
| How many students have low attendance | Returns count of students with attendance below 75 |
| List NCP students in semester 3 | Returns NCP students from semester 3 |
| Who needs immediate intervention | Returns all High Risk students |
| Show students with backlogs | Returns students with previous backlogs greater than 0 |

---

## How to Run Locally

Step 1 — Clone and navigate

git clone https://github.com/[owner]/student-risk-prediction-engine.git
cd student-risk-prediction-engine/data-ai

Step 2 — Switch to your branch

git checkout feature/data-ai

Step 3 — Create virtual environment

python -m venv venv

Step 4 — Activate virtual environment

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

Step 5 — Install dependencies

pip install -r requirements.txt

Step 6 — Generate synthetic dataset

python dataset/synthetic/generate_data.py

Step 7 — Run EDA notebooks

jupyter notebook eda/

Step 8 — Run AI assistant API

python ai_assistant/assistant_api.py

AI Assistant runs on: http://localhost:5002

---

## requirements.txt

pandas==2.1.3
numpy==1.26.2
matplotlib==3.8.2
seaborn==0.13.0
shap==0.44.0
scikit-learn==1.3.2
faker==20.1.0
flask==3.0.0
jupyter==1.0.0
notebook==7.0.6
python-dotenv==1.0.0

---

## Coordination Points

- Share student_data_cleaned.csv with Person 1 for model training
- Share explanation JSON format with Person 1 to include in ML API response
- Share recommendation JSON format with Person 2 to store in MongoDB
- Share AI assistant API details with Person 2 and Person 3
- AI assistant mini API runs on port 5002

---

## Weekly Plan

| Week | Tasks |
|------|-------|
| Week 1 | Generate synthetic dataset, data cleaning, EDA notebooks |
| Week 2 | SHAP explainability module, feature importance formatting |
| Week 3 | Rule-based recommendation engine, output JSON formatting |
| Week 4 | AI academic assistant, API setup, integration and testing |

---

## Git Workflow

Start working:
git checkout feature/data-ai
git pull origin feature/data-ai

After making changes:
git add .
git commit -m "Add: synthetic student dataset generation script"
git push origin feature/data-ai

Raise a Pull Request to merge into the dev branch when your feature is complete.

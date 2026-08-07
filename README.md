# STUDENT RISK PREDICTION ENGINE

# AI-Based Student Risk Prediction Engine

## What is this Project
An intelligent ERP module that predicts student academic risk using
Machine Learning based on attendance, internal marks, and CP/NCP status.
The system classifies students into Low Risk, Moderate Risk, or High Risk
and provides personalized academic recommendations.

---

## Team Branches and Roles

| Branch | Person | Role |
|--------|--------|------|
| ml-service/manshi | Manshi | ML model and Python Flask API |
| backend/roopa | Roopa | Node.js backend and MongoDB |
| frontend/vashisht | Vashisht | React.js web application |
| data-ai/prudhvi | Prudhvi | Dataset, EDA, AI features |

---

## Branch Structure and What Each Branch is For

### main branch
This is the final stable branch.
Only fully tested and completed code lives here.
Nobody pushes directly to this branch.
Code comes here only after it is tested in dev branch.
Lead merges dev into main for the final release.

### dev branch
This is the integration branch.
When anyone finishes their feature they merge into dev first.
All features are combined and tested here.
Only after everything works in dev it goes to main.

### ml-service/manshi
This is Manshi's working branch.
All ML model and Flask API code goes here.
When done raise a Pull Request to dev.

### backend/roopa
This is Roopa's working branch.
All Node.js Express and MongoDB code goes here.
When done raise a Pull Request to dev.

### frontend/vashisht
This is Vashisht's working branch.
All React.js UI code goes here.
When done raise a Pull Request to dev.

### data-ai/prudhvi
This is Prudhvi's working branch.
All dataset EDA and AI feature code goes here.
When done raise a Pull Request to dev.

---

## Service Ports

| Service | Port |
|---------|------|
| React Frontend | 5173 |
| Node.js Backend | 5000 |
| Python ML Service | 5001 |
| AI Assistant API | 5002 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js, MongoDB |
| ML Service | Python, Flask, Scikit-learn |
| AI Features | SHAP, Rule Engine, Faker |

---

## Rules for Everyone

- Never push directly to main or dev
- Always work only on your assigned branch
- Pull before you start working every day
- Write clear commit messages
- Raise a Pull Request to dev when your feature is complete
- Do not touch other persons folder

---

## Commit Message Format

Add: something new was added
Fix: a bug was fixed
Update: existing code was changed
Remove: something was deleted
Docs: documentation updated
Test: test file added

---

## How the Code Flow Works

your feature branch
       ↓
raise Pull Request
       ↓
     dev branch (integration and testing)
       ↓
raise Pull Request (Lead only)
       ↓
   main branch (final stable release)

---

## Git Workflow — How to Setup and Work on Your Branch

### Step 1 — Install Git
Go to https://git-scm.com and download Git
After installing open Command Prompt or Terminal
Run this to confirm:

git --version

---

### Step 2 — Setup Git with Your Details
Run these two commands once on your machine:

git config --global user.name "Your Full Name"
git config --global user.email "youremail@gmail.com"

---

### Step 3 — Clone the Repository
Go to the GitHub repo link shared by the lead
Click the green Code button
Copy the HTTPS link
Run this in your terminal:

git clone https://github.com/Vashishtpanday/student-risk-prediction-engine.git

Then go into the folder:

cd student-risk-prediction-engine

---

### Step 4 — Switch to Your Branch

Manshi run:
git checkout ml-service/manshi

Roopa run:
git checkout backend/roopa

Vashisht run:
git checkout frontend/vashisht

Prudhvi run:
git checkout data-ai/prudhvi

Confirm you are on the right branch:
git branch

The branch with * in front is your current branch

---

### Step 5 — Daily Routine
Every single day before you start working run this:

git pull origin feature/your-branch-name

This makes sure you have the latest code before starting.

---

### Step 6 — After Writing Code Save and Push
Run these 3 commands after writing code:

git add .
git commit -m "Add: describe what you did here"
git push origin your-branch-name

---

### Step 7 — When Your Feature is Complete Raise a Pull Request

Go to the GitHub repo
Click Pull Requests tab
Click New Pull Request
Set base to dev and compare to feature/your-branch-name
Click Create Pull Request
Write what you built in the description
Click Create Pull Request
Lead will review and merge it

---

## Commit Message Examples

git commit -m "Add: student mongoose schema"
git commit -m "Fix: prediction API wrong response"
git commit -m "Update: dashboard chart colors"
git commit -m "Add: SHAP explainability module"
git commit -m "Docs: updated README"
git commit -m "Test: added unit tests for prediction"

---

## Important Rules

- Always work on your own branch only
- Never push to main or dev directly
- Pull every day before starting
- Push your code every day even if not complete
- Raise Pull Request only when feature is fully done
- Do not edit files in other persons folders

---

## Folder Structure Overview

student-risk-prediction-engine/
│
├── ml-service/        Person 1 — ML model and Python Flask API
├── backend/           Person 2 — Node.js Express and MongoDB
├── frontend/          Person 3 — React.js web application
├── data-ai/           Person 4 — Dataset EDA and AI features
└── README.md          This file

---

## Each Person Read Your Module README

After cloning and switching to your branch
open your folder and read the README.md inside it
That file has your full task list folder structure and setup steps

Person 1 — open ml-service/README.md
Person 2 — open backend/README.md
Person 3 — open frontend/README.md
Person 4 — open data-ai/README.md

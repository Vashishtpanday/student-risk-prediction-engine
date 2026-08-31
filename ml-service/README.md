\# Student Risk Prediction ML Service



This module provides the Machine Learning service for the Student Risk Prediction Engine.



\## Features



The model predicts student academic risk using:



\- Attendance percentage

\- Internal marks

\- Semester

\- Previous backlogs



The risk categories are:



\- Low Risk

\- Moderate Risk

\- High Risk



\## ML Models Evaluated



The following models were trained and evaluated:



1\. Logistic Regression

2\. Decision Tree

3\. Random Forest



The Decision Tree achieved the best performance on the current synthetic dataset and was selected as the final model.



\## Project Structure



```text

ml-service/

│

├── data/

│   └── student\_data.csv

│

├── models/

│   └── student\_risk\_model.pkl

│

├── src/

│   ├── train\_model.py

│   ├── evaluate\_model.py

│   └── app.py

│

├── tests/

│   └── test\_api.py

│

├── requirements.txt

└── .gitignore


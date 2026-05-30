# AI-Based Spam and Ham Message Detection System (Flask)

Welcome to the **AI-Based Spam and Ham Message Detection System (Veritas AI)**! This repository is built as an educational tool, demonstrating how Artificial Intelligence reads, processes, and classifies text messages dynamically.

The system features a **Python Flask backend API** and a custom **HTML5/CSS3/JavaScript dashboard**.

---

## ⚙️ Complete System Flow

```text
Dataset (Old Messages)
   ↓
Preprocessing (Cleaning: lowercasing, removing symbols, removing filler words)
   ↓
Feature Extraction (TF-IDF: Translating words into numbers)
   ↓
Machine Learning Training (Naive Bayes learns patterns)
   ↓
Save Model (Pickling trained intelligence)
   ↓
Flask Web server backend (API)
   ↓
HTML5/CSS3/JS Frontend (Dashboard UI)
   ↓
User Inputs Message → Cleaned → Numerized → Prediction (Spam or Ham)
```

---

## 🎨 Frontend & Backend Features
*   **HTML5/CSS3 Dashboard**: Structured with standard layout, dark theme backgrounds, custom neon status highlights (red for Spam, green for Ham), and glassmorphic card elements.
*   **6 Statistics Cards**: Scanned Count (`5,572`), Spam Detected (`747`), Ham Received (`4,825`), Model Accuracy (`97.1%`), Vocabulary Size (`8,342`), and Features Extracted (`14,756`).
*   **Dynamic Charting (Chart.js)**: Utilizes the Chart.js CDN library in the browser to map, sort, and render line, doughnut, and bar charts showing word TF-IDF scores dynamically upon analysis.
*   **Interactive Presets**: Offers click-and-fill chips containing typical Spam and Ham templates.
*   **Pipeline Inspector**: Displays intermediate preprocessing details (original text, lowercased, symbol-cleaned, and stopword-removed keywords).
*   **7-Page Router Navigation**: Switch between Dashboard, Preprocessing, TF-IDF Analysis, Dataset Analytics, Model Details, Model Monitoring, and Prediction History logs.
*   **Student Viva Preparation**: Highlights answers to the most common questions asked during project examinations.

---

## 🚀 How to Run the Project Locally

### Step 1: Install Dependencies
Open your command terminal inside the project directory and run:
```bash
# Install requirements
pip install -r requirements.txt
```

### Step 2: Start the Flask Server
Run the Flask server:
```bash
python app.py
```
*(Open `http://localhost:5000` in your web browser to play with the dashboard!)*

---

## ☁️ Deployment Guide

### Deploying on Render (Free Tier)
Render.com is a free cloud platform perfect for deploying Python applications:

1.  **Prepare Repository**: Ensure your project is pushed to a GitHub repository and contains the following files in the root folder:
    *   `app.py`
    *   `Procfile`
    *   `requirements.txt`
    *   `templates/` and `static/`
    *   `spam_model.pkl` and `vectorizer.pkl`
2.  **Create Render Web Service**:
    *   Log into [Render](https://render.com) and click **"New" > "Web Service"**.
    *   Connect your GitHub repository.
3.  **Configure Environment**:
    *   **Name**: `spam-ham-detector`
    *   **Runtime**: `Python`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
4.  **Deploy**: Click **"Deploy Web Service"**. Render will host your application at a public URL (e.g. `https://spam-ham-detector.onrender.com`).

---

## 🎓 Viva / Exam Preparation Guide (For Students)

If your teacher or examiner asks you about this project, here are the exact answers to the most common questions:

### Q1: What is the main objective of this project?
> *"The objective is to build a machine learning pipeline that automatically classifies text messages into 'Spam' or 'Ham'. It demonstrates how raw text is cleaned, translated into numeric features using TF-IDF, and classified using a Naive Bayes probability model."*

### Q2: Why did you choose Naive Bayes?
> *"Naive Bayes is a probabilistic classifier based on Bayes' Theorem. It is widely used in text classification because it is exceptionally fast, easy to train, and performs very well. It assumes that features (words) are independent of each other, which works surprisingly well for text."*

### Q3: What is TF-IDF and why is it needed?
> *"TF-IDF stands for Term Frequency-Inverse Document Frequency. Machine learning algorithms only understand numerical matrices. TF-IDF acts as a translator, converting text into numbers while measuring how important a word is. If a word is common in one message but rare across the entire database, it gets a high TF-IDF score."*

### Q4: What is the purpose of the pickle (`.pkl`) files?
> *"Training a machine learning model takes computation and time. Once trained, we save the model state (`spam_model.pkl`) and vocabulary weights (`vectorizer.pkl`) as pickle files. The Flask server loads these saved files instantly so it can make predictions in real time without retraining."*

### Q5: What is the accuracy of your model?
> *"Our model trained on the UCI SMS dataset achieves an accuracy of **97.12%**."*

# 🚆 RailSense AI
> Smart Indian Railways Assistant — FAR AWAY 2026 Hackathon

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Groq](https://img.shields.io/badge/Groq-llama3.3-orange)

## 🎯 Problem Statement
Indian Railways serves 23 million passengers daily. Passengers face:
- ❓ Uncertainty about waitlisted ticket confirmation
- 👥 No real-time crowd information at stations
- 🔍 No single intelligent assistant for railway queries

**RailSense AI solves all three in one platform.**

---

## ✨ Features
| Feature | Description |
|--------|-------------|
| 🎫 Waitlist Predictor | ML model predicts if WL ticket will confirm |
| 📊 Crowd Dashboard | Real-time crowd level by station & hour |
| 🚂 Train Search | Search train details by train number |
| 🎟️ PNR Status | Check passenger-wise booking status |
| 🤖 AI Chat | Groq-powered LLM for railway queries |

---

## 🛠️ Tech Stack
- **ML Model** — Python, Scikit-learn (RandomForest)
- **Backend** — FastAPI, Uvicorn
- **AI Chat** — Groq API (llama-3.3-70b-versatile)
- **Frontend** — React.js
- **Tools** — Pandas, Joblib, python-dotenv

---

## 🚀 How to Run

### 1. Clone the repo
```bash
git clone https://github.com/Trishna-25/railsense-ai.git
cd railsense-ai
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn scikit-learn joblib python-dotenv groq pandas
uvicorn main:app --reload
```

### 3. Add your Groq API key
Create `.env` file inside `backend/`:
GROQ_API_KEY=your_groq_api_key_here

### 4. Frontend setup
```bash
cd frontend
npm install
npm start
```

### 5. Open in browser
http://localhost:3000

---

## 📁 Project Structure
railsense-ai/

├── ml-models/        # ML training code & saved model

├── backend/          # FastAPI backend (5 endpoints)

├── frontend/         # React frontend (5 tabs)

└── README.md

---

## 👥 Team
## 👥 Team
- **Trishna** — ML model
- **Sandhiya** — backend
- **Sanjana** — Testing & Research
- **Vrithisha** — UI/UX & Design
- **Nikashini** — Research & Documentation
---

## 🏆 Built for FAR AWAY 2026 Hackathon
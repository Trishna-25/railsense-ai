from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
app = FastAPI()

# CORS - Frontend connect aaga
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model = joblib.load("../ml-models/waitlist_model.pkl")
encoders = joblib.load("../ml-models/encoders.pkl")
target_encoder = joblib.load("../ml-models/target_encoder.pkl")

# Input format
class WaitlistInput(BaseModel):
    waitlist_position: int
    class_of_travel: str
    travel_distance: int
    holiday_or_peak: str
    train_type: str
    seat_availability: int
    number_of_passengers: int

@app.get("/")
def home():
    return {"message": "RailSense AI Backend Running! ✅"}

@app.post("/predict-waitlist")
def predict_waitlist(data: WaitlistInput):
    # Encode categorical inputs
    class_encoded = encoders['Class of Travel'].transform([data.class_of_travel])[0]
    holiday_encoded = encoders['Holiday or Peak Season'].transform([data.holiday_or_peak])[0]
    train_encoded = encoders['Train Type'].transform([data.train_type])[0]

    # Prepare input
    input_data = pd.DataFrame([[
        data.waitlist_position,
        class_encoded,
        data.travel_distance,
        holiday_encoded,
        train_encoded,
        data.seat_availability,
        data.number_of_passengers
    ]], columns=[
        'Waitlist Position', 'Class of Travel', 'Travel Distance',
        'Holiday or Peak Season', 'Train Type', 'Seat Availability',
        'Number of Passengers'
    ])

    # Predict
    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0]
    result = target_encoder.inverse_transform([prediction])[0]
    confidence = round(max(probability) * 100, 2)

    return {
        "status": result,
        "confidence": f"{confidence}%",
        "message": f"Your ticket has {confidence}% chance of being {result}"
    }

@app.get("/crowd-status")
def crowd_status(station: str, hour: int):
    # Rule based crowd logic
    peak_hours = [7, 8, 9, 17, 18, 19, 20]
    busy_stations = ["NDLS", "CSTM", "HWH", "MAS", "SBC"]

    if hour in peak_hours and station.upper() in busy_stations:
        level = "DANGER"
        message = "Very high crowd! Avoid if possible."
        color = "red"
    elif hour in peak_hours or station.upper() in busy_stations:
        level = "WARNING"
        message = "Moderate crowd. Stay alert."
        color = "yellow"
    else:
        level = "SAFE"
        message = "Station is not crowded."
        color = "green"

    return {
        "station": station.upper(),
        "hour": hour,
        "crowd_level": level,
        "message": message,
        "color": color
    }
class ChatInput(BaseModel):
    message: str

@app.post("/chat")
def chat(data: ChatInput):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are RailSense AI assistant. Help passengers with Indian Railways queries about waitlist tickets, crowd status, and train information. Keep answers short and helpful."
            },
            {
                "role": "user",
                "content": data.message
            }
        ]
    )
    return {"reply": response.choices[0].message.content}
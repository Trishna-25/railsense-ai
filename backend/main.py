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
@app.get("/train-search")
def train_search(train_no: str):
    mock_trains = {
        "12622": {
            "train_no": "12622",
            "name": "Tamil Nadu Express",
            "from": "MAS - Chennai Central",
            "to": "NDLS - New Delhi",
            "departure": "22:00",
            "arrival": "07:55",
            "duration": "33h 55m",
            "classes": ["Sleeper", "3A", "2A", "1A"],
            "status": "Running on time"
        },
        "12163": {
            "train_no": "12163",
            "name": "Chennai Dadar Express",
            "from": "MAS - Chennai Central",
            "to": "DR - Dadar",
            "departure": "07:15",
            "arrival": "11:45",
            "duration": "28h 30m",
            "classes": ["Sleeper", "3A", "2A"],
            "status": "Running on time"
        },
        "12621": {
            "train_no": "12621",
            "name": "Tamil Nadu Express",
            "from": "NDLS - New Delhi",
            "to": "MAS - Chennai Central",
            "departure": "22:30",
            "arrival": "08:25",
            "duration": "33h 55m",
            "classes": ["Sleeper", "3A", "2A", "1A"],
            "status": "Delayed by 15 mins"
        },
        "22625": {
            "train_no": "22625",
            "name": "Double Decker Express",
            "from": "MAS - Chennai Central",
            "to": "SBC - KSR Bengaluru",
            "departure": "06:05",
            "arrival": "12:05",
            "duration": "6h 00m",
            "classes": ["CC", "2S"],
            "status": "Running on time"
        },
        "12671": {
            "train_no": "12671",
            "name": "Nilagiri Express",
            "from": "MAS - Chennai Central",
            "to": "CBE - Coimbatore",
            "departure": "21:15",
            "arrival": "06:30",
            "duration": "9h 15m",
            "classes": ["Sleeper", "3A", "2A"],
            "status": "Running on time"
        },
    }
    
    result = mock_trains.get(train_no.strip())
    if result:
        return {"found": True, "train": result}
    else:
        return {"found": False, "message": f"Train {train_no} not found in database"}
@app.get("/pnr-status")
def pnr_status(pnr: str):
    mock_pnr = {
        "1234567890": {
            "pnr": "1234567890",
            "train_no": "12622",
            "train_name": "Tamil Nadu Express",
            "from": "MAS - Chennai Central",
            "to": "NDLS - New Delhi",
            "date": "15-Jun-2026",
            "class": "Sleeper",
            "passengers": [
                {"name": "Passenger 1", "seat": "S4/32", "status": "Confirmed"},
                {"name": "Passenger 2", "seat": "S4/33", "status": "Confirmed"},
            ]
        },
        "9876543210": {
            "pnr": "9876543210",
            "train_no": "12671",
            "train_name": "Nilagiri Express",
            "from": "MAS - Chennai Central",
            "to": "CBE - Coimbatore",
            "date": "16-Jun-2026",
            "class": "3A",
            "passengers": [
                {"name": "Passenger 1", "seat": "WL/14", "status": "Waitlist"},
            ]
        },
        "1122334455": {
            "pnr": "1122334455",
            "train_no": "22625",
            "train_name": "Double Decker Express",
            "from": "MAS - Chennai Central",
            "to": "SBC - KSR Bengaluru",
            "date": "14-Jun-2026",
            "class": "CC",
            "passengers": [
                {"name": "Passenger 1", "seat": "D1/15", "status": "Confirmed"},
                {"name": "Passenger 2", "seat": "D1/16", "status": "Confirmed"},
                {"name": "Passenger 3", "seat": "D1/17", "status": "Confirmed"},
            ]
        },
    }
    result = mock_pnr.get(pnr.strip())
    if result:
        return {"found": True, "pnr_data": result}
    else:
        return {"found": False, "message": f"PNR {pnr} not found in database"}
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load data
df = pd.read_csv("Railway Ticket Confirmation.csv")

# Fill missing values
# Fill missing values
df['Waitlist Position'] = df['Waitlist Position'].fillna('WL0')
# Remove "WL" and convert to number
df['Waitlist Position'] = df['Waitlist Position'].str.replace('WL', '').astype(int)
df['Special Considerations'] = df['Special Considerations'].fillna('None')

# Select features
features = [
    'Waitlist Position',
    'Class of Travel', 
    'Travel Distance',
    'Holiday or Peak Season',
    'Train Type',
    'Seat Availability',
    'Number of Passengers'
]

target = 'Confirmation Status'

# Encode ALL categorical columns including Seat Availability
le_dict = {}
categorical_cols = [
    'Class of Travel', 
    'Holiday or Peak Season', 
    'Train Type', 
    'Seat Availability'
]

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    le_dict[col] = le

# Encode target
le_target = LabelEncoder()
y = le_target.fit_transform(df[target])

# Prepare X
X = df[features]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
print("Training model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, 
      target_names=['Not Confirmed', 'Confirmed']))

# Save model and encoders
joblib.dump(model, 'waitlist_model.pkl')
joblib.dump(le_dict, 'encoders.pkl')
joblib.dump(le_target, 'target_encoder.pkl')
print("\nModel saved as waitlist_model.pkl ✅")
import pandas as pd

df = pd.read_csv("Railway Ticket Confirmation.csv")

# Check Waitlist Position and Seat Availability values
print("Waitlist Position sample:")
print(df['Waitlist Position'].dropna().head(10))
print("\nSeat Availability sample:")
print(df['Seat Availability'].head(10))
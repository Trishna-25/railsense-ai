import kagglehub
import os
import shutil

# Download
path = kagglehub.dataset_download("aaryananil/indian-railway-ticket-confirmation")
print("Path to dataset files:", path)

# Copy CSV to ml-models folder
src = os.path.join(path, "Railway Ticket Confirmation.csv")
dst = os.path.join(os.getcwd(), "Railway Ticket Confirmation.csv")
shutil.copy(src, dst)
print("CSV copied to ml-models folder!")
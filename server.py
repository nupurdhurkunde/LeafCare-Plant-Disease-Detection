from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO

# -----------------------------
# Configuration
# -----------------------------

IMAGE_SIZE = 224
BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "leafcare_mobilenetv2.keras"
CLASS_NAMES_PATH = BASE_DIR / "class_names.txt"

TREATMENT = {
    "Potato___Early_blight": (
        "Remove affected leaves, apply a copper-based fungicide "
        "according to its label, and avoid overhead watering."
    ),
    "Potato___Late_blight": (
        "Late blight can spread rapidly. Remove infected plants "
        "according to local agricultural guidance and seek advice "
        "from an agriculture professional about disease management."
    ),
    "Potato___healthy": (
        "No disease treatment is indicated by this prediction. "
        "Continue regular monitoring and normal plant care."
    ),
    "Tomato_healthy": (
        "No disease treatment is indicated by this prediction. "
        "Continue regular monitoring and normal plant care."
    ),
    "Tomato_Leaf_Mold": (
        "Improve ventilation, reduce humidity, and remove badly "
        "affected leaves where practical. Seek local advice if the "
        "disease persists."
    ),
    "Tomato__Tomato_mosaic_virus": (
        "There is generally no curative treatment for an established "
        "viral infection. Isolate suspicious plants where practical, "
        "clean tools, and seek local agricultural guidance."
    ),
    "Tomato__Target_Spot": (
        "Improve airflow, remove affected leaves where practical, "
        "and ask a local agriculture professional about appropriate "
        "disease-management options."
    ),
}

# -----------------------------
# Create FastAPI application
# -----------------------------

app = FastAPI(
    title="LeafCare API",
    description="Plant leaf disease prediction and care advice",
    version="1.0.0",
)

# Allows the frontend to communicate with this backend.
# These settings are suitable for local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://leafcare-plant-disease-detection-1.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# -----------------------------
# Load model and class names
# -----------------------------

try:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}"
        )

    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(
            f"Class names file not found: {CLASS_NAMES_PATH}"
        )

    model = tf.keras.models.load_model(str(MODEL_PATH))

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
        class_names = [
            line.strip()
            for line in file
            if line.strip()
        ]

    if not class_names:
        raise ValueError("class_names.txt is empty.")

    print("LeafCare model loaded successfully.")
    print("Classes:", class_names)

except Exception as error:
    raise RuntimeError(
        f"Could not load the LeafCare model or class names: {error}"
    ) from error


# -----------------------------
# Home endpoint
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to the LeafCare API!",
        "status": "running",
        "prediction_endpoint": "/predict",
        "documentation": "/docs",
    }


# -----------------------------
# Health-check endpoint
# -----------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "number_of_classes": len(class_names),
    }


# -----------------------------
# Image prediction endpoint
# -----------------------------

@app.post("/predict")
async def predict(image: UploadFile = File(...)):

    # Check the uploaded file type.
    if image.content_type not in {
        "image/jpeg",
        "image/png",
        "image/jpg",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, JPEG, or PNG image.",
        )

    # Read and decode the uploaded image.
    try:
        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded image is empty.",
            )

        # Limit uploaded image size to 10 MB.
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Image size must be 10 MB or less.",
            )

        with Image.open(BytesIO(image_bytes)) as uploaded_image:
            img = uploaded_image.convert("RGB")

    except HTTPException:
        raise

    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid image.",
        )

    # Preprocess the image.
    # This matches the preprocessing in your supplied Streamlit code.
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE))

    arr = np.array(img, dtype="float32")
    arr = np.expand_dims(arr, axis=0)

    # Predict the class.
    try:
        probabilities = model.predict(arr, verbose=0)[0]

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}",
        )

    if len(probabilities) != len(class_names):
        raise HTTPException(
            status_code=500,
            detail=(
                "The model output does not match the number "
                "of entries in class_names.txt."
            ),
        )

    # Find the most likely class.
    index = int(np.argmax(probabilities))
    predicted_class = class_names[index]
    confidence = float(probabilities[index]) * 100

    # Get the matching treatment information.
    treatment = TREATMENT.get(
        predicted_class,
        "No treatment note is available for this class. "
        "Consult a qualified local agriculture professional.",
    )

    # Return results in the format expected by your frontend.
    return {
        "label": predicted_class,
        "disease": predicted_class,
        "prediction": predicted_class,
        "confidence": round(confidence / 100, 6),
        "confidence_percentage": round(confidence, 2),
        "treatment": treatment,
        "advice": treatment,
    }

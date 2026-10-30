# LeafCare – Plant Disease Detection

LeafCare is an AI-powered web application that detects diseases in potato and tomato leaves using image classification. Users can upload a leaf image to get a disease prediction, confidence score and suggested treatment.

## Live Demo

[Visit LeafCare](https://leafcare-plant-disease-detection-1.onrender.com)

## Features

- Upload leaf images for disease detection.
- Predicts 7 potato and tomato leaf categories.
- Displays prediction confidence.
- Provides basic treatment and care suggestions.
- Simple and user-friendly interface.

## Technologies Used

- Python
- TensorFlow / Keras
- MobileNetV2
- FastAPI
- HTML, CSS, JavaScript
- Render

## Supported Diseases

**Potato:** Early Blight, Late Blight, Healthy

**Tomato:** Leaf Mold, Target Spot, Tomato Mosaic Virus, Healthy

## Project Files

- `index.html` – Frontend structure
- `style.css` – Website styling
- `script.js` – Frontend functionality
- `server.py` – FastAPI backend
- `app.py` – Streamlit application
- `leafcare_mobilenetv2.keras` – Trained AI model
- `class_names.txt` – Model class labels
- `requirements.txt` – Python dependencies

## Run Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn server:app --reload
```

Open the frontend using VS Code Live Server.

## Objective

To make plant disease identification easier using artificial intelligence and provide users with useful plant care recommendations.

## Disclaimer

Predictions are AI-generated and should not replace professional agricultural advice.

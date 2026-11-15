import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory, abort
from PIL import Image

IMAGE_SIZE = 224
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---- When to refuse to answer (tune these while testing; can also be set as environment variables) ----
CONF_MIN = float(os.environ.get("CONF_MIN", 0.85))      # top probability must be at least this
MARGIN_MIN = float(os.environ.get("MARGIN_MIN", 0.25))  # top class must beat the 2nd class by this much
BLUR_MIN = float(os.environ.get("BLUR_MIN", 20))        # sharpness score must be at least this
OTHER_NAME = "Other_not_supported"                      # only used if you retrain with an "other" class

# The page files are looked for in a "frontend" folder first, otherwise next to server.py
_frontend = os.path.join(BASE_DIR, "frontend")
FRONTEND_DIR = _frontend if os.path.isdir(_frontend) else BASE_DIR
PUBLIC_FILES = {"index.html", "style.css", "script.js"}   # only these are served to the browser

app = Flask(__name__, static_folder=None)

model = tf.keras.models.load_model(os.path.join(BASE_DIR, "leafcare_mobilenetv2.keras"), compile=False)
with open(os.path.join(BASE_DIR, "class_names.txt")) as f:
    class_names = [line.strip() for line in f if line.strip()]

# Folder name (from class_names.txt) -> (crop, condition), spelled as in the frontend's disease list
LABEL_INFO = {
    "Potato___Early_blight": ("Potato", "Early Blight"),
    "Potato___Late_blight": ("Potato", "Late Blight"),
    "Potato___healthy": ("Potato", "Healthy"),
    "Tomato_healthy": ("Tomato", "Healthy"),
    "Tomato_Leaf_Mold": ("Tomato", "Leaf Mold"),
    "Tomato__Tomato_mosaic_virus": ("Tomato", "Mosaic Virus"),
    "Tomato__Target_Spot": ("Tomato", "Target Spot"),
}

def describe(name):
    if name in LABEL_INFO:
        return LABEL_INFO[name]
    parts = [p for p in name.replace("___", "_").replace("__", "_").split("_") if p]   # fallback guess
    return (parts[0].title() if parts else "Unknown"), (" ".join(parts[1:]).title() or "Unknown")

def sharpness(img):
    """Variance of the Laplacian: high = sharp photo, low = blurry."""
    g = np.array(img.convert("L"), dtype="float32")
    lap = -4 * g[1:-1, 1:-1] + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]
    return float(lap.var())

def estimate_severity(img):
    """Rough % of the leaf that is not healthy green (yellow / brown / dark patches).
    A simple colour-based estimate, not a trained model."""
    hsv = np.array(img.convert("HSV"), dtype="float32")
    hue = hsv[..., 0] * 360 / 255
    sat = hsv[..., 1] / 255
    val = hsv[..., 2] / 255
    leaf = (sat > 0.20) & (val > 0.10)            # ignores grey / white / black background
    green = leaf & (hue >= 70) & (hue <= 160)
    diseased = leaf & ~green
    total = int(leaf.sum())
    if total < 500:
        return 0.0
    return float(min(100.0, 100.0 * diseased.sum() / total))

@app.after_request
def allow_other_origins(resp):
    # lets the page work when it is opened from VS Code Live Server (port 5500)
    resp.headers["Access-Control-Allow-Origin"] = "*"
    return resp

@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<name>")
def page_file(name):
    if name in PUBLIC_FILES:
        return send_from_directory(FRONTEND_DIR, name)
    abort(404)

@app.route("/health")
def health():
    return jsonify({"status": "ok", "classes": class_names,
                    "limits": {"conf_min": CONF_MIN, "margin_min": MARGIN_MIN, "blur_min": BLUR_MIN}})

@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "GET":
        return jsonify({"message": "Server is running. Send a POST request with an image in a form field named 'image'."})

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    try:
        img = Image.open(request.files["image"].stream).convert("RGB")
    except Exception:
        return jsonify({"error": "Could not read that file as an image"}), 400

    img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
    arr = np.array(img, dtype="float32")[None, ...]

    probs = model.predict(arr, verbose=0)[0]
    order = np.argsort(probs)[::-1]
    top, second = int(order[0]), int(order[1])
    conf = float(probs[top])
    margin = conf - float(probs[second])
    sharp = sharpness(img)
    name = class_names[top]

    reason = None
    if sharp < BLUR_MIN:
        reason = "blurry"
    elif name == OTHER_NAME:
        reason = "not_supported"
    elif conf < CONF_MIN or margin < MARGIN_MIN:
        reason = "unsure"

    # printed in the terminal so you can see the numbers and tune the limits above
    print(f"[predict] {name:30s} conf={conf:.2f} margin={margin:.2f} sharpness={sharp:.1f} -> "
          f"{'REJECTED (' + reason + ')' if reason else 'accepted'}", flush=True)

    if reason:
        return jsonify({"rejected": True, "reason": reason, "confidence": round(conf, 3),
                        "margin": round(margin, 3), "sharpness": round(sharp, 1)})

    crop, condition = describe(name)
    severity = 0.0 if condition == "Healthy" else estimate_severity(img)
    return jsonify({
        "label": f"{crop} {condition}",       # shown on the page, e.g. "Potato Early Blight"
        "crop": crop,
        "condition": condition,
        "confidence": conf,                   # 0 to 1 (the page turns it into a percentage)
        "severity": round(severity, 1),       # 0 to 100, rough colour-based estimate
        "margin": round(margin, 3),
        "sharpness": round(sharp, 1),
    })

if __name__ == "__main__":
    # Local run: http://127.0.0.1:8000  (the port your page was written for).
    # On Render, gunicorn starts the app and Render supplies the port.
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)

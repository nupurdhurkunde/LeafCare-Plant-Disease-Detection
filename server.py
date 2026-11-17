import os

# Limit TensorFlow resource usage
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import numpy as np
import tensorflow as tf

# Configure TensorFlow threading before loading the model
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

from flask import Flask, request, jsonify, send_from_directory, abort
from PIL import Image, UnidentifiedImageError


# ==========================================
# CONFIGURATION
# ==========================================

IMAGE_SIZE = 224
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_FILE = os.path.join(
    BASE_DIR, "leafcare_mobilenetv2_8class.keras"
)

CLASS_FILE = os.path.join(
    BASE_DIR, "class_names_8class.txt"
)

THRESHOLD_FILE = os.path.join(
    BASE_DIR, "unsupported_threshold.txt"
)

# Additional validation settings
CONF_MIN = float(os.environ.get("CONF_MIN", 0.85))
MARGIN_MIN = float(os.environ.get("MARGIN_MIN", 0.25))
BLUR_MIN = float(os.environ.get("BLUR_MIN", 20))

# Unsupported class name
OTHER_NAME = "Unsupported"


# ==========================================
# FRONTEND CONFIGURATION
# ==========================================

_frontend = os.path.join(BASE_DIR, "frontend")

FRONTEND_DIR = (
    _frontend if os.path.isdir(_frontend) else BASE_DIR
)

PUBLIC_FILES = {
    "index.html",
    "style.css",
    "script.js"
}


# ==========================================
# FLASK APPLICATION
# ==========================================

app = Flask(__name__, static_folder=None)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ==========================================
# LOAD MODEL
# ==========================================

print("Loading LeafCare 8-class model...", flush=True)

if not os.path.exists(MODEL_FILE):
    raise FileNotFoundError(
        f"Model file not found: {MODEL_FILE}"
    )

if not os.path.exists(CLASS_FILE):
    raise FileNotFoundError(
        f"Class names file not found: {CLASS_FILE}"
    )

if not os.path.exists(THRESHOLD_FILE):
    raise FileNotFoundError(
        f"Threshold file not found: {THRESHOLD_FILE}"
    )


model = tf.keras.models.load_model(
    MODEL_FILE,
    compile=False
)


with open(CLASS_FILE, "r") as f:
    class_names = [
        line.strip()
        for line in f
        if line.strip()
    ]


with open(THRESHOLD_FILE, "r") as f:
    UNSUPPORTED_THRESHOLD = float(f.read().strip())


# ==========================================
# MODEL VALIDATION
# ==========================================

if len(class_names) != 8:
    raise ValueError(
        f"Expected 8 classes, found {len(class_names)}"
    )

if model.output_shape[-1] != len(class_names):
    raise ValueError(
        "Model output count does not match class names."
    )

if not 0 <= UNSUPPORTED_THRESHOLD <= 1:
    raise ValueError(
        "Unsupported threshold must be between 0 and 1."
    )


print("Model loaded successfully!", flush=True)
print("Classes:", class_names, flush=True)

print(
    "Unsupported threshold:",
    UNSUPPORTED_THRESHOLD,
    flush=True
)


# ==========================================
# DISEASE LABEL INFORMATION
# ==========================================

LABEL_INFO = {

    "Potato___Early_blight":
        ("Potato", "Early Blight"),

    "Potato___Late_blight":
        ("Potato", "Late Blight"),

    "Potato___healthy":
        ("Potato", "Healthy"),

    "Tomato_healthy":
        ("Tomato", "Healthy"),

    "Tomato_Leaf_Mold":
        ("Tomato", "Leaf Mold"),

    "Tomato__Tomato_mosaic_virus":
        ("Tomato", "Mosaic Virus"),

    "Tomato__Target_Spot":
        ("Tomato", "Target Spot"),

}


def describe(name):

    if name in LABEL_INFO:
        return LABEL_INFO[name]

    parts = [
        p for p in
        name.replace("___", "_").replace("__", "_").split("_")
        if p
    ]

    return (
        parts[0].title() if parts else "Unknown",
        " ".join(parts[1:]).title() or "Unknown"
    )


# ==========================================
# IMAGE SHARPNESS VALIDATION
# ==========================================

def sharpness(img):

    """
    Variance of Laplacian.
    Lower values generally indicate blurry images.
    """

    g = np.array(
        img.convert("L"),
        dtype="float32"
    )

    lap = (
        -4 * g[1:-1, 1:-1]
        + g[:-2, 1:-1]
        + g[2:, 1:-1]
        + g[1:-1, :-2]
        + g[1:-1, 2:]
    )

    return float(lap.var())


# ==========================================
# DISEASE SEVERITY ESTIMATION
# ==========================================

def estimate_severity(img):

    """
    Estimates the percentage of non-green pixels.

    This is a basic colour-based estimate,
    not a medically or scientifically validated
    disease severity measurement.
    """

    hsv = np.array(
        img.convert("HSV"),
        dtype="float32"
    )

    hue = hsv[..., 0] * 360 / 255
    sat = hsv[..., 1] / 255
    val = hsv[..., 2] / 255

    leaf = (
        (sat > 0.20) &
        (val > 0.10)
    )

    green = (
        leaf &
        (hue >= 70) &
        (hue <= 160)
    )

    diseased = leaf & ~green

    total = int(leaf.sum())

    if total < 500:
        return 0.0

    return float(
        min(
            100.0,
            100.0 * diseased.sum() / total
        )
    )


# ==========================================
# CORS
# ==========================================

@app.after_request
def allow_other_origins(resp):

    resp.headers["Access-Control-Allow-Origin"] = "*"

    return resp


# ==========================================
# FRONTEND ROUTES
# ==========================================

@app.route("/")
def home():

    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/<name>")
def page_file(name):

    if name in PUBLIC_FILES:

        return send_from_directory(
            FRONTEND_DIR,
            name
        )

    abort(404)


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/health")
def health():

    return jsonify({

        "status": "ok",

        "model": "MobileNetV2 8-Class",

        "classes": class_names,

        "unsupported_threshold":
            UNSUPPORTED_THRESHOLD,

        "limits": {

            "conf_min": CONF_MIN,

            "margin_min": MARGIN_MIN,

            "blur_min": BLUR_MIN

        }

    })


# ==========================================
# IMAGE PREDICTION API
# ==========================================

@app.route("/predict", methods=["GET", "POST"])
def predict():

    if request.method == "GET":

        return jsonify({

            "message":
            "LeafCare prediction server is running."

        })


    # Check uploaded image
    if "image" not in request.files:

        return jsonify({

            "error": "No image uploaded"

        }), 400


    try:

        img = Image.open(
            request.files["image"].stream
        ).convert("RGB")

    except (
        UnidentifiedImageError,
        Exception
    ):

        return jsonify({

            "error":
            "Could not read that file as an image."

        }), 400


    # ======================================
    # IMAGE PREPROCESSING
    # ======================================

    img = img.resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    )

    arr = np.array(
        img,
        dtype="float32"
    )[None, ...]

    # ======================================
    # MODEL PREDICTION
    # ======================================

    import time

    inference_start = time.time()

    probs = model(
        arr,
        training=False
    ).numpy()[0]

    inference_time = time.time() - inference_start

    print(
        f"[predict] Inference time: {inference_time:.2f} seconds",
        flush=True
    )

    order = np.argsort(probs)[::-1]

    top = int(order[0])
    second = int(order[1])

    conf = float(probs[top])

    second_conf = float(probs[second])

    margin = conf - second_conf

    name = class_names[top]

    sharp = sharpness(img)

    # ======================================
    # UNSUPPORTED IMAGE VALIDATION
    # ======================================

    reason = None

    # 1. Direct Unsupported class prediction
    if name.strip().lower() == OTHER_NAME.lower():

        reason = "not_supported"

    # 2. Low confidence
    elif conf < CONF_MIN:

        reason = "unsure"

    # 3. Low difference between top predictions
    elif margin < MARGIN_MIN:

        reason = "unsure"

    # 4. Blurry image
    elif sharp < BLUR_MIN:

        reason = "blurry"


    # ======================================
    # REJECTION THRESHOLD CHECK
    # ======================================

    # The saved threshold is used to reject
    # uncertain predictions as an additional
    # safeguard, based on the model's probability
    # assigned to the Unsupported class.

    unsupported_index = next(

        (
            i for i, class_name in enumerate(class_names)
            if class_name.strip().lower() == OTHER_NAME.lower()
        ),

        None

    )

    unsupported_probability = (

        float(probs[unsupported_index])

        if unsupported_index is not None

        else 0.0

    )


    if (
        unsupported_index is not None
        and unsupported_probability >= UNSUPPORTED_THRESHOLD
    ):

        reason = "not_supported"


    # ======================================
    # TERMINAL LOGGING
    # ======================================

    print(

        f"[predict] {name} | "
        f"confidence={conf:.3f} | "
        f"margin={margin:.3f} | "
        f"unsupported={unsupported_probability:.3f} | "
        f"sharpness={sharp:.1f} | "
        f"result={reason or 'accepted'}",

        flush=True

    )


    # ======================================
    # RETURN REJECTION RESPONSE
    # ======================================

    if reason:

        return jsonify({

            "rejected": True,

            "reason": reason,

            "confidence": round(conf, 3),

            "margin": round(margin, 3),

            "sharpness": round(sharp, 1),

            "message": (
                "Please upload a clear image of a supported "
                "potato or tomato leaf."
            )

        })


    # ======================================
    # DISEASE INFORMATION
    # ======================================

    crop, condition = describe(name)

    severity = (

        0.0

        if condition == "Healthy"

        else estimate_severity(img)

    )

    # ======================================
    # SUCCESS RESPONSE
    # ======================================
    return jsonify({

        "rejected": False,

        "label": f"{crop} {condition}",

        "crop": crop,

        "condition": condition,

        "confidence": conf,

        "severity": round(severity, 1),

        "margin": round(margin, 3),

        "sharpness": round(sharp, 1),

        "unsupported_probability":
            round(unsupported_probability, 3)

    })

# ==========================================
# APPLICATION ENTRY POINT
# ==========================================
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8000))

    app.run(
        host="0.0.0.0",
        port=port
    )

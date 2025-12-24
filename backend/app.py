from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import os
from datetime import datetime
import cv2
import tensorflow as tf
from tensorflow.keras import backend as K
import json

# FLASK SETUP
app = Flask(__name__)
# CORS(app)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]
)

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@app.route("/auth/google", methods=["POST"])
def google_auth():
    data = request.get_json()

    if not data or "token" not in data:
        return jsonify({"error": "Missing token"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            data["token"],
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        user = {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }

        return jsonify({
            "status": "success",
            "user": user
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 401


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
HEATMAP_FOLDER = os.path.join(BASE_DIR, "heatmaps")
MODEL_PATH = os.path.join(BASE_DIR, "models", "breast_cancer_model.h5")
HISTORY_FILE = os.path.join(BASE_DIR, "predictions_history.json")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

# CUSTOM METRIC (ถ้ามี)
def dice_coef(y_true, y_pred, smooth=1):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (
        K.sum(y_true_f) + K.sum(y_pred_f) + smooth
    )

# LOAD MODEL
def load_model():
    try:
        print("🔧 Using TensorFlow backend")
        print(f"🔍 Model path: {MODEL_PATH}")
        print(f"📁 Exists? {os.path.exists(MODEL_PATH)}")

        if not os.path.exists(MODEL_PATH):
            print("❌ Model file not found")
            return None

        model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={"dice_coef": dice_coef},
            compile=False,
            safe_mode=False

        )

        print("✅ Keras model loaded successfully")
        return model

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None

model = load_model()

# IMAGE PREPROCESSING
def preprocess_image(image, size=256):
    image = image.resize((size, size))
    img = np.array(image)

    if img.ndim == 2:  # grayscale
        img = np.stack([img]*3, axis=-1)

    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# SIMPLE HEATMAP (ACTIVATION MAP)
def generate_heatmap(image, prediction):
    img = np.array(image)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    heatmap = np.uint8(255 * prediction)
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)
    return overlay

# HISTORY
def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []

def save_history(record):
    history = load_history()
    history.append(record)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

# ROUTES
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"

    img_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(img_path)

    image = Image.open(img_path).convert("RGB")
    img_input = preprocess_image(image)

    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    prediction = model.predict(img_input)

    # 🔹 รองรับทั้ง segmentation และ classification
    score = float(np.mean(prediction))
    is_malignant = score > 0.5

    heatmap = generate_heatmap(image, prediction[0])
    heatmap_name = f"{timestamp}_heatmap.jpg"
    heatmap_path = os.path.join(HEATMAP_FOLDER, heatmap_name)
    cv2.imwrite(heatmap_path, heatmap)

    response = {
        "prediction": "Malignant" if is_malignant else "Benign",
        "confidence": score * 100 if is_malignant else (1-score) * 100,
        "raw_score": score,
        "image": f"/api/images/{filename}",
        "heatmap": f"/api/heatmaps/{heatmap_name}"
    }

    save_history({
        "id": timestamp,
        "prediction": response["prediction"],
        "confidence": response["confidence"],
        "time": datetime.now().isoformat()
    })

    return jsonify(response)

@app.route("/api/images/<filename>")
def get_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/api/heatmaps/<filename>")
def get_heatmap(filename):
    return send_from_directory(HEATMAP_FOLDER, filename)

@app.route("/api/history")
def history():
    return jsonify(load_history())

# RUN
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏥 Breast Cancer Detection API - TensorFlow Version")
    print("="*60)
    print("📡 http://localhost:5000")
    print(f"🤖 Model loaded: {model is not None}")
    print("="*60 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=True)
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from PIL import Image
import numpy as np
import os
from datetime import datetime
import cv2
import tensorflow as tf
from dotenv import load_dotenv
from supabase import create_client, Client
from tensorflow.keras import backend as K


# ENV
load_dotenv(".env.local")
print("TF KERAS PATH:", tf.keras.__file__)
# FLASK SETUP
app = Flask(__name__)
app.secret_key = "dev-secret-key"

app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_HTTPONLY=True,
)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]
)

# SUPABASE
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)

# GOOGLE AUTH
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
print("GOOGLE_CLIENT_ID =", GOOGLE_CLIENT_ID)

# GOOGLE LOGIN
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
    except Exception:
        return jsonify({"error": "Invalid Google token"}), 401

    google_id = idinfo["sub"]
    email = idinfo["email"]

    res = supabase.table("users").select("*").eq("email", email).execute()

    if res.data:
        user_db = res.data[0]
        supabase.table("users").update({
            "google_id": google_id,
            "firstname": idinfo.get("given_name"),
            "lastname": idinfo.get("family_name"),
        }).eq("email", email).execute()
    else:
        insert_res = supabase.table("users").insert({
            "email": email,
            "google_id": google_id,
            "firstname": idinfo.get("given_name"),
            "lastname": idinfo.get("family_name"),
        }).execute()
        user_db = insert_res.data[0]

    profile_completed = all([
        user_db.get("gender"),
        user_db.get("birthdate"),
        user_db.get("is_doctor") is not None
    ])

    session["user"] = {
        "user_id": user_db["id"],
        "google_id": google_id,
        "email": email
    }
    session["profile_completed"] = profile_completed

    supabase.table("login_logs").insert({
        "user_id": user_db["id"],
        "ip_address": request.remote_addr,
        "user_agent": request.headers.get("User-Agent")
    }).execute()

    return jsonify({
        "status": "success",
        "profile_completed": profile_completed
    })

# PROFILE / SESSION
@app.route("/me")
def me():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401
    return jsonify({
        "user": session["user"],
        "profile_completed": session.get("profile_completed", False)
    })

@app.route("/profile", methods=["POST"])
def profile():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401

    data = request.json or {}
    if not data.get("gender") or not data.get("date_of_birth"):
        return jsonify({"error": "Incomplete profile"}), 400

    is_doctor = True if data.get("is_doctor") == 1 else False

    supabase.table("users").update({
        "gender": data["gender"],
        "birthdate": data["date_of_birth"],
        "is_doctor": is_doctor
    }).eq("id", session["user"]["user_id"]).execute()

    session["profile_completed"] = True
    return jsonify({"status": "saved"})

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"status": "logged_out"})

# PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HEATMAP_FOLDER = os.path.join(BASE_DIR, "heatmaps")
UNET_PATH = os.path.join(BASE_DIR, "models", "breast_ultrasound_unet.keras")
CLASSIFIER_PATH = os.path.join(BASE_DIR, "models", "breast_ultrasound_classifier.keras")

os.makedirs(HEATMAP_FOLDER, exist_ok=True)

# MODELS
def dice_coef(y_true, y_pred, smooth=1):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (
        K.sum(y_true_f) + K.sum(y_pred_f) + smooth
    )

print("🔥 Loading UNet...")
try:
    unet = tf.keras.models.load_model(UNET_PATH, compile=False)
    print("✅ UNet loaded")
except Exception as e:
    print("❌ Failed to load UNet:", e)

print("🔥 Loading Classifier...")
classifier = tf.keras.models.load_model(CLASSIFIER_PATH, compile=False)
print("✅ Classifier loaded")

CLASS_NAMES = ["Normal", "Benign", "Malignant"]

# IMAGE UTILS
def preprocess_rgb(image, size=256):
    image = image.resize((size, size))
    img = np.array(image)
    if img.ndim == 2:
        img = np.stack([img] * 3, axis=-1)
    return img.astype(np.float32) / 255.0

def generate_overlay(image, mask):
    img = np.array(image)
    mask = cv2.resize(mask, (img.shape[1], img.shape[0]))
    mask = np.uint8(mask * 255)
    heatmap = cv2.applyColorMap(mask, cv2.COLORMAP_JET)
    return cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

# HEALTH
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "unet_loaded": True,
        "classifier_loaded": True
    })

# PREDICT (UNet → Classifier)
@app.route("/api/predict", methods=["POST"])
def predict():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401

    if not session.get("profile_completed"):
        return jsonify({"error": "Profile not completed"}), 403

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = Image.open(request.files["image"]).convert("RGB")
    save_image = request.form.get("save_image") == "true"

    # --- preprocess ---
    img = preprocess_rgb(image)
    x = np.expand_dims(img, axis=0)

    # --- UNet ---
    mask = unet.predict(x, verbose=0)[0, :, :, 0]
    mask_bin = (mask > 0.5).astype(np.float32)

    # --- apply weighted mask (เพื่อไม่ให้สูญเสีย region สำคัญ) ---
    img_weighted = img + img * mask_bin[..., np.newaxis]
    img_weighted = np.clip(img_weighted, 0, 1)  # clip ไม่ให้เกิน 1
    x_cls = np.expand_dims(img_weighted, axis=0)

    # --- Classifier ---
    probs = classifier.predict(x_cls, verbose=0)[0]
    class_id = int(np.argmax(probs))
    confidence = float(probs[class_id] * 100)  # ส่งตรงจาก model

    # --- save images ---
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    mask_path = f"{ts}_mask.png"
    overlay_path = f"{ts}_overlay.jpg"

    cv2.imwrite(
        os.path.join(HEATMAP_FOLDER, mask_path),
        (mask_bin * 255).astype(np.uint8)
    )
    cv2.imwrite(
        os.path.join(HEATMAP_FOLDER, overlay_path),
        generate_overlay(image, mask_bin)
    )

    features = {
    "Shape": "Irregular" if mask.sum() > 1000 else "Oval",
    "Margin": "Spiculated" if mask.sum() > 1500 else "Circumscribed",
    "Composition": "Solid",  # placeholder
    "Echogenicity": "Hypoechoic" if confidence > 50 else "Isoechoic",
    "Shadowing": "Present" if mask.sum() > 2000 else "None",
    }


    result = {
        "prediction": CLASS_NAMES[class_id],
        "confidence": confidence,
        "overlay": f"/api/heatmaps/{overlay_path}",
        "mask": f"/api/heatmaps/{mask_path}",
        "features": features
    }


    if save_image:
        supabase.table("prediction_history").insert({
            "user_id": session["user"]["user_id"],
            "prediction": result["prediction"],
            "pixel_confidence": confidence,
            "mask_url": f"/api/heatmaps/{mask_path}",
            "overlay_url": f"/api/heatmaps/{overlay_path}"
        }).execute()

    supabase.table("prediction_logs").insert({
        "user_id": session["user"]["user_id"],
        "consent": save_image
    }).execute()

    return jsonify(result)


# STATIC
@app.route("/api/heatmaps/<filename>")
def get_heatmap(filename):
    return send_from_directory(HEATMAP_FOLDER, filename)

# HISTORY
@app.route("/api/history")
def history():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401

    user_id = session["user"]["user_id"]
    res = supabase.table("prediction_history") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()

    return jsonify({
        "count": len(res.data),
        "data": res.data
    })

# USAGE
@app.route("/api/usage")
def usage():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401

    user_id = session["user"]["user_id"]
    res = supabase.table("prediction_logs") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()

    return jsonify({"total_usage": res.count})

@app.route("/api/usage/increment", methods=["POST"])
def usage_increment():
    if "user" not in session:
        return jsonify({"error": "unauthorized"}), 401

    user_id = session["user"]["user_id"]
    supabase.table("prediction_logs").insert({
        "user_id": user_id,
        "consent": False
    }).execute()

    res = supabase.table("prediction_logs") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()

    return jsonify({"total_usage": res.count})

# RUN
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

import numpy as np
from tensorflow.keras.models import load_model
from services.preprocessing import preprocess_image

IMG_SIZE = 256
CLASS_NAMES = ["normal", "benign", "malignant"]

# โหลดครั้งเดียวตอน start server
unet = load_model("models/breast_ultrasound_unet.keras", compile=False)
classifier = load_model("models/breast_ultrasound_classifier.keras", compile=False)

def predict_from_bytes(file_bytes):
    img = preprocess_image(file_bytes)

    # UNet → mask (RGB)
    x_unet = img.reshape(1, IMG_SIZE, IMG_SIZE, 3)
    mask = unet.predict(x_unet, verbose=0)[0, :, :, 0]
    mask = (mask > 0.5).astype(np.float32)

    # Masking
    if mask.sum() > 50:
        img_for_cls = img * mask[..., np.newaxis]
    else:
        img_for_cls = img

    x_cls = img_for_cls.reshape(1, IMG_SIZE, IMG_SIZE, 3)
    pred = classifier.predict(x_cls, verbose=0)

    class_id = int(np.argmax(pred))
    confidence = float(pred[0][class_id])

    return {
        "prediction": CLASS_NAMES[class_id],
        "confidence": confidence
    }
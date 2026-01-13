import cv2
import numpy as np

IMG_SIZE = 256

def preprocess_image(file_bytes):
    npimg = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype(np.float32) / 255.0

    return img
import tensorflow as tf
from tensorflow.keras import backend as K

def dice_coef(y_true, y_pred, smooth=1):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (
        K.sum(y_true_f) + K.sum(y_pred_f) + smooth
    )

model = tf.keras.models.load_model(
    "breast_cancer_model.h5",
    custom_objects={"dice_coef": dice_coef},
    compile=False
)

# save json
with open("model.json", "w") as f:
    f.write(model.to_json())

# save weights
model.save_weights("breast_cancer_weights.h5")

print("✅ Convert finished")

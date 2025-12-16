from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import os
from datetime import datetime
import cv2
import torch
import torch.nn as nn
import torchvision.transforms as transforms

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# CONFIGURATION
UPLOAD_FOLDER = 'uploads'
HEATMAP_FOLDER = 'heatmaps'
HISTORY_FILE = 'predictions_history.json'

# MODEL_PATH = 'models/breast_cancer_model.pth'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "breast_cancer_model.pth")


# Create folders
for folder in [UPLOAD_FOLDER, HEATMAP_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# DEFINE YOUR CNN MODEL ARCHITECTURE
# TODO: Replace this with YOUR EXACT model architecture from Jupyter

class BreastCancerCNN(nn.Module):
    """
    Example CNN Architecture
    IMPORTANT: This must match EXACTLY with your Jupyter notebook model!
    """
    def __init__(self):
        super(BreastCancerCNN, self).__init__()
        
        # Example architecture - REPLACE WITH YOUR MODEL
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.5)
        
        # Adjust this based on your input size
        # For 224x224 input: 224 -> 112 -> 56 -> 28 = 28x28x128
        self.fc1 = nn.Linear(128 * 28 * 28, 512)
        self.fc2 = nn.Linear(512, 128)
        self.fc3 = nn.Linear(128, 1)  # Binary classification
        
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        # Convolutional layers
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = self.pool(self.relu(self.conv3(x)))
        
        # Flatten
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.sigmoid(self.fc3(x))
        
        return x

# LOAD PYTORCH MODEL

# def load_model():
    # """Load PyTorch model from .pth file"""
    # try:
    #     # Set device
    #     device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    #     print(f"🔧 Using device: {device}")
        
    #     # Initialize model
    #     model = BreastCancerCNN()
        
    #     # Load weights
    #     if os.path.exists(MODEL_PATH):
    #         # Option 1: If you saved just the state_dict
    #         model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            
    #         # Option 2: If you saved the entire model, use this instead:
    #         # model = torch.load(MODEL_PATH, map_location=device)
            
    #         model.to(device)
    #         model.eval()  # Set to evaluation mode
    #         print(f"✅ Model loaded successfully from {MODEL_PATH}")
    #         return model, device
    #     else:
    #         print(f"❌ Model file not found: {MODEL_PATH}")
    #         print("⚠️  Using mock predictions. Please add your .pth file!")
    #         return None, device
            
    # except Exception as e:
    #     print(f"❌ Error loading model: {e}")
    #     print("⚠️  Using mock predictions.")
    #     return None, torch.device('cpu')
def load_model():
    """Load PyTorch model from .pth file"""
    try:
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"🔧 Using device: {device}")
        print(f"🔍 Looking for model at: {MODEL_PATH}")
        print(f"📁 Exists? {os.path.exists(MODEL_PATH)}")
        
        model = BreastCancerCNN()
        
        if os.path.exists(MODEL_PATH):
            state_dict = torch.load(MODEL_PATH, map_location=device)
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()
            print(f"✅ Model loaded successfully from {MODEL_PATH}")
            return model, device
        else:
            print(f"❌ Model file not found: {MODEL_PATH}")
            print("⚠️  Using mock predictions. Please add your .pth file!")
            return None, device
            
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("⚠️  Using mock predictions.")
        return None, torch.device('cpu')

# Load model on startup
model, device = load_model()

# IMAGE PREPROCESSING

def get_transforms(image_size=224):
    """
    Define image preprocessing transforms
    IMPORTANT: These should match your training preprocessing!
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],  # ImageNet means
            std=[0.229, 0.224, 0.225]     # ImageNet stds
        )
    ])

def preprocess_image(image, image_size=224):
    """
    Preprocess PIL image for PyTorch model
    Adjust this to match your training preprocessing!
    """
    # Convert to RGB if grayscale
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Apply transforms
    transform = get_transforms(image_size)
    img_tensor = transform(image)
    
    # Add batch dimension
    img_tensor = img_tensor.unsqueeze(0)
    
    return img_tensor

# PREDICTION FUNCTION

def predict_with_cnn(image):
    """
    Make prediction using PyTorch CNN model
    """
    global model, device
    
    if model is None:
        # Mock prediction if model not loaded
        print("⚠️  Using mock prediction (model not loaded)")
        prediction_score = np.random.random()
        is_malignant = prediction_score > 0.5
        
        details = {
            'Mass Detected': np.random.random() > 0.4,
            'Calcification': np.random.random() > 0.5,
            'Asymmetry': np.random.random() > 0.6,
            'Architectural Distortion': np.random.random() > 0.7
        }
        
        result = {
            'prediction': 'Malignant' if is_malignant else 'Benign',
            'confidence': float(prediction_score * 100 if is_malignant else (1-prediction_score) * 100),
            'details': details,
            'raw_score': float(prediction_score)
        }
        return result
    
    try:
        # Preprocess image
        img_tensor = preprocess_image(image).to(device)
        
        # Make prediction
        with torch.no_grad():
            output = model(img_tensor)
            prediction_score = output.item()  # Get scalar value
        
        # Determine result
        is_malignant = prediction_score > 0.5
        
        # You can adjust these thresholds based on your model
        details = {
            'Mass Detected': prediction_score > 0.4,
            'Calcification': prediction_score > 0.5,
            'Asymmetry': prediction_score > 0.6,
            'Architectural Distortion': prediction_score > 0.7
        }
        
        result = {
            'prediction': 'Malignant' if is_malignant else 'Benign',
            'confidence': float(prediction_score * 100 if is_malignant else (1-prediction_score) * 100),
            'details': details,
            'raw_score': float(prediction_score)
        }
        
        return result
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise e

# GRAD-CAM FOR PYTORCH

def generate_gradcam_heatmap(image, model, device):
    """
    Generate Grad-CAM heatmap for PyTorch model
    """
    if model is None:
        # Generate mock heatmap
        img_array = np.array(image)
        heatmap = np.random.rand(img_array.shape[0], img_array.shape[1])
        heatmap = (heatmap * 255).astype(np.uint8)
        heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
        
        overlay = cv2.addWeighted(img_array, 0.6, heatmap_colored, 0.4, 0)
        return overlay
    
    try:
        # Preprocess image
        img_tensor = preprocess_image(image).to(device)
        img_tensor.requires_grad = True
        
        # Forward pass
        output = model(img_tensor)
        
        # Backward pass
        model.zero_grad()
        output.backward()
        
        # Get gradients
        gradients = img_tensor.grad.data
        
        # Generate heatmap from gradients
        heatmap = torch.mean(gradients, dim=1).squeeze().cpu().numpy()
        heatmap = np.maximum(heatmap, 0)
        heatmap = heatmap / (heatmap.max() + 1e-8)
        
        # Resize to original image size
        heatmap = cv2.resize(heatmap, (image.width, image.height))
        heatmap = np.uint8(255 * heatmap)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Overlay on original image
        img_array = np.array(image)
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
        
        overlay = cv2.addWeighted(img_array, 0.6, heatmap, 0.4, 0)
        
        return overlay
        
    except Exception as e:
        print(f"⚠️  Grad-CAM error: {e}, using simple heatmap")
        # Fallback to simple heatmap
        img_array = np.array(image)
        heatmap = np.random.rand(img_array.shape[0], img_array.shape[1])
        heatmap = (heatmap * 255).astype(np.uint8)
        heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        if len(img_array.shape) == 2:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
        
        overlay = cv2.addWeighted(img_array, 0.6, heatmap_colored, 0.4, 0)
        return overlay

# HELPER FUNCTIONS

def load_history():
    """Load prediction history from JSON"""
    import json
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_to_history(record):
    """Save prediction to history"""
    import json
    history = load_history()
    history.append(record)
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

# API ROUTES

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = 'loaded' if model is not None else 'not loaded'
    return jsonify({
        'status': 'healthy',
        'message': 'Flask API is running',
        'model': model_status,
        'device': str(device)
    })

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    """Main prediction endpoint"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Check if image was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = f"{timestamp}_{file.filename}"
        
        # Save original image
        original_path = os.path.join(UPLOAD_FOLDER, original_filename)
        file.save(original_path)
        
        # Open image
        image = Image.open(original_path)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Make prediction
        print(f"🔬 Analyzing image: {original_filename}")
        prediction_result = predict_with_cnn(image)
        
        # Generate heatmap
        heatmap_array = generate_gradcam_heatmap(image, model, device)
        heatmap_filename = f"{timestamp}_heatmap.jpg"
        heatmap_path = os.path.join(HEATMAP_FOLDER, heatmap_filename)
        cv2.imwrite(heatmap_path, heatmap_array)
        
        # Prepare response
        response_data = {
            'success': True,
            'id': timestamp,
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'details': prediction_result['details'],
            'original_image': f'/api/images/{original_filename}',
            'heatmap_image': f'/api/heatmaps/{heatmap_filename}'
        }
        
        # Save to history
        history_record = {
            'id': timestamp,
            'timestamp': datetime.now().isoformat(),
            'filename': original_filename,
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'details': prediction_result['details']
        }
        save_to_history(history_record)
        
        print(f"✅ Prediction complete: {prediction_result['prediction']} ({prediction_result['confidence']:.2f}%)")
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get all prediction history"""
    try:
        history = load_history()
        return jsonify({
            'success': True,
            'history': history,
            'total': len(history)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/images/<filename>', methods=['GET'])
def get_image(filename):
    """Serve uploaded images"""
    try:
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': 'Image not found'}), 404

@app.route('/api/heatmaps/<filename>', methods=['GET'])
def get_heatmap(filename):
    """Serve heatmap images"""
    try:
        return send_from_directory(HEATMAP_FOLDER, filename)
    except Exception as e:
        return jsonify({'error': 'Heatmap not found'}), 404

# RUN SERVER
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 Breast Cancer Detection API - PyTorch Version")
    print("="*60)
    print(f"📡 Server: http://localhost:5000")
    print(f"📁 Uploads: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"🔥 Heatmaps: {os.path.abspath(HEATMAP_FOLDER)}")
    print(f"🤖 Model: {MODEL_PATH}")
    print(f"💻 Device: {device}")
    if model is not None:
        print(f"✅ Model Status: LOADED")
    else:
        print(f"⚠️  Model Status: NOT LOADED (using mock predictions)")
        print(f"   Please add your .pth file to: {MODEL_PATH}")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
# # Load model
# import tensorflow as tf
# model = tf.keras.models.load_model('model/model.h5')

# # In predict() function:
# image_resized = image.resize((224, 224))  # Your size
# image_array = np.array(image_resized)
# image_array = image_array / 255.0  # Your normalization

# prediction = model.predict(image_array)
# confidence = float(prediction[0][0]) * 100
# result = 'Malignant' if confidence > 50 else 'Benign'

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import base64
import io
from PIL import Image
import numpy as np
from datetime import datetime

# Uncomment when integrating your model
# import tensorflow as tf
# import cv2

app = Flask(__name__)
CORS(app)

DATABASE = 'breast_cancer_app.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL NOT NULL,
            analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    try:
        password_hash = hash_password('demo123')
        cursor.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            ('demo', 'demo@example.com', password_hash)
        )
        conn.commit()
        print("✓ Demo user created!")
    except sqlite3.IntegrityError:
        print("✓ Demo user already exists")
    
    conn.close()
    print("✓ Database initialized!")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

init_db()

# Load your model here (uncomment when ready)
# model = tf.keras.models.load_model('model/model.h5')

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        password_hash = hash_password(password)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                (username, email, password_hash)
            )
            conn.commit()
            
            return jsonify({
                'message': 'User created successfully',
                'username': username
            }), 201
            
        except sqlite3.IntegrityError as e:
            if 'username' in str(e):
                return jsonify({'error': 'Username already exists'}), 400
            elif 'email' in str(e):
                return jsonify({'error': 'Email already registered'}), 400
            else:
                return jsonify({'error': 'Registration failed'}), 400
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        password_hash = hash_password(password)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?',
            (username, password_hash)
        )
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'message': 'Login successful',
                'username': user['username'],
                'email': user['email']
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # ==========================================
        # INTEGRATE YOUR MODEL HERE
        # ==========================================
        
        # Example:
        # image_resized = image.resize((224, 224))
        # image_array = np.array(image_resized)
        # image_array = image_array / 255.0
        # image_array = np.expand_dims(image_array, axis=0)
        # 
        # prediction = model.predict(image_array)
        # confidence = float(prediction[0][0]) * 100
        # result = 'Malignant' if confidence > 50 else 'Benign'
        
        # TEMPORARY: Mock prediction (REMOVE WHEN YOU ADD YOUR MODEL)
        import random
        confidence = random.uniform(70, 95)
        result = 'Malignant' if random.random() > 0.5 else 'Benign'
        
        return jsonify({
            'prediction': result,
            'confidence': round(confidence, 2),
            'details': {
                'Mass Detected': bool(confidence > 30),
                'Calcification': bool(confidence > 60),
                'Asymmetry': bool(confidence > 50)
            }
        }), 200
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'Prediction failed: ' + str(e)}), 500

@app.route('/history/<username>', methods=['GET'])
def get_history(username):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        cursor.execute('''
            SELECT prediction, confidence, analyzed_at 
            FROM analysis_history 
            WHERE user_id = ? 
            ORDER BY analyzed_at DESC 
            LIMIT 10
        ''', (user['id'],))
        
        history = cursor.fetchall()
        conn.close()
        
        history_list = [dict(row) for row in history]
        
        return jsonify({'history': history_list}), 200
        
    except Exception as e:
        print(f"History error: {e}")
        return jsonify({'error': 'Failed to fetch history'}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, username, email, created_at FROM users')
        users = cursor.fetchall()
        conn.close()
        
        users_list = [dict(row) for row in users]
        return jsonify({'users': users_list}), 200
        
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({'error': 'Failed to fetch users'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Breast Cancer Detection API is running'
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("🏥 Breast Cancer Detection API")
    print("=" * 50)
    print("✓ API running on: http://localhost:5000")
    print("✓ Database: SQLite (breast_cancer_app.db)")
    print("=" * 50)
    print("\n📡 Available endpoints:")
    print("  POST /signup       - Register new user")
    print("  POST /login        - User login")
    print("  POST /predict      - Analyze image")
    print("  GET  /history/<username> - Get analysis history")
    print("  GET  /users        - List all users")
    print("  GET  /health       - Health check")
    print("=" * 50)
    print("\n🚀 Ready to accept requests!")
    print("=" * 50)
    
    app.run(debug=True, port=5000, host='0.0.0.0')
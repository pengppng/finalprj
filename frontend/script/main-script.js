// API Configuration
const API_URL = 'http://localhost:5000';

let currentUser = null;
let uploadedImageData = null;

document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    const loginTime = localStorage.getItem('loginTime');

    const LOGIN_EXPIRE_DAYS = 7;  
    const MAX_AGE = LOGIN_EXPIRE_DAYS * 24 * 60 * 60 * 1000;

    if (!savedUser || !loginTime) {
        window.location.href = 'login.html';
        return;
    }

    // Check expiration
    const now = Date.now();
    const elapsed = now - Number(loginTime);

    if (elapsed > MAX_AGE) {
        // Login expired
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        window.location.href = 'login.html';
        return;
    }

    // Refresh username
    currentUser = JSON.parse(savedUser);
    document.getElementById('username-display').textContent = currentUser.username;

    // Tutorial popup (same)
    const hasSeenTutorial = sessionStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
        setTimeout(() => {
            showTutorial();
            sessionStorage.setItem('hasSeenTutorial', 'true');
        }, 500);
    }
});


function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        sessionStorage.removeItem('hasSeenTutorial');
        window.location.href = 'login.html';
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPEG, PNG)');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        
        document.getElementById('upload-placeholder').style.display = 'none';
        document.getElementById('image-preview').style.display = 'block';
        document.getElementById('preview-img').src = uploadedImageData;
        document.getElementById('analyze-btn').disabled = false;
        document.getElementById('results-display').style.display = 'none';
        document.getElementById('results-placeholder').style.display = 'block';
        document.getElementById('loading-state').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function analyzeImage() {
    if (!uploadedImageData) {
        alert('Please upload an image first');
        return;
    }
    
    document.getElementById('results-placeholder').style.display = 'none';
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('results-display').style.display = 'none';
    
    const analyzeBtn = document.getElementById('analyze-btn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    try {
        const base64Image = uploadedImageData.split(',')[1];
        
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                image: base64Image,
                user_id: currentUser.username
            })
        });
        
        if (!response.ok) {
            throw new Error('Prediction request failed');
        }
        
        const results = await response.json();
        displayResults(results);
        
    } catch (error) {
        console.error('Analysis error:', error);
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('results-placeholder').style.display = 'block';
        alert('Failed to analyze image. Please make sure the Flask API is running on ' + API_URL);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Image';
    }
}

function displayResults(results) {
    document.getElementById('loading-state').style.display = 'none';
    
    const resultsDisplay = document.getElementById('results-display');
    resultsDisplay.style.display = 'block';
    
    const predictionCard = document.getElementById('prediction-card');
    const predictionText = document.getElementById('prediction-text');
    const confidenceText = document.getElementById('confidence-text');
    
    predictionText.textContent = results.prediction;
    confidenceText.textContent = results.confidence + '%';
    
    predictionCard.className = 'prediction-card';
    if (results.prediction.toLowerCase().includes('malignant')) {
        predictionCard.classList.add('malignant');
    } else {
        predictionCard.classList.add('benign');
    }
    
    const heatmapImg = document.getElementById('heatmap-img');
    heatmapImg.src = results.heatmap || uploadedImageData;
    
    const detailsList = document.getElementById('details-list');
    detailsList.innerHTML = '';
    
    if (results.details) {
        Object.entries(results.details).forEach(([key, value]) => {
            const detailItem = document.createElement('div');
            detailItem.className = 'detail-item';
            
            const label = document.createElement('span');
            label.className = 'detail-label';
            label.textContent = key;
            
            const valueSpan = document.createElement('span');
            valueSpan.className = value ? 'detail-value detected' : 'detail-value not-detected';
            valueSpan.textContent = value ? 'Detected' : 'Not Detected';
            
            detailItem.appendChild(label);
            detailItem.appendChild(valueSpan);
            detailsList.appendChild(detailItem);
        });
    }
    
    resultsDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showTutorial() {
    const modal = document.getElementById('tutorial-modal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTutorial() {
    const modal = document.getElementById('tutorial-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTutorial();
    }
});

const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '#4f46e5';
            uploadArea.style.backgroundColor = '#f5f3ff';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.style.borderColor = '#d1d5db';
            uploadArea.style.backgroundColor = '#fafafa';
        }, false);
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageUpload({ target: { files: [files[0]] } });
        }
    }, false);
}
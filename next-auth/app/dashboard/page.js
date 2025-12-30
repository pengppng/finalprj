"use client";
import React, { useState, useEffect } from 'react';
import { Upload, Info, FileImage, History, Loader, AlertCircle, X } from 'lucide-react';
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";



const BreastCancerApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    fetch(`${API_BASE}/me`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data && !data.profile_completed) {
          router.replace("/create-profile");
        }
      });
  }, []);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
      setError('');
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    setError('');

    try {
      // Simulating AI analysis - Replace with your actual model integration
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockResults = {
        prediction: Math.random() > 0.5 ? 'Malignant' : 'Benign',
        confidence: parseFloat((Math.random() * 30 + 70).toFixed(2)),
        heatmap: preview,
        details: {
          'Mass Detected': Math.random() > 0.3,
          'Calcification': Math.random() > 0.6,
          'Asymmetry': Math.random() > 0.5,
          'Architectural Distortion': Math.random() > 0.7
        }
      };
      
      setResults(mockResults);

      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        prediction: mockResults.prediction,
        confidence: mockResults.confidence,
        image: preview,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome! Here's How to Use the App</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Upload Medical Image</h3>
                  <p className="text-gray-600">Click the upload area and select a breast ultrasound imaging file in JPEG or PNG format.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Analyze with AI</h3>
                  <p className="text-gray-600">Click the "Analyze Image" button to process the image using our AI model. This will take a few seconds.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Review Results</h3>
                  <p className="text-gray-600">View the prediction (Malignant/Benign), confidence level, detailed analysis, and heatmap showing areas of interest.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Check History</h3>
                  <p className="text-gray-600">All your analyses are saved in the History section below for future reference.</p>
                </div>
              </div>

              <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-yellow-900 mb-1">⚠️ Medical Disclaimer</p>
                    <p className="text-sm text-yellow-800">
                      This tool is for educational and demonstration purposes only. It should NOT be used for actual medical diagnosis. Always consult qualified healthcare professionals for medical advice and diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Got it! Let's Start
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI Breast Cancer Detection</h1>
            <p className="text-sm text-gray-600">Medical Imaging Analysis System</p>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
          >
            <Info className="w-5 h-5" />
            <span className="hidden sm:inline">Help</span>
          </button>

          <button
          onClick={async () => {
            await fetch(`${API_BASE}/logout`, {
              method: "POST",
              credentials: "include",
            });

            window.location.href =
              process.env.NEXT_PUBLIC_LOGIN_URL || "/login";
          }}
        >
          Logout
        </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Upload size={24} className="text-indigo-600" />
              </div>
              Upload Image
            </h2>

            <label className="flex col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group">
              {preview ? (
                <div className="w-full h-full p-4 flex col items-center justify-center">
                  <img src={preview} alt="Preview" className="max-h-full object-contain rounded-lg" />
                  <p className="text-sm text-gray-500 mt-3">Click to change image</p>
                </div>
              ) : (
                <div className="flex col items-center">
                  <div className="p-4 bg-indigo-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <FileImage size={48} className="text-indigo-600" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">Click to upload image</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!uploadedImage || isAnalyzing}
              className="w-full mt-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >gradient
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="animate-spin" size={20} />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔬</span>
                  Analyze Image
                </span>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis Results</h2>
            
            {results ? (
              <div className="space-y-5">
                <div className={`p-6 rounded-xl border-2 ${
                  results.prediction === 'Malignant' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className="text-sm font-medium text-gray-600 mb-2">Prediction:</p>
                  <p className={`text-3xl font-bold ${
                    results.prediction === 'Malignant' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {results.prediction}
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Confidence:</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {results.confidence.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Detailed Analysis
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(results.details).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-medium">{key}</span>
                        <span className={`px-4 py-1.5 rounded-lg font-semibold text-sm ${
                          value 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {value ? '✓ Detected' : '✗ Not Detected'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {results.heatmap && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span>🔥</span>
                      Detection Heatmap
                    </h3>
                    <img
                      src={results.heatmap}
                      alt="Heatmap"
                      className="w-full rounded-xl border-2 border-gray-200 shadow-md"
                    />
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Highlighted areas show regions analyzed by the AI model
                    </p>
                  </div>
                )}

                <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-900">
                      <strong className="font-bold">⚠️ Important:</strong> This is for educational purposes only. Always consult qualified medical professionals for diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <FileImage size={48} className="opacity-50" />
                </div>
                <p className="text-lg font-medium text-gray-500">No results yet</p>
                <p className="text-sm mt-2">Upload and analyze an image to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History size={24} className="text-purple-600" />
              </div>
              Analysis History
            </h2>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-md hover:shadow-lg"
            >
              {showHistory ? 'Hide' : 'Show'} ({history.length})
            </button>
          </div>

          {showHistory && history.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:border-indigo-300 bg-linear-to-br from-white to-gray-50">
                  <img
                    src={item.image}
                    alt="History"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-lg ${
                        item.prediction === 'Malignant' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.prediction}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {item.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showHistory && history.length === 0 && (
            <div className="text-center py-12">
              <History size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No analysis history yet</p>
              <p className="text-sm text-gray-400 mt-1">Your analyzed images will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BreastCancerApp;
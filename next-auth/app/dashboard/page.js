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
  const [saveImage, setSaveImage] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const router = useRouter();
  const [exampleData, setExampleData] = useState(null);
  
  useEffect(() => {
    // ตรวจสอบ user
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
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });

    // ดึง usage
    fetch(`${API_BASE}/api/usage`, { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      console.log("Usage data:", data); // ดูว่าได้อะไร
      if (data && typeof data.total_usage !== "undefined") {
        setUsageCount(data.total_usage);
      }
    })
    .catch((err) => {
      console.error("Error fetching usage:", err);
    });
  }, []);
  
  useEffect(() => {
  if (!showHistory) return;

  fetch(`${API_BASE}/api/history`, {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => {
      setHistory(data.data || []);
    })
    .catch(err => {
      console.error("Error loading history:", err);
    });
  }, [showHistory]);


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
  setError("");

  try {
    const formData = new FormData();
    formData.append("image", uploadedImage);
    formData.append("save_image", saveImage ? "true" : "false"); // ✅ สำคัญ

    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) throw new Error("Prediction failed");

    const data = await res.json();
    setResults({
      prediction: data.prediction,
      confidence: data.confidence,
      heatmap: `${API_BASE}${data.overlay}`,
      details: {
        Asymmetry: data.confidence > 50,
        Border: data.confidence > 60,
        Color: data.confidence > 55,
        Diameter: data.confidence > 65,
        Evolution: data.confidence > 70,
      },
    });

    // update usage
    const usageData = await fetch(`${API_BASE}/api/usage`, {
      credentials: "include",
    }).then(r => r.json());

    setUsageCount(usageData.total_usage);

  } catch (err) {
    console.error(err);
    setError("Failed to analyze image");
  } finally {
    setIsAnalyzing(false);
  }
  };
  const detailDescriptions = {
    Asymmetry: "รอยโรคสองด้านมีรูปร่างไม่เท่ากัน",
    Border: "ขอบรอยโรคไม่เรียบหรือหยัก",
    Color: "สีของรอยโรคไม่สม่ำเสมอ",
    Diameter: "รอยโรคมีขนาดค่อนข้างใหญ่",
    Evolution: "รอยโรคมีการเปลี่ยนแปลงตามเวลา",
  };
  const abcdeExamples = {
    Asymmetry: {
      title: "Asymmetry (ความไม่สมมาตร)",
      image: "data:image/jpeg;base64,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",
      // // image: "/abcde/asymmetry.png",
      // image: "https://placehold.co/400x300?text=Asymmetry",
      description: "รอยโรคมีรูปร่างสองด้านไม่เท่ากัน เมื่อแบ่งครึ่งแล้วไม่สมมาตร"
    },
    Border: {
      title: "Border (ขอบไม่เรียบ)",
      image: "/abcde/border.png",
      description: "ขอบของรอยโรคมีลักษณะหยัก ไม่เรียบ อาจบ่งชี้ความผิดปกติ"
    },
    Color: {
      title: "Color (หลายสี)",
      image: "/abcde/color.png",
      description: "รอยโรคมีหลายเฉดสีในบริเวณเดียวกัน"
    },
    Diameter: {
      title: "Diameter (ขนาด)",
      image: "/abcde/diameter.png",
      description: "รอยโรคมีขนาดค่อนข้างใหญ่"
    },
    Evolution: {
      title: "Evolution (การเปลี่ยนแปลง)",
      image: "/abcde/evolution.png",
      description: "รอยโรคมีการเปลี่ยนแปลงขนาด สี หรือรูปร่างตามเวลา"
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
              process.env.NEXT_PUBLIC_LOGIN_URL || "/";
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
            <input
              type="checkbox"
              checked={saveImage}
              onChange={(e) => setSaveImage(e.target.checked)}
            />
            <label>อนุญาตให้บันทึกผลการวิเคราะห์เพื่อดูย้อนหลัง</label>

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
                    {results?.confidence !== undefined ? results.confidence.toFixed(2) : "0"}%
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
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">{key}</span>

                            {abcdeExamples[key] && (
                              <button
                                onClick={() => setExampleData(abcdeExamples[key])}
                                className="text-gray-400 hover:text-indigo-600"
                                title="ดูตัวอย่าง"
                              >
                                ℹ️
                              </button>
                            )}
                          </div>

                          {detailDescriptions[key] && (
                            <p className="text-xs text-gray-500 mt-1">
                              {detailDescriptions[key]}
                            </p>
                          )}
                        </div>
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
        <div className="bg-indigo-50 p-4 rounded-xl">
  <p className="text-sm text-gray-600">AI Usage</p>
  <p className="text-3xl font-bold text-indigo-700">
    {usageCount} ครั้ง
  </p>
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
              <div key={item.id} className="border rounded-xl overflow-hidden">
                <img
                  src={`${API_BASE}${item.overlay_url}`}
                  alt="History"
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <div className="flex justify-between">
                    <span className={`font-bold ${
                      item.prediction === 'Malignant'
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {item.prediction}
                    </span>

                    <span className="text-sm">
                      {item.pixel_confidence.toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
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
      {exampleData && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
          <button
            onClick={() => setExampleData(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

          <h3 className="text-lg font-bold mb-3">
            {exampleData.title}
          </h3>

          <img
            src={exampleData.image}
            alt={exampleData.title}
            className="w-full rounded-lg border mb-3"
          />

          <p className="text-sm text-gray-600">
            {exampleData.description}
          </p>
        </div>
      </div>
    )}
    </div>
  );
};


export default BreastCancerApp;
// "use client";

// import { useState } from 'react';
// import { signOut, useSession } from 'next-auth/react';
// import { Upload, Info, LogOut, User, X } from 'lucide-react';

// export default function Dashboard() {
//   const { data: session } = useSession();
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [results, setResults] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [showTutorial, setShowTutorial] = useState(true);
//   const [error, setError] = useState('');

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file && file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setUploadedImage(event.target.result);
//         setResults(null);
//         setError('');
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setError('Please upload a valid image file (JPEG, PNG)');
//     }
//   };

//   const analyzeImageWithModel = async () => {
//     if (!uploadedImage) return;
    
//     setIsAnalyzing(true);
//     setError('');

//     try {
//       // Mock analysis for demonstration
//       await new Promise(resolve => setTimeout(resolve, 2500));
      
//       const mockResults = {
//         prediction: Math.random() > 0.5 ? 'Malignant' : 'Benign',
//         confidence: (Math.random() * 30 + 70).toFixed(2),
//         heatmap: uploadedImage,
//         details: {
//           'Mass Detected': Math.random() > 0.3,
//           'Calcification': Math.random() > 0.6,
//           'Asymmetry': Math.random() > 0.5,
//           'Architectural Distortion': Math.random() > 0.7
//         }
//       };
//       setResults(mockResults);
//     } catch (err) {
//       console.error('Analysis error:', err);
//       setError('Failed to analyze image. Please try again.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const handleLogout = async () => {
//     await signOut({ callbackUrl: '/' });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
//       {/* Tutorial Modal */}
//       {showTutorial && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                 How to Use
//               </h2>
//               <button
//                 onClick={() => setShowTutorial(false)}
//                 className="text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="space-y-6">
//               <div className="flex items-start space-x-4 group">
//                 <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
//                   1
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-800 text-lg mb-1">Upload Medical Image</h3>
//                   <p className="text-gray-600">Click the upload area and select a mammogram or breast imaging file (JPEG, PNG).</p>
//                 </div>
//               </div>

//               <div className="flex items-start space-x-4 group">
//                 <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
//                   2
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-800 text-lg mb-1">Analyze Image</h3>
//                   <p className="text-gray-600">Click the "Analyze Image" button to process the image using our AI model.</p>
//                 </div>
//               </div>

//               <div className="flex items-start space-x-4 group">
//                 <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
//                   3
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-800 text-lg mb-1">Review Results</h3>
//                   <p className="text-gray-600">View the prediction, confidence level, and heatmap showing areas of interest detected by the AI.</p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 mt-6">
//                 <p className="text-sm text-yellow-900 leading-relaxed">
//                   <strong className="font-bold text-yellow-900">⚠️ Important:</strong> This tool is for educational and research purposes only. Always consult with qualified medical professionals for proper diagnosis and treatment decisions.
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={() => setShowTutorial(false)}
//               className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
//             >
//               Got it! Let's Start
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//               <span className="text-white font-bold text-xl">🎗️</span>
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                 Breast Cancer AI
//               </h1>
//               <p className="text-xs text-gray-500">Medical Imaging Analysis</p>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setShowTutorial(true)}
//               className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
//             >
//               <Info className="w-5 h-5" />
//               <span className="hidden sm:inline">Help</span>
//             </button>
            
//             {session?.user && (
//               <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
//                 {session.user.image ? (
//                   <img 
//                     src={session.user.image} 
//                     alt={session.user.name} 
//                     className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm" 
//                   />
//                 ) : (
//                   <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                 )}
//                 <span className="text-gray-700 font-medium hidden sm:inline">
//                   {session.user.name?.split(' ')[0] || 'User'}
//                 </span>
//               </div>
//             )}
            
//             <button
//               onClick={handleLogout}
//               className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
//             >
//               <LogOut className="w-5 h-5" />
//               <span className="hidden sm:inline">Logout</span>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
//           {/* Upload Section */}
//           <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//               <Upload className="w-6 h-6 text-indigo-600" />
//               Upload Image
//             </h2>
            
//             <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="hidden"
//                 id="image-upload"
//               />
//               <label htmlFor="image-upload" className="cursor-pointer">
//                 {uploadedImage ? (
//                   <div className="space-y-4">
//                     <img 
//                       src={uploadedImage} 
//                       alt="Uploaded" 
//                       className="max-h-72 mx-auto rounded-2xl shadow-lg ring-2 ring-gray-200" 
//                     />
//                     <p className="text-sm text-gray-600 font-medium">
//                       Click to upload a different image
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                       <Upload className="w-10 h-10 text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="text-gray-700 font-semibold mb-2">
//                         Click to upload medical image
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         Supports: JPEG, PNG • Max 10MB
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </label>
//             </div>

//             {error && (
//               <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm">
//                 {error}
//               </div>
//             )}

//             {uploadedImage && (
//               <button
//                 onClick={analyzeImageWithModel}
//                 disabled={isAnalyzing}
//                 className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
//               >
//                 {isAnalyzing ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     <span>Analyzing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>🔬</span>
//                     <span>Analyze Image</span>
//                   </>
//                 )}
//               </button>
//             )}
//           </div>

//           {/* Results Section */}
//           <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
//               <span>📊</span>
//               Analysis Results
//             </h2>
            
//             {!results && !isAnalyzing && (
//               <div className="text-center py-20 text-gray-400">
//                 <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
//                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                 </div>
//                 <p className="text-lg font-medium">No results yet</p>
//                 <p className="text-sm mt-2">Upload and analyze an image to see results</p>
//               </div>
//             )}

//             {isAnalyzing && (
//               <div className="text-center py-20">
//                 <div className="relative w-20 h-20 mx-auto mb-6">
//                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
//                   <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-indigo-600"></div>
//                 </div>
//                 <p className="text-gray-700 font-semibold text-lg">Analyzing image...</p>
//                 <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
//               </div>
//             )}

//             {results && (
//               <div className="space-y-6">
//                 {/* Prediction Card */}
//                 <div className={`p-6 rounded-2xl shadow-lg ${
//                   results.prediction === 'Malignant' 
//                     ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200' 
//                     : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
//                 }`}>
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600 mb-2">Prediction</p>
//                       <p className={`text-3xl font-bold ${
//                         results.prediction === 'Malignant' ? 'text-red-700' : 'text-green-700'
//                       }`}>
//                         {results.prediction}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-medium text-gray-600 mb-2">Confidence</p>
//                       <p className="text-3xl font-bold text-gray-800">{results.confidence}%</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Heatmap */}
//                 <div>
//                   <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//                     <span>🔥</span> Detection Heatmap
//                   </h3>
//                   <img 
//                     src={results.heatmap} 
//                     alt="Heatmap" 
//                     className="w-full rounded-2xl border-2 border-gray-200 shadow-md" 
//                   />
//                   <p className="text-xs text-gray-500 mt-3 italic">
//                     Highlighted areas show regions analyzed by the AI model
//                   </p>
//                 </div>

//                 {/* Detailed Analysis */}
//                 <div>
//                   <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <span>📋</span> Detailed Analysis
//                   </h3>
//                   <div className="space-y-3">
//                     {Object.entries(results.details).map(([key, value]) => (
//                       <div 
//                         key={key} 
//                         className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow"
//                       >
//                         <span className="text-gray-700 font-medium">{key}</span>
//                         <span className={`font-bold px-4 py-1 rounded-lg ${
//                           value 
//                             ? 'bg-red-100 text-red-700' 
//                             : 'bg-green-100 text-green-700'
//                         }`}>
//                           {value ? '✓ Detected' : '✗ Not Detected'}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Disclaimer */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5">
//                   <p className="text-sm text-blue-900 leading-relaxed">
//                     <strong className="font-bold">⚕️ Medical Disclaimer:</strong> This analysis is provided for educational and research purposes only. Always consult with qualified healthcare professionals for proper medical diagnosis and treatment decisions.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
// app/dashboard/page.js
"use client";

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Upload, Info, LogOut, User, X, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  // =============== STATE MANAGEMENT ===============
  const { data: session, status } = useSession();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [error, setError] = useState('');

  // =============== LOADING STATE ===============
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // =============== REDIRECT IF NOT LOGGED IN ===============
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  // =============== HANDLERS ===============
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setResults(null);
        setError('');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please upload a valid image file (JPEG, PNG)');
    }
  };

  const analyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    setError('');

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock results
      const mockResults = {
        prediction: Math.random() > 0.5 ? 'Malignant' : 'Benign',
        confidence: (Math.random() * 30 + 70).toFixed(2),
        heatmap: uploadedImage,
        details: {
          'Mass Detected': Math.random() > 0.3,
          'Calcification': Math.random() > 0.6,
          'Asymmetry': Math.random() > 0.5,
          'Architectural Distortion': Math.random() > 0.7
        }
      };
      
      setResults(mockResults);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // =============== RENDER ===============
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {/* Header */}
      <Header 
        user={session.user}
        onShowTutorial={() => setShowTutorial(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <UploadSection
            uploadedImage={uploadedImage}
            isAnalyzing={isAnalyzing}
            error={error}
            onImageUpload={handleImageUpload}
            onAnalyze={analyzeImage}
          />

          {/* Results Section */}
          <ResultsSection
            results={results}
            isAnalyzing={isAnalyzing}
          />
          
        </div>
      </main>
    </div>
  );
}

// =============== COMPONENTS ===============

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Header Component
function Header({ user, onShowTutorial, onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Breast Cancer Detection
              </h1>
              <p className="text-xs text-gray-500">AI Medical Analysis</p>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-3">
            
            {/* Help Button */}
            <button
              onClick={onShowTutorial}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5" />
              <span className="hidden sm:inline">Help</span>
            </button>
            
            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || 'User'} 
                    className="w-8 h-8 rounded-full" 
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-gray-700 font-medium hidden sm:inline">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
              </div>
            )}
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// Tutorial Modal Component
function TutorialModal({ onClose }) {
  const steps = [
    {
      number: 1,
      title: 'Upload Medical Image',
      description: 'Click the upload area and select a mammogram or breast imaging file (JPEG, PNG).'
    },
    {
      number: 2,
      title: 'Analyze Image',
      description: 'Click the "Analyze Image" button to process the image using our AI model.'
    },
    {
      number: 3,
      title: 'Review Results',
      description: 'View the prediction, confidence level, and detailed analysis.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">How to Use</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong className="font-semibold">Important:</strong> This tool is for educational purposes only. Always consult qualified medical professionals.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Upload Section Component
function UploadSection({ uploadedImage, isAnalyzing, error, onImageUpload, onAnalyze }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-600" />
        Upload Image
      </h2>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          {uploadedImage ? (
            <div className="space-y-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="max-h-72 mx-auto rounded-lg shadow-md" 
              />
              <p className="text-sm text-gray-600 font-medium">
                Click to upload a different image
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold mb-2">
                  Click to upload medical image
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPEG, PNG • Max 10MB
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      {uploadedImage && (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Analyze Image</span>
          )}
        </button>
      )}
    </div>
  );
}

// Results Section Component
function ResultsSection({ results, isAnalyzing }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
      
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Analysis Results
      </h2>
      
      {/* Empty State */}
      {!results && !isAnalyzing && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600">No results yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload and analyze an image to see results</p>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-gray-900">Analyzing image...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          
          {/* Prediction Card */}
          <PredictionCard prediction={results.prediction} confidence={results.confidence} />
          
          {/* Heatmap */}
          <HeatmapSection heatmap={results.heatmap} />
          
          {/* Detailed Analysis */}
          <DetailedAnalysis details={results.details} />
          
          {/* Disclaimer */}
          <Disclaimer />
          
        </div>
      )}
    </div>
  );
}

// Prediction Card Component
function PredictionCard({ prediction, confidence }) {
  const isMalignant = prediction === 'Malignant';
  
  return (
    <div className={`p-6 rounded-xl border-2 ${
      isMalignant 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Prediction</p>
          <p className={`text-3xl font-bold ${
            isMalignant ? 'text-red-700' : 'text-green-700'
          }`}>
            {prediction}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600 mb-2">Confidence</p>
          <p className="text-3xl font-bold text-gray-900">{confidence}%</p>
        </div>
      </div>
    </div>
  );
}

// Heatmap Section Component
function HeatmapSection({ heatmap }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">
        Detection Heatmap
      </h3>
      <img 
        src={heatmap} 
        alt="Heatmap" 
        className="w-full rounded-xl border border-gray-200 shadow-sm" 
      />
      <p className="text-xs text-gray-500 mt-3">
        Highlighted areas show regions analyzed by the AI model
      </p>
    </div>
  );
}

// Detailed Analysis Component
function DetailedAnalysis({ details }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">
        Detailed Analysis
      </h3>
      <div className="space-y-3">
        {Object.entries(details).map(([key, value]) => (
          <div 
            key={key} 
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-700 font-medium">{key}</span>
            <span className={`font-semibold px-4 py-1 rounded-md ${
              value 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {value ? 'Detected' : 'Not Detected'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Disclaimer Component
function Disclaimer() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          <strong className="font-semibold">Medical Disclaimer:</strong> This analysis is for educational purposes only. Always consult qualified healthcare professionals for proper diagnosis and treatment.
        </p>
      </div>
    </div>
  );
}
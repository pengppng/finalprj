"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Header from "./components/Header";
import TutorialModal from "./components/TutorialModal";
import UploadSection from "./components/UploadSection";
import ResultSection from "./components/ResultSection";
import HistorySection from "./components/HistorySection";
import FeatureModal from "./components/FeatureModal";
import UsageCard from "./components/UsageCard";
import useUsage from "./hooks/useUsage";
import useHistory from "./hooks/useHistory";


const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function BreastCancerApp() {
  const router = useRouter();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  const { usageCount, setUsageCount } = useUsage(API_BASE);
  const { history } = useHistory(API_BASE, showHistory);

  const [saveImage, setSaveImage] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);

  
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeValue, setActiveValue] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/me`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) router.replace("/login");
        return r.json();
      })
      .then((d) => {
        if (d && !d.profile_completed) {
          router.replace("/create-profile");
        }
      });
  }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedImage(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
  };

  const analyzeImage = async () => {
  if (!uploadedImage) return;
    try {
      setIsAnalyzing(true);

      const fd = new FormData();
      fd.append("image", uploadedImage);
      fd.append("save_image", saveImage ? "true" : "false");

      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) throw new Error("Predict failed");

      const data = await res.json();

      setResults({
        prediction: data.prediction,
        confidence: data.confidence,
        heatmap: `${API_BASE}${data.overlay}`,
        details: data.features,
      });

      setUsageCount((c) => c + 1);
    } catch (err) {
      console.error(err);
      alert("Analyze failed");
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="min-h-screen bg-indigo-50">
      <TutorialModal
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      <Header
        onHelp={() => setShowTutorial(true)}
        onLogout={async () => {
          await fetch(`${API_BASE}/logout`, {
            method: "POST",
            credentials: "include",
          });
          window.location.href = "/";
        }}
      />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <UploadSection
            preview={preview}
            uploadedImage={uploadedImage}
            onUpload={handleUpload}
            onAnalyze={analyzeImage}
            isAnalyzing={isAnalyzing}
          />

          <ResultSection
            results={results}
            saveImage={saveImage}
            setSaveImage={setSaveImage}
            onOpenFeature={(key, value) => {
              setActiveFeature(key);
              setActiveValue(value);
            }}
          />
        </div>

        <UsageCard usageCount={usageCount} />

        <HistorySection
          history={history}
          showHistory={showHistory}
          toggle={() => setShowHistory((v) => !v)}
          apiBase={API_BASE}
        />
      </main>

      <FeatureModal
        activeFeature={activeFeature}
        featureValue={activeValue}
        onClose={() => {
          setActiveFeature(null);
          setActiveValue(null);
        }}
      />
    </div>
  );
}
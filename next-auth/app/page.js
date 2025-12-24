"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Shield, Sparkles, AlertCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (res) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token: res.credential,
        }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      // login สำเร็จ → ไป dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Unable to connect with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-indigo-600 p-4 rounded-2xl mb-4">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">
            Breast Cancer AI
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            Secure Medical AI System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Authentication Error</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Google Login */}
        <div className="flex justify-center mb-6">
          {!isLoading ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError("Google authentication failed. Please try again.")
              }
            />
          ) : (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Secure OAuth 2.0 Authentication
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            AI-Powered Medical Analysis
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-purple-600" />
            Research & Education Use
          </div>
        </div>
      </div>
    </div>
  );
}

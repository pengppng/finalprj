"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { Heart, Shield } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBE8E3] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-black/5 p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-[#696156] p-4 rounded-xl mb-4">
            <Heart className="w-7 h-7 text-white" fill="white" />
          </div>

          <h1 className="text-2xl font-semibold text-black">
            Breast Cancer AI
          </h1>
          <p className="text-sm text-[#696156] flex items-center justify-center gap-1 mt-1">
            <Shield className="w-4 h-4" />
            Secure Medical AI System
          </p>
        </div>

        {/* Google Login */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={async (res) => {
              const token = res.credential;

              const r = await fetch(`${API_BASE}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token }),
              });

              if (!r.ok) {
                alert("Login failed");
                return;
              }

              const me = await fetch(`${API_BASE}/me`, {
                credentials: "include",
              }).then((r) => r.json());

              if (!me.profile_completed) {
                router.push("/create-profile");
              } else {
                router.push("/dashboard");
              }
            }}
            onError={() => {
              console.log("Google Login Error");
            }}
          />
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-[#696156]">
          For research and educational purposes only.
          <br />
          Not intended for clinical diagnosis.
        </p>
      </div>
    </div>
  );
}
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Call Python API
    const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:5000";
    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      throw new Error("Python API request failed");
    }

    const results = await response.json();
    return NextResponse.json(results);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}
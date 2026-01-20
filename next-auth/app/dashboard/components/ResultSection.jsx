"use client";
import { FileImage, AlertCircle } from "lucide-react";
import featureMeta from "../config/featureMeta";

export default function ResultSection({
  results,
  saveImage,
  setSaveImage,
  onOpenFeature,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Analysis Results
      </h2>

      {/* Save Image */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={saveImage}
          onChange={(e) => setSaveImage(e.target.checked)}
        />
        <label className="text-sm text-gray-700">
          อนุญาตให้บันทึกผลการวิเคราะห์เพื่อดูย้อนหลัง
        </label>
      </div>

      {results ? (
        <div className="space-y-5">
          {/* Prediction */}
          <div
            className={`p-6 rounded-xl border-2 ${
              results.prediction === "Malignant"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <p className="text-sm font-medium text-gray-600 mb-2">
              Prediction:
            </p>
            <p
              className={`text-3xl font-bold ${
                results.prediction === "Malignant"
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              {results.prediction}
            </p>
          </div>

          {/* Confidence */}
          <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Confidence:
            </p>
            <p className="text-3xl font-bold text-blue-700">
              {results.confidence?.toFixed(2)}%
            </p>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Detailed Analysis
            </h3>

            <div className="space-y-3">
              {Object.entries(results.details || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">
                          {featureMeta[key]?.label || key}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onOpenFeature(
                              key,
                              String(value).replace(/\s+/g, "").toLowerCase()
                            )
                          }
                        >
                          ℹ️
                        </button>
                      </div>

                      {featureMeta[key]?.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {featureMeta[key].description}
                        </p>
                      )}
                    </div>

                    <span className="px-4 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-sm">
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Heatmap */}
          {results.heatmap && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🔥 Detection Heatmap
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

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Important:</strong> This is for educational
                purposes only. Always consult medical professionals.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
            <FileImage size={48} className="opacity-50" />
          </div>
          <p className="text-lg font-medium text-gray-500">
            No results yet
          </p>
          <p className="text-sm mt-2">
            Upload and analyze an image to see results
          </p>
        </div>
      )}
    </div>
  );
}

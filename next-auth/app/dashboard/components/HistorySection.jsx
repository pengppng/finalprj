import { History } from "lucide-react";

export default function HistorySection({
  history=[],
  showHistory,
  toggle,
  apiBase,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold flex gap-3">
          <History /> Analysis History
        </h2>
        <button
          onClick={toggle}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
        >
          {showHistory ? "Hide" : "Show"} ({history.length})
        </button>
      </div>

      {showHistory && history.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((h) => (
            <div key={h.id} className="border rounded-xl overflow-hidden">
              <img
                src={`${apiBase}${h.overlay_url}`}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between">
                  <span className="font-bold">{h.prediction}</span>
                  <span>{h.pixel_confidence.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

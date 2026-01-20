import featureMeta from "../config/featureMeta";

export default function DetailedAnalysis({ details, onFeatureClick }) {
  if (!details) return null;

  return (
    <div className="space-y-3">
      {Object.entries(details).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {featureMeta[key]?.label || key}
            </span>

            <button
              type="button"
              onClick={() => onFeatureClick(key, value)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ℹ️
            </button>
          </div>

          <span className="px-3 py-1 bg-indigo-100 rounded">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

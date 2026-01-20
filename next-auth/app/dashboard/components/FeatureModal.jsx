import featureMeta from "../config/featureMeta";

export default function FeatureModal({
  activeFeature,
  featureValue,
  onClose,
}) {
  if (!activeFeature) return null;

  const meta = featureMeta[activeFeature];
  if (!meta) return null;

  const valueKey = String(featureValue ?? "")
  .trim()
  .toLowerCase();

  const example =
    meta.examples &&
    Object.entries(meta.examples).find(
      ([key]) => key.toLowerCase() === valueKey
    )?.[1];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-6 rounded-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-500"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-3">
          {meta.label}
        </h3>

        {meta.image && (
          <img
            src={meta.image}
            alt={meta.label}
            className="w-full h-40 object-contain rounded-lg border mb-4"
          />
        )}

        {example ? (
          <>
            <p className="font-semibold mb-1">
              {example.title}
            </p>
            <p className="text-sm text-gray-700">
              {example.description}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            ไม่มีข้อมูลเพิ่มเติม
          </p>
        )}
      </div>
    </div>
  );
}

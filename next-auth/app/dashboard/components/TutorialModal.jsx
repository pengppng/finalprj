import { AlertCircle, X } from "lucide-react";

export default function TutorialModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome! Here's How to Use the App
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-start space-x-4">
              <div className="shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {n}
              </div>
              <div>
                {n === 1 && (
                  <>
                    <h3 className="font-semibold text-lg">Upload Medical Image</h3>
                    <p className="text-gray-600">
                      Click the upload area and select an ultrasound image.
                    </p>
                  </>
                )}
                {n === 2 && (
                  <>
                    <h3 className="font-semibold text-lg">Analyze with AI</h3>
                    <p className="text-gray-600">
                      Click “Analyze Image” to start AI processing.
                    </p>
                  </>
                )}
                {n === 3 && (
                  <>
                    <h3 className="font-semibold text-lg">Review Results</h3>
                    <p className="text-gray-600">
                      View prediction, confidence, details, and heatmap.
                    </p>
                  </>
                )}
                {n === 4 && (
                  <>
                    <h3 className="font-semibold text-lg">Check History</h3>
                    <p className="text-gray-600">
                      Previous analyses appear in History.
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                This system is for educational and demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg"
        >
          Got it! Let's Start
        </button>
      </div>
    </div>
  );
}

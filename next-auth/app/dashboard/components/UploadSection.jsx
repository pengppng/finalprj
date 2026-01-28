import { Upload, FileImage, Loader } from "lucide-react";

export default function UploadSection({
  preview,
  error,
  uploadedImage,
  isAnalyzing,
  onUpload,
  onAnalyze,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Upload size={24} className="text-indigo-600" />
        </div>
        Upload Image
      </h2>

      <label className="flex col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group">
        {preview ? (
          <div className="w-full h-full p-4 flex col items-center justify-center">
            <img src={preview} className="max-h-full object-contain rounded-lg" />
            <p className="text-sm text-gray-500 mt-3">Click to change image</p>
          </div>
        ) : (
          <div className="flex col items-center">
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
              <FileImage size={48} className="text-indigo-600" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">Click to upload image</p>
            <p className="text-sm text-gray-500">PNG, JPG, DICOM (.dcm) up to 10MB</p>
          </div>
        )}
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.dcm"
          onChange={onUpload}
          className="hidden"
        />
      </label>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={!uploadedImage || isAnalyzing}
        className="w-full mt-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold"
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="animate-spin" size={20} />
            Analyzing...
          </span>
        ) : (
          "Analyze Image"
        )}
      </button>
    </div>
  );
}
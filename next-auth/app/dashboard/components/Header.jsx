import { Info } from "lucide-react";

export default function Header({ onHelp, onLogout }) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">AI Breast Cancer Detection</h1>
          <p className="text-sm text-gray-600">Medical Imaging Analysis System</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onHelp}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
          >
            <Info size={18} /> Help
          </button>
          <button onClick={onLogout} className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

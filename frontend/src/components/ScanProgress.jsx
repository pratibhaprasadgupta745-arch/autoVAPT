// src/components/ScanProgress.jsx
import React from "react";

function ScanProgress({ progress = 0 }) {

  // 🔥 Stage detection (real tool feel)
  const getStage = () => {
    if (progress < 20) return "Initializing Scan...";
    if (progress < 40) return "Running Nmap (Port Scan)...";
    if (progress < 60) return "Running SQLMap (Injection Test)...";
    if (progress < 80) return "Running Nikto (Web Scan)...";
    if (progress < 95) return "Analyzing Results...";
    return "Finalizing Report...";
  };

  return (
    <div className="bg-slate-900 p-4 rounded shadow-md">

      {/* Progress Bar */}
      <div className="bg-slate-700 h-4 rounded overflow-hidden">
        <div
          className="bg-green-500 h-4 rounded transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Progress Text */}
      <p className="mt-2 text-sm text-gray-300">
        Progress: {progress}%
      </p>

      {/* 🔥 Stage Text */}
      <p className="text-xs text-cyan-400 mt-1 italic">
        {getStage()}
      </p>

    </div>
  );
}

export default ScanProgress;
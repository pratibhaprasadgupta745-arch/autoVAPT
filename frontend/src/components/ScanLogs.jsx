// src/components/ScanLogs.jsx
import React, { useEffect, useRef } from "react";

function ScanLogs({ logs = [] }) {
  const logEndRef = useRef(null);

  // 🔥 Auto-scroll to latest log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 🎯 Severity detection
  const getLogStyle = (log) => {
    const text = log.toLowerCase();

    if (text.includes("error") || text.includes("failed"))
      return "text-red-400";
    if (text.includes("warning"))
      return "text-yellow-400";
    if (text.includes("open") || text.includes("found"))
      return "text-green-400";

    return "text-gray-300";
  };

  if (!logs.length) {
    return (
      <div className="bg-black p-4 rounded text-gray-500 font-mono h-64 flex items-center justify-center">
        No logs available yet...
      </div>
    );
  }

  return (
    <div className="bg-black p-4 rounded font-mono h-64 overflow-y-auto border border-green-500 shadow-inner">
      
      {logs.map((l, i) => (
        <p key={i} className={`whitespace-pre-wrap ${getLogStyle(l)}`}>
          ▶ {l}
        </p>
      ))}

      {/* 🔥 Auto-scroll anchor */}
      <div ref={logEndRef} />
    </div>
  );
}

export default ScanLogs;
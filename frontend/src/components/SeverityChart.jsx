import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function SeverityChart({ data }) {
  // Default data if no props provided
  const chartData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Vulnerabilities",
        data: data || [2, 5, 8, 3],
        backgroundColor: ["#dc2626", "#f97316", "#eab308", "#16a34a"],
        borderColor: "#1e293b", // dark border
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: { color: "#fff" }, // white text for dark theme
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow mt-6 w-full md:w-96 text-white">
      <h2 className="text-xl font-semibold mb-4">Vulnerability Severity</h2>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export default SeverityChart;
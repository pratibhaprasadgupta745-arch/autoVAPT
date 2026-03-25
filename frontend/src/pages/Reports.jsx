import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/report.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import jsPDF from "jspdf";
import "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Report() {
  const navigate = useNavigate();

  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    total: 0,
    riskScore: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/vulnerabilities");
      const data = await res.json();

      const safe = Array.isArray(data) ? data : [];
      setVulnerabilities(safe);

      let critical = 0,
        high = 0,
        medium = 0,
        low = 0;

      safe.forEach((v) => {
        if (v.severity === "Critical") critical++;
        if (v.severity === "High") high++;
        if (v.severity === "Medium") medium++;
        if (v.severity === "Low") low++;
      });

      let riskScore = 100 - (critical * 6 + high * 4 + medium * 2 + low);
      if (riskScore < 0) riskScore = 0;

      setSummary({
        total: safe.length,
        riskScore,
        critical,
        high,
        medium,
        low,
      });
    } catch (err) {
      console.error(err);
      alert("Error fetching vulnerabilities");
    } finally {
      setLoading(false);
    }
  };

  const filteredData =
    filterSeverity === "All"
      ? vulnerabilities
      : vulnerabilities.filter((v) => v.severity === filterSeverity);

  const chartData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Vulnerabilities",
        data: [
          summary.critical,
          summary.high,
          summary.medium,
          summary.low,
        ],
        backgroundColor: ["#ef4444", "#f97316", "#facc15", "#22c55e"],
      },
    ],
  };

  const exportCSV = () => {
    const headers = ["#", "Target", "Vulnerability", "Severity", "CVSS"];

    const rows = vulnerabilities.map((v, i) => [
      i + 1,
      v.path,
      v.name,
      v.severity,
      v.cvss_score || "N/A",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "AutoVAPT_Report.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AutoVAPT Security Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    doc.text(`Risk Score: ${summary.riskScore}/100`, 14, 36);

    const rows = vulnerabilities.map((v, i) => [
      i + 1,
      v.path,
      v.name,
      v.severity,
      v.cvss_score || "N/A",
    ]);

    doc.autoTable({
      head: [["#", "Target", "Vulnerability", "Severity", "CVSS"]],
      body: rows,
      startY: 45,
    });

    doc.save("AutoVAPT_Report.pdf");
  };

  return (
    <div className="report-page">

      <div className="report-header">
        <h1>Security Report Dashboard</h1>
      </div>

      {loading ? (
        <div className="loading">Scanning report data...</div>
      ) : (
        <>
          {/* SUMMARY */}
          <div className="summary-grid">

            <div className="card total">
              <h3>Total</h3>
              <p>{summary.total}</p>
            </div>

            <div className="card critical">
              <h3>Critical</h3>
              <p>{summary.critical}</p>
            </div>

            <div className="card high">
              <h3>High</h3>
              <p>{summary.high}</p>
            </div>

            <div className="card medium">
              <h3>Medium</h3>
              <p>{summary.medium}</p>
            </div>

            <div className="card low">
              <h3>Low</h3>
              <p>{summary.low}</p>
            </div>

            <div className="card score">
              <h3>Risk Score</h3>
              <p>{summary.riskScore}/100</p>
            </div>

          </div>

          {/* CHART */}
          <div className="chart-box">
            <Bar data={chartData} />
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            <label>Filter:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="table-box">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Target</th>
                  <th>Vulnerability</th>
                  <th>Severity</th>
                  <th>CVSS</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      No vulnerabilities found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((v, i) => (
                    <tr key={i} className={`row ${v.severity.toLowerCase()}`}>
                      <td>{i + 1}</td>
                      <td>{v.path}</td>
                      <td>{v.name}</td>
                      <td>{v.severity}</td>
                      <td>{v.cvss_score || "N/A"}</td>
                      <td>
                        <button onClick={() =>
                          alert(`Fix:\n${v.fix || "N/A"}`)
                        }>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ACTIONS */}
          <div className="action-bar">
            <button onClick={() => navigate("/scan")}>New Scan</button>
            <button onClick={exportCSV}>CSV</button>
            <button onClick={exportPDF}>PDF</button>
          </div>

        </>
      )}
    </div>
  );
}

export default Report;
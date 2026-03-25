import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    score: null,
    assets: 0,
    vulns: 0,
    scans: 0
  });

  const [recentScans, setRecentScans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [terminalMode, setTerminalMode] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:8000/dashboard/stats");
      const data = await res.json();

      setMetrics({
        score: data?.score ?? null,
        assets: data?.assets || 0,
        vulns: data?.vulns || 0,
        scans: data?.scans || 0
      });

      const scanRes = await fetch("http://localhost:8000/dashboard/recent-scans");
      const scanData = await scanRes.json();
      setRecentScans(scanData || []);

      const alertRes = await fetch("http://localhost:8000/dashboard/alerts");
      const alertData = await alertRes.json();
      setAlerts((alertData || []).map(a => a.message));

    } catch (err) {
      console.log("Dashboard Error:", err);
    }
  };

  return (
    <div className={terminalMode ? "dashboard terminal" : "dashboard"}>

      {/* HERO */}
      <div className="hero">
        <h1>AutoVAPT Security Center</h1>

        <button
          className="terminal-btn"
          onClick={() => setTerminalMode(!terminalMode)}
        >
          {terminalMode ? "Exit Terminal Mode" : "Enter Terminal Mode"}
        </button>
      </div>

      {/* NORMAL MODE */}
      {!terminalMode && (
        <>
          {/* METRICS */}
          <div className="metrics">

            <div className="metric-card">
              <h3>Risk Score</h3>
              <h2 className="green">
                {metrics.score === null ? "—" : metrics.score}
              </h2>
            </div>

            <div className="metric-card">
              <h3>Assets</h3>
              <h2>{metrics.assets}</h2>
            </div>

            <div className="metric-card">
              <h3>Vulnerabilities</h3>
              <h2 className="red">{metrics.vulns}</h2>
            </div>

            <div className="metric-card">
              <h3>Total Scans</h3>
              <h2 className="yellow">{metrics.scans}</h2>
            </div>

          </div>

          {/* ALERTS */}
          <div className="panel">
            <h2>Threat Feed</h2>
            <ul className="threat-feed">
              {alerts.length === 0 ? (
                <li>No alerts 🚀</li>
              ) : (
                alerts.map((a, i) => (
                  <li key={i}>⚠️ {a}</li>
                ))
              )}
            </ul>
          </div>

          {/* SCANS */}
          <div className="panel">
            <h2>Recent Scans</h2>

            <table className="scan-table">
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentScans.length === 0 ? (
                  <tr>
                    <td colSpan="2">No scans yet 🚀</td>
                  </tr>
                ) : (
                  recentScans.map((s, i) => (
                    <tr key={i}>
                      <td>{s.target}</td>
                      <td>{s.status || "completed"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        </>
      )}

      {/* 💀 TERMINAL MODE */}
      {terminalMode && (
        <div className="terminal-box">
          <p>root@autovapt:~$ boot system...</p>
          <p>✔ Loading scan engine...</p>
          <p>✔ Connecting vulnerability database...</p>
          <p>✔ Initializing risk engine...</p>
          <p>✔ Fetching live scan data...</p>
          <br />

          <p className="green">SYSTEM: ONLINE 🔥</p>
          <p className="red">VULNERABILITIES: {metrics.vulns}</p>
          <p className="yellow">RISK SCORE: {metrics.score === null ? "—" : metrics.score}</p>

          <br />
          <p>root@autovapt:~$ _</p>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
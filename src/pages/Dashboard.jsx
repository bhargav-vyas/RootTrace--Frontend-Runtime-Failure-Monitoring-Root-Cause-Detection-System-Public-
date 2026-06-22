import { useEffect, useState } from "react";
import { getAllErrors, generateTestError } from "../services/errorService";
import "./Dashboard.css";

function Dashboard() {
  const [errors, setErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const data = await getAllErrors();
      setErrors(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGenerateError = async () => {
    try {
      await generateTestError();

      setTimeout(() => {
        fetchErrors();
      }, 2000);
    } catch (error) {
      console.error("Failed to generate test error", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="top-section">
        <div>
          <h1 className="main-title">RootTrace</h1>
          <p className="subtitle">AI Runtime Monitoring Platform</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button className="generate-btn" onClick={handleGenerateError}>
            Generate Error
          </button>

          <div className="live-badge">● LIVE</div>
        </div>
      </div>

      {/* STATS */}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Errors</h3>
          <p>{errors.length}</p>
        </div>

        <div className="stat-card">
          <h3>Critical Errors</h3>
          <p>{errors.length}</p>
        </div>

        <div className="stat-card">
          <h3>System Status</h3>
          <p className="active-text">ACTIVE</p>
        </div>
      </div>

      {/* TABLE */}

      <div className="table-card">
        <div className="table-header">Error Logs</div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Exception</th>
              <th>Message</th>
              <th>URL</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {errors.map((err) => (
              <tr
                key={err.id}
                onClick={() => setSelectedError(err)}
                className="clickable-row"
              >
                <td>{err.id}</td>

                <td>
                  <span className="exception-pill">{err.exceptionType}</span>
                </td>

                <td className="message-cell">{err.message}</td>

                <td>{err.requestUrl}</td>

                <td>{err.httpMethod}</td>

                <td>
                  <span className="status-pill">{err.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      {selectedError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedError(null)}
            >
              ✕
            </button>

            <h2 className="modal-title">Error Details</h2>

            <div className="detail-section">
              <p>
                <strong>Exception:</strong> {selectedError.exceptionType}
              </p>

              <p>
                <strong>Message:</strong> {selectedError.message}
              </p>

              <p>
                <strong>Endpoint:</strong> {selectedError.requestUrl}
              </p>

              <p>
                <strong>Method:</strong> {selectedError.httpMethod}
              </p>

              <p>
                <strong>Status:</strong> {selectedError.status}
              </p>
            </div>

            {/* AI SECTION */}

            <div className="ai-section">
              <h3>AI Analysis</h3>

              <p>
                RootTrace AI will analyze this stack trace and suggest possible
                fixes.
              </p>
            </div>

            <div className="stacktrace-box">
              <h3>Stack Trace</h3>

              <pre>{selectedError.stackTrace}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

import { useEffect, useState } from "react";
import {
  getAllErrors,
  generateTestError,
  analyzeError,
  resolveError,
} from "../services/errorService";
import ErrorChart from "../components/ErrorChart";
import "./Dashboard.css";

function Dashboard() {
  const [errors, setErrors] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

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

  const handleSelectError = async (err) => {
    setSelectedError(err);
    setAiAnalysis("");
    setLoadingAnalysis(true);

    try {
      const result = await analyzeError(err.stackTrace);
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis Failed", error);
      setAiAnalysis("Failed to generate AI analysis.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveError(id);

      await fetchErrors();

      setSelectedError(null);
    } catch (error) {
      console.error("Failed to resolve error", error);
    }
  };

  const filteredErrors = errors.filter((err) => {
    const matchesSearch =
      err.exceptionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      err.requestUrl?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || err.status === statusFilter;

    const matchesSeverity =
      severityFilter === "ALL" || err.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

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
          <p>{errors.filter((e) => e.severity === "CRITICAL").length}</p>
        </div>

        <div className="stat-card">
          <h3>System Status</h3>
          <p className="active-text">ACTIVE</p>
        </div>
      </div>
      <ErrorChart errors={errors} />

      {/* FILTERS */}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search errors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severity</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
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
              <th>Severity</th>
            </tr>
          </thead>

          <tbody>
            {filteredErrors.map((err) => (
              <tr
                key={err.id}
                onClick={() => handleSelectError(err)}
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

                <td>
                  <span
                    className={`severity-badge ${err.severity?.toLowerCase()}`}
                  >
                    {err.severity}
                  </span>
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

              <p>
                <strong>Severity:</strong> {selectedError.severity}
              </p>

              {selectedError.status === "OPEN" && (
                <button
                  className="generate-btn"
                  onClick={() => handleResolve(selectedError.id)}
                >
                  Mark Resolved
                </button>
              )}
            </div>

            <div className="ai-section">
              <h3>AI Analysis</h3>

              {loadingAnalysis ? (
                <p>Analyzing error...</p>
              ) : (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#111",
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {aiAnalysis || "No AI analysis available."}
                </div>
              )}
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

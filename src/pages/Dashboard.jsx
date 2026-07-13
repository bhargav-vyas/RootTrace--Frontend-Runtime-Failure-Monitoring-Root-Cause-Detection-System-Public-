import { useEffect, useState } from "react";

import {
  getAllErrors,
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

      setErrors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  const totalOccurrences = errors.reduce((total, error) => {
    return total + (error.occurrenceCount ?? 1);
  }, 0);

  const openIssues = errors.filter((error) => error.status === "OPEN").length;

  const criticalIssues = errors.filter(
    (error) => error.severity === "CRITICAL",
  ).length;

  const filteredErrors = errors.filter((err) => {
    const normalizedSearch = searchTerm.toLowerCase();

    const matchesSearch =
      err.applicationName?.toLowerCase().includes(normalizedSearch) ||
      err.exceptionType?.toLowerCase().includes(normalizedSearch) ||
      err.message?.toLowerCase().includes(normalizedSearch) ||
      err.requestUrl?.toLowerCase().includes(normalizedSearch);

    const matchesStatus = statusFilter === "ALL" || err.status === statusFilter;

    const matchesSeverity =
      severityFilter === "ALL" || err.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="dashboard-container">
      {/* TOP SECTION */}

      <div className="top-section">
        <div>
          <h1 className="main-title">RootTrace</h1>

          <p className="subtitle">AI Runtime Monitoring Platform</p>
        </div>

        <div className="live-badge">● LIVE</div>
      </div>

      {/* STATS */}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Issues</h3>

          <p>{errors.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Occurrences</h3>

          <p>{totalOccurrences}</p>
        </div>

        <div className="stat-card">
          <h3>Open Issues</h3>

          <p>{openIssues}</p>
        </div>

        <div className="stat-card">
          <h3>Critical Issues</h3>

          <p>{criticalIssues}</p>
        </div>
      </div>

      {/* ERROR CHART */}

      <ErrorChart errors={errors} />

      {/* FILTERS */}

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Status</option>

          <option value="OPEN">Open</option>

          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
        >
          <option value="ALL">All Severity</option>

          <option value="LOW">Low</option>

          <option value="MEDIUM">Medium</option>

          <option value="HIGH">High</option>

          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* ISSUE TABLE */}

      <div className="table-card">
        <div className="table-header">Issues</div>

        <table>
          <thead>
            <tr>
              <th>Application</th>

              <th>Exception</th>

              <th>Endpoint</th>

              <th>Occurrences</th>

              <th>First Seen</th>

              <th>Last Seen</th>

              <th>Status</th>

              <th>Severity</th>
            </tr>
          </thead>

          <tbody>
            {filteredErrors.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-message">
                  No issues found.
                </td>
              </tr>
            ) : (
              filteredErrors.map((err) => (
                <tr
                  key={err.id}
                  onClick={() => handleSelectError(err)}
                  className="clickable-row"
                >
                  <td>{err.applicationName || "Unknown Application"}</td>

                  <td>
                    <span className="exception-pill">
                      {err.exceptionType || "Unknown Exception"}
                    </span>
                  </td>

                  <td>{err.requestUrl || "—"}</td>

                  <td>
                    <span className="occurrence-badge">
                      {err.occurrenceCount ?? 1}
                    </span>
                  </td>

                  <td>{formatDate(err.firstSeen)}</td>

                  <td>{formatDate(err.lastSeen)}</td>

                  <td>
                    <span
                      className={`status-pill ${
                        err.status?.toLowerCase() || ""
                      }`}
                    >
                      {err.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`severity-badge ${
                        err.severity?.toLowerCase() || ""
                      }`}
                    >
                      {err.severity || "UNKNOWN"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ISSUE DETAILS MODAL */}

      {selectedError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => setSelectedError(null)}
            >
              ✕
            </button>

            <h2 className="modal-title">Issue Details</h2>

            <div className="detail-section">
              <p>
                <strong>Application:</strong>{" "}
                {selectedError.applicationName || "Unknown Application"}
              </p>

              <p>
                <strong>Environment:</strong> {selectedError.environment || "—"}
              </p>

              <p>
                <strong>Service Version:</strong>{" "}
                {selectedError.serviceVersion || "—"}
              </p>

              <p>
                <strong>Exception:</strong> {selectedError.exceptionType}
              </p>

              <p>
                <strong>Message:</strong> {selectedError.message || "—"}
              </p>

              <p>
                <strong>Endpoint:</strong> {selectedError.requestUrl || "—"}
              </p>

              <p>
                <strong>HTTP Method:</strong> {selectedError.httpMethod || "—"}
              </p>

              <p>
                <strong>HTTP Status:</strong> {selectedError.statusCode ?? "—"}
              </p>

              <p>
                <strong>Occurrences:</strong>{" "}
                {selectedError.occurrenceCount ?? 1}
              </p>

              <p>
                <strong>First Seen:</strong>{" "}
                {formatDate(selectedError.firstSeen)}
              </p>

              <p>
                <strong>Last Seen:</strong> {formatDate(selectedError.lastSeen)}
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

            {/* AI ANALYSIS */}

            <div className="ai-section">
              <h3>AI Analysis</h3>

              {loadingAnalysis ? (
                <p>Analyzing error...</p>
              ) : (
                <div className="ai-analysis-content">
                  {aiAnalysis || "No AI analysis available."}
                </div>
              )}
            </div>

            {/* STACK TRACE */}

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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function ErrorChart({ errors }) {
  const lowCount = errors.filter((e) => e.severity === "LOW").length;

  const mediumCount = errors.filter((e) => e.severity === "MEDIUM").length;

  const highCount = errors.filter((e) => e.severity === "HIGH").length;

  const criticalCount = errors.filter((e) => e.severity === "CRITICAL").length;

  const data = {
    labels: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    datasets: [
      {
        label: "Error Count",
        data: [lowCount, mediumCount, highCount, criticalCount],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        padding: "25px",
        borderRadius: "20px",
        marginBottom: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Error Severity Analytics</h2>

      <Bar data={data} options={options} />
    </div>
  );
}

export default ErrorChart;

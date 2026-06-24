// import axios from "axios";

// const API_URL =
//   "https://roottrace-runtime-failure-monitoring.onrender.com/api/errors";

// export const getAllErrors = async () => {
//   const response = await axios.get(API_URL);
//   return response.data;
// };

// export const generateTestError = async () => {
//   return axios.get(
//     "https://roottrace-runtime-failure-monitoring.onrender.com/test-error"
//   );
// };
import axios from "axios";

const API_URL = "http://localhost:8081/api/errors";

export const getAllErrors = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const generateTestError = async () => {
  return axios.get("http://localhost:8081/test-error");
};

export const analyzeError = async (stackTrace) => {
  const response = await axios.post(
    "http://localhost:8081/api/ai/analyze",
    {
      stackTrace,
    }
  );

  return response.data;
};
export const resolveError = async (id) => {
  const response = await axios.put(
    `http://localhost:8081/api/errors/${id}/resolve`
  );

  return response.data;
};
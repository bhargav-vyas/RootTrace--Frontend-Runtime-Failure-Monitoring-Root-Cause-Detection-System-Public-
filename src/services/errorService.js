import axios from "axios";

const BASE_URL =
  "https://roottrace-runtime-failure-monitoring.onrender.com";

export const getAllErrors = async () => {
  const response = await axios.get(`${BASE_URL}/api/errors`);
  return response.data;
};

export const generateTestError = async () => {
  return axios.get(`${BASE_URL}/test-error`);
};

export const analyzeError = async (stackTrace) => {
  const response = await axios.post(
    `${BASE_URL}/api/ai/analyze`,
    {
      stackTrace,
    }
  );

  return response.data;
};

export const resolveError = async (id) => {
  const response = await axios.put(
    `${BASE_URL}/api/errors/${id}/resolve`
  );

  return response.data;
};
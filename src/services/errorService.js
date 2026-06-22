import axios from "axios";

const API_URL =
  "https://roottrace-runtime-failure-monitoring.onrender.com/api/errors";

export const getAllErrors = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const generateTestError = async () => {
  return axios.get(
    "https://roottrace-runtime-failure-monitoring.onrender.com/test-error"
  );
};
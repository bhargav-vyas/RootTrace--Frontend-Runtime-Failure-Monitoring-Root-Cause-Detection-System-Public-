import axios from "axios";

const API_URL = "http://localhost:8081/api/errors";

export const getAllErrors = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};
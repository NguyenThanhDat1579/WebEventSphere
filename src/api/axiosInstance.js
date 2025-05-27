import axios from "axios";

const BASE_URL = "https://eventssphereapi.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axiosInstance;

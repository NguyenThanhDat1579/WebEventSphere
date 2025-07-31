import axios from "axios";
import { getTokens, saveTokens, deleteTokens } from "./token/authTokens"; // đường dẫn đúng tới file token của bạn

const BASE_URL = "http://api.eventsphere.io.vn/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) {
          deleteTokens();
          return Promise.reject(error);
        }

        const res = await axios.post(`${BASE_URL}/users/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = res.data.token;
        const newRefreshToken = res.data.refreshToken || refreshToken;

        saveTokens(newAccessToken, newRefreshToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        deleteTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

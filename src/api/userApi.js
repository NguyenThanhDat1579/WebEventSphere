import axiosInstance from "./axiosInstance";

const userApi = {
  getAll: () => axiosInstance.get("/users/all"),
};

export default userApi;

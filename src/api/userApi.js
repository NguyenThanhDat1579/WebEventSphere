import axiosInstance from "./axiosInstance";

const userApi = {
  getAll: () => axiosInstance.get("/users/all"),
  getUserById: (id) => axiosInstance.get(`/users/getUser/${id}`),
};

export default userApi;

import axiosInstance from "./axiosInstance";

const userApi = {
  getAll: () => axiosInstance.get("/users/all"),
  getUserById: (id) => axiosInstance.get(`/users/getUser/${id}`),
  editUser: (body) => axiosInstance.put("/users/edit", body),
};

export default userApi;

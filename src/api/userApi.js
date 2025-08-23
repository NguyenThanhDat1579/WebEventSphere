import axiosInstance from "./axiosInstance";

const userApi = {
  getAll: () => axiosInstance.get("/users/all"),
  getUserById: (id) => axiosInstance.get(`/users/getUser/${id}`),
  editUser: (body) => axiosInstance.put("/users/edit", body),
   editPassword: (body) => axiosInstance.put("/users/editPassword", body),
};

export default userApi;

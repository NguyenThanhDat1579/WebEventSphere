import axiosInstance from "../axiosInstance";

const authApi = {
  login: (email, password) => {
    return axiosInstance.post("/users/login", {
      email,
      password,
    });
  },
};

export default authApi;

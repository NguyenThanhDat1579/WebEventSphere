import axiosInstance from "./axiosInstance";

const eventApi = {
  getAllHome: () => axiosInstance.get("/events/home"),
  getDetail: (id) => axiosInstance.get(`/events/detail/${id}`),
};

export default eventApi;
// 
import axiosInstance from "./axiosInstance";

const eventApi = {
  getAllHome: () => axiosInstance.get("/events/home"),
  getDetail: (id) => axiosInstance.get(`/events/detail/${id}`),
  editEvent: (payload) => axiosInstance.put("/events/edit", payload),

};

export default eventApi;

import axiosInstance from "./axiosInstance";

const eventApi = {
  getAllHome: () => axiosInstance.get("/events/home"),
  getDetail: (id) => axiosInstance.get(`/events/detail/${id}`),
  editEvent: (payload) => axiosInstance.put("/events/edit", payload),

  approveEvent: (id) =>
    axiosInstance.put(`/events/approve/${id}`, {
      approvalStatus: "approved",
      reason: "Duyệt",
    }),

  rejectEvent: (id) =>
    axiosInstance.put(`/events/approve/${id}`, {
      approvalStatus: "rejected",
      reason: reason || "Từ chối",
    }),

  getPendingApproval: () => axiosInstance.get("/events/pending-approval"),
};

export default eventApi;

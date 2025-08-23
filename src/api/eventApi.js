import axiosInstance from "./axiosInstance";

const eventApi = {
  getAllHome: () => axiosInstance.get("/events/home"),
  getAll: () => axiosInstance.get("/events/all?showAll=true"),
  getDetail: (id) => axiosInstance.get(`/events/detail/${id}`),
  editEvent: (payload) => axiosInstance.put("/events/edit", payload),

  approveEvent: (id) =>
    axiosInstance.put(`/events/approve/${id}`, {
      approvalStatus: "approved",
      reason: "Duyệt",
    }),

  // rejectEvent: (id) =>
  //   axiosInstance.put(`/events/approve/${id}`, {
  //     approvalStatus: "rejected",
  //     reason: reason || "Từ chối",
  //   }),
  rejectEvent: async (eventId, rejectReason) => { // Thêm tham số rejectReason
    console.log("Gửi request tới API rejectEvent với ID:", eventId, "và lý do:", rejectReason);
    const response = await axiosInstance.put(`/events/approve/${eventId}`, {
      approvalStatus: "rejected",
      reason: rejectReason || "Từ chối", // Sử dụng rejectReason thay vì reason
    });
    return response;
  },

  getPendingApproval: () => axiosInstance.get("/events/pending-approval"),

  getSuggestedTags: () => axiosInstance.get("/tags/suggest"),
  
  createTag: (name) =>
  axiosInstance.post("/tags/create", { name }),

    postponeEvent: (id,) =>
    axiosInstance.put(`/events/postpone/${id}`),

    unpostponeEvent: (id,) =>
    axiosInstance.put(`/events/unpostpone/${id}`),
};

export default eventApi;

// src/api/eventApi.js
import axiosInstance from "../axiosInstance";

const eventApi = {
  getEventOfOrganization: () => {
    return axiosInstance.get("/users/eventOfOrganization");
  },
  addEvent: (eventInfo) => {
    return axiosInstance.post("/events/add", eventInfo);
  },
};

export default eventApi;

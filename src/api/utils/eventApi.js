// src/api/eventApi.js
import axiosInstance from "../axiosInstance";

const eventApi = {
  getEventOfOrganization: () => {
    return axiosInstance.get("/users/eventOfOrganization");
  },
};

export default eventApi;

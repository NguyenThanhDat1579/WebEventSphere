// src/api/eventApi.js
import axiosInstance from "../axiosInstance";
import { getTokens } from "../token/authTokens";
const eventApi = {
  getEventOfOrganization: () => {
    return axiosInstance.get("/users/eventOfOrganization");
  },
  addEvent: (eventInfo) => {
    return axiosInstance.post("/events/add", eventInfo);
  },
};

export default eventApi;

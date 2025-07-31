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
  getAllTicketsByEvent: (eventId) =>
    axiosInstance.get(`/tickets/all-tickets/${eventId}`),
  verifyTicket: ({ ticketId, showtimeId }) => {
    return axiosInstance.post("/tickets/verify-ticket", {
      ticketId,
      showtimeId,
    });
  },

};

export default eventApi;

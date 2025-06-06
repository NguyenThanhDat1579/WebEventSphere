import axiosInstance from "../axiosInstance";

const eventApi = {
  getEventOfOrganization: (token) => {
    return axiosInstance.get("/users/eventOfOrganization", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default eventApi;

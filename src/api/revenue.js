import axiosInstance from "./axiosInstance";
const revenueApi  ={
    getRevenue: () => axiosInstance.get("/events/revenue")
}
export default revenueApi;
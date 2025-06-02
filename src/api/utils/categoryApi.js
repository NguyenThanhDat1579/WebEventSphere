import axiosInstance from "../axiosInstance";

const categoryApi = {
  getAllCategories: () => {
    return axiosInstance.get("/categories/all");
  },
};

export default categoryApi;

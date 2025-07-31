import axiosInstance from "../axiosInstance";

const authApi = {

  login: (email, password) => {
    return axiosInstance.post("/users/login", {
      email,
      password,
    });
  },

  register: (body) => {
    return axiosInstance.post("/users/register", body);
  },

  // Gửi lại mã OTP sau khi đăng ký
  resendRegisterOtp: (email) => {
    return axiosInstance.post("/users/resend-otp", { email });
  },

  // Xác minh OTP sau khi đăng ký
  verifyRegisterOtp: (email, otp) => {
    return axiosInstance.post("/users/verify-otp", { email, otp });
  },

  // ========================================
  // 🔁 Quên mật khẩu
  // ========================================

  // Gửi email để yêu cầu OTP
  forgotPasswordRequest: (email) => {
    return axiosInstance.post("/users/forgotPassword/request", { email });
  },

  // Gửi lại mã OTP khi quên mật khẩu
  resendForgotOtp: (email) => {
    return axiosInstance.post("/users/forgotPassword/resend", { email });
  },

  // Xác minh mã OTP trong quy trình quên mật khẩu
  verifyForgotOtp: (email, otp) => {
    return axiosInstance.post("/users/forgotPassword/verify", { email, otp });
  },

  // Đặt lại mật khẩu sau khi xác minh OTP
  resetPassword: (email, newPassword) => {
    return axiosInstance.post("/users/forgotPassword/reset", {
      email,
      newPassword,
    });
  },
};

export default authApi;

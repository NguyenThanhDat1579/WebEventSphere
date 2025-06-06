export const saveTokens = (accessToken, refreshToken) => {
  try {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  } catch (e) {
    console.error("Lỗi lưu token:", e);
  }
};

export const getTokens = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return { accessToken, refreshToken };
  } catch (e) {
    console.error("Lỗi lấy token:", e);
    return null;
  }
};

export const deleteTokens = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (e) {
    console.error("Lỗi xóa token:", e);
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("eventAppState", serializedState);
  } catch (error) {
    console.error("Lỗi khi lưu trạng thái vào localStorage:", error);
  }
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("eventAppState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Lỗi khi khôi phục trạng thái từ localStorage:", error);
    return undefined;
  }
};
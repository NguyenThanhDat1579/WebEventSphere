import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  email: null,
  token: null,
  refreshToken: null,
  fcmTokens: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { id, email, token, refreshToken, fcmTokens, role } = action.payload;
      state.id = id;
      state.email = email;
      state.token = token;
      state.refreshToken = refreshToken;
      state.fcmTokens = fcmTokens;
      state.role = role;
    },
    clearUserData: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setUserData, clearUserData } = authSlice.actions;
export default authSlice.reducer;

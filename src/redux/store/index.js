import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventInfoReducer from "./slices/eventInfoSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    eventInfo: eventInfoReducer,
  },
});

export default store;

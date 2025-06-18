import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventInfoReducer from "./slices/eventInfoSlice";
import eventAddressReducer from "./slices/eventAddressSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    eventInfo: eventInfoReducer,
    eventAddress: eventAddressReducer,
  },
});

export default store;

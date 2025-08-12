import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventInfoReducer from "./slices/eventInfoSlice";
import eventAddressReducer from "./slices/eventAddressSlice";
import { saveState, loadState } from "../../utils/persistState";

const preloadedState = loadState() || {
  eventInfo: {},
  eventAddress: {},
};


const store = configureStore({
  reducer: {
    auth: authReducer,
    eventInfo: eventInfoReducer,
    eventAddress: eventAddressReducer,
  },
  preloadedState
});

store.subscribe(() => {
  saveState({
    eventInfo: store.getState().eventInfo,
    eventAddress: store.getState().eventAddress,
  });
});

export default store;

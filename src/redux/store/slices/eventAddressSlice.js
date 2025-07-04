// src/redux/slices/eventAddressSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  province: "",
  ward: "",
  address: "", // Số nhà, đường
};

const eventAddressSlice = createSlice({
  name: "eventAddress",
  initialState,
  reducers: {
    setProvince: (state, action) => {
      state.province = action.payload;
    },
    setWard: (state, action) => {
      state.ward = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    resetAddress: () => initialState,
  },
});

export const { setProvince, setWard, setAddress, resetAddress } = eventAddressSlice.actions;

export default eventAddressSlice.reducer;

// src/redux/slices/eventInfoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Cơ bản
  name: "",
  description: "",
  // addressName: "",
  location: "",
  categories: "",
  tags: [],

  // Hình ảnh
  avatar: null,
  banner: null,
  images: [],

  // Thời gian
  timeStart: null,
  timeEnd: null,

  // Tọa độ
  latitude: null,
  longitude: null,

  // Vé tổng
  ticketPrice: 0,
  ticketQuantity: 0,

  // Người tạo
  userId: "",

  // Cấu trúc vé
  typeBase: null,
  zones: [],
  showtimes: [],
};

const eventInfoSlice = createSlice({
  name: "eventInfo",
  initialState,
  reducers: {
    setEventName: (state, action) => {
      state.name = action.payload;
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    // setAddressName: (state, action) => {
    //   state.addressName = action.payload;
    // },
    setFullAddress: (state, action) => {
      state.location = action.payload;
    },
    setCategory: (state, action) => {
      state.categories = action.payload;
    },
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    setEventLogo: (state, action) => {
      state.avatar = action.payload;
    },
    setEventBanner: (state, action) => {
      state.banner = action.payload;
    },
    setEventImages: (state, action) => {
      state.images = action.payload;
    },
    setTimeStart: (state, action) => {
      state.timeStart = action.payload;
    },
    setTimeEnd: (state, action) => {
      state.timeEnd = action.payload;
    },
    setLatitude: (state, action) => {
      state.latitude = Number(action.payload);
    },
    setLongitude: (state, action) => {
      state.longitude = Number(action.payload);
    },
    setTicketPrice: (state, action) => {
      state.ticketPrice = Number(action.payload);
    },
    setTicketQuantity: (state, action) => {
      state.ticketQuantity = Number(action.payload);
    },

    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setTypeBase: (state, action) => {
      state.typeBase = action.payload;
    },
    setZones: (state, action) => {
      state.zones.push(action.payload); // payload là object
    },
    resetZones: (state) => {
      state.zones = [];
    },

    setShowtimes: (state, action) => {
      state.showtimes = action.payload;
    },
    resetEventInfo: () => initialState,
  },
});

export const {
  setEventName,
  setDescription,
  setAddressName,
  setFullAddress,
  setCategory,
  setTags,
  setEventLogo,
  setEventBanner,
  setEventImages,
  setTimeStart,
  setTimeEnd,
  setLatitude,
  setLongitude,
  setTicketPrice,
  setTicketQuantity,
  setUserId,
  setTypeBase,
  setZones,
  setShowtimes,
  resetEventInfo,
  resetZones,
} = eventInfoSlice.actions;

export default eventInfoSlice.reducer;

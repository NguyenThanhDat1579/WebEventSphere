import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  IconButton,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import CustomTextField from "./CustomTextField";
import CustomDateTimePicker from "./CustomDateTimePicker";

import DeleteIcon from "@mui/icons-material/Delete";
import eventApi from "../../../../../api/utils/eventApi";
import {
  setTimeStart,
  setTimeEnd,
  setTicketPrice,
  setTicketQuantity as setTicketQuantityAction,
  setTypeBase,
  setZones as setZonesAction,
  setShowtimes,
  resetEventInfo,
  setDescription,
  setEventBanner,
  setEventImages,
  setEventLogo,
  setLatitude,
  setLongitude,
  setTags,
  setUserId,
  resetZones,
} from "../../../../../redux/store/slices/eventInfoSlice";
import { resetAddress } from "../../../../../redux/store/slices/eventAddressSlice";
import { format, parse } from "date-fns";
import dayjs from "dayjs";
export default function ScheduleSection() {
  const navigate = useNavigate();

  const [ticketForm, setTicketForm] = useState({ typeBase: "none" });
  const [zones, setZones] = useState([]);

  const [zoneName, setZoneName] = useState("");
  const [zoneNameError, setZoneNameError] = useState("");
  const [zoneError, setzoneError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [ticketPriceZone, setTicketPriceZone] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [ticketPriceZoneError, setTicketPriceZoneError] = useState("");
  const [ticketQuantityError, setTicketQuantityError] = useState("");

  const [price, setPrice] = useState("");
  const [localShowtimes, setLocalShowtimes] = useState([]);
  const [showtimeListError, setShowtimeListError] = useState(false);
  const [showtimeStart, setShowtimeStart] = useState("");
  const [showtimeEnd, setShowtimeEnd] = useState("");
  const [showtimeError, setShowtimeError] = useState("");
  const [seatLayoutError, setSeatLayoutError] = useState("");

  const dispatch = useDispatch();
  const eventInfo = useSelector((state) => state.eventInfo);
  const [startDateTime, setStartDateTime] = useState(dayjs());
  const [alertStatus, setAlertStatus] = useState(null);
  useEffect(() => {
    console.log("eventInfo đã cập nhật2:", eventInfo);
    console.log("TimeStart: ", startTime);
  }, [eventInfo]);

  function toUnixTimestamp(datetimeString) {
    if (!datetimeString) return null;

    const timestamp = Date.parse(datetimeString); // hoặc new Date(datetimeString).getTime()
    return isNaN(timestamp) ? null : timestamp;
  }

  const handleStartTimeChange = (e) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    validateTimes(newStart, endTime); // Kiểm tra lỗi
  };

  const handleEndTimeChange = (e) => {
    const newEnd = e.target.value;
    setEndTime(newEnd);
    validateTimes(startTime, newEnd); // Kiểm tra lỗi
  };

  const validateTimes = (start, end) => {
    if (start && end && new Date(end) <= new Date(start)) {
      setTimeError("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
    } else {
      setTimeError("");
    }
  };

  const handleShowtimeStartChange = (e) => {
    const value = e.target.value;
    setShowtimeStart(value);
    validateShowtimeTimes(value, showtimeEnd);
  };

  const handleShowtimeEndChange = (e) => {
    const value = e.target.value;
    setShowtimeEnd(value);
    validateShowtimeTimes(showtimeStart, value);
  };

  const validateShowtimeTimes = (start, end) => {
    if (!start || !end || !startTime || !endTime) {
      setShowtimeError("");
      return;
    }

    const showStart = new Date(start);
    const showEnd = new Date(end);
    const saleEnd = new Date(endTime);

    if (showEnd <= showStart) {
      setShowtimeError("Kết thúc suất chiếu phải lớn hơn bắt đầu.");
    } else if (showStart < saleEnd) {
      setShowtimeError("Suất chiếu phải bắt đầu sau khi kết thúc bán vé.");
    } else {
      setShowtimeError("");
    }
  };

  const handleAddShowtime = () => {
    // Kiểm tra nếu chưa nhập thời gian
    if (!showtimeStart || !showtimeEnd) {
      setShowtimeError("Vui lòng chọn thời gian bắt đầu và kết thúc suất chiếu.");
      return;
    }
    // Gọi lại validate
    validateShowtimeTimes(showtimeStart, showtimeEnd);

    // Nếu có lỗi, không thực hiện thêm
    if (showtimeError || !showtimeStart || !showtimeEnd) return;

    const startTimestamp = new Date(showtimeStart).getTime();
    const endTimestamp = new Date(showtimeEnd).getTime();

    setLocalShowtimes((prev) => [...prev, { startTime: startTimestamp, endTime: endTimestamp }]);
    setShowtimeStart("");
    setShowtimeEnd("");
    setShowtimeError(""); // Reset lỗi nếu thêm thành công
    setShowtimeListError(false);
  };

  const handleRemoveShowtime = (indexToRemove) => {
    setLocalShowtimes((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${min}, ${dd}/${mm}/${yyyy}`;
  };

  const handleChangeTypeBase = (e) => {
    setTicketForm({ ...ticketForm, typeBase: e.target.value });
    // Reset zones mỗi khi đổi typeBase
    setZones([]);
  };

  // Hàm thêm zone mới vào danh sách zones
  const handleAddZone = () => {
    let hasError = false;
    if (!zoneName.trim()) {
      setZoneNameError("Vui lòng nhập tên khu vực.");
      hasError = true;
    } else {
      setZoneNameError("");
    }

    if (!ticketPriceZone || isNaN(ticketPriceZone) || Number(ticketPriceZone) <= 0) {
      setTicketPriceZoneError("Vui lòng nhập giá vé.");
      hasError = true;
    } else {
      setTicketPriceZoneError("");
    }

    // Kiểm tra số lượng vé
    if (!ticketQuantity || isNaN(ticketQuantity) || Number(ticketQuantity) <= 0) {
      setTicketQuantityError("Vui lòng nhập số lượng vé.");
      hasError = true;
    } else {
      setTicketQuantityError("");
    }

    if (hasError) return;
    const newZone = {
      name: zoneName,
      totalTicketCount: Number(ticketQuantity),
      price: Number(ticketPriceZone),
    };

    setZones((prev) => [...prev, newZone]);

    // Reset form
    setZoneName("");
    setTicketPriceZone("");
    setTicketQuantity("");
  };

  const handleRemoveZone = (indexToRemove) => {
    const updatedZones = zones.filter((_, idx) => idx !== indexToRemove);
    setZones(updatedZones);
  };

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [area, setArea] = useState("");
  const [seatPrice, setSeatPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const handleToggleSeat = (row, col) => {
    const seatId = `${row}-${col}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleToggleAllSeats = () => {
    if (selectedSeats.length === rows * cols) {
      // Bỏ chọn tất cả
      setSelectedSeats([]);
    } else {
      // Chọn tất cả
      const allSeats = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          allSeats.push(`${r}-${c}`);
        }
      }
      setSelectedSeats(allSeats);
    }
  };

  const validateForm = () => {
    let hasError = false;

    if (!startTime || !endTime) {
      setTimeError("Vui lòng chọn thời gian bắt đầu và kết thúc bán vé.");
      hasError = true;
    } else if (new Date(endTime) <= new Date(startTime)) {
      setTimeError("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      hasError = true;
    } else {
      setTimeError("");
    }

    if (ticketForm.typeBase === "none") {
      if (!ticketPriceZone || Number(ticketPriceZone) <= 0) {
        setTicketPriceZoneError("Vui lòng nhập giá vé.");
        hasError = true;
      } else {
        setTicketPriceZoneError("");
      }

      if (!ticketQuantity || Number(ticketQuantity) <= 0) {
        setTicketQuantityError("Vui lòng nhập số lượng vé.");
        hasError = true;
      } else {
        setTicketQuantityError("");
      }
    }

    if (ticketForm.typeBase === "zone") {
      if (zones.length == 0) {
        setzoneError("* Vui lòng nhập ít nhất một khu vực.");
        setZoneNameError("");
        setTicketPriceZoneError("");
        setTicketQuantityError("");
        hasError = true;
      } else {
        setzoneError("");
      }
    }

    if (ticketForm.typeBase === "seat") {
      if (!ticketPriceZone || Number(ticketPriceZone) <= 0) {
        setTicketPriceZoneError("Vui lòng nhập giá vé.");
        hasError = true;
      } else {
        setTicketPriceZoneError("");
      }

      if (!ticketQuantity || Number(ticketQuantity) <= 0) {
        setTicketQuantityError("Vui lòng nhập số lượng vé.");
        hasError = true;
      } else {
        setTicketQuantityError("");
      }

      if (!zoneName.trim()) {
        setZoneNameError("Vui lòng nhập tên khu vực.");
        hasError = true;
      } else {
        setZoneNameError("");
      }
    }

    if (localShowtimes.length === 0) {
      setShowtimeListError(true);
      hasError = true;
    } else {
      setShowtimeListError(false);
    }

    if (ticketForm.typeBase === "seat") {
      if (rows <= 0 || cols <= 0) {
        setSeatLayoutError("* Vui lòng nhập số hàng và cột hợp lệ.");
        hasError = true;
      } else {
        setSeatLayoutError("");
      }
    }

    return hasError;
  };

  const handleSaveZoneOrSeat = async () => {
    const hasError = validateForm();
    if (hasError) return false;

    const startUnix = toUnixTimestamp(startTime);
    const endUnix = toUnixTimestamp(endTime);

    dispatch(setTimeStart(startUnix));
    dispatch(setTimeEnd(endUnix));
    dispatch(setTypeBase(ticketForm.typeBase));

    if (ticketForm.typeBase === "none") {
      const mappedShowtimes = localShowtimes.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
        ticketPrice: Number(ticketPriceZone),
        ticketQuantity: Number(ticketQuantity),
      }));
      dispatch(setShowtimes(mappedShowtimes));
      dispatch(resetZones());
      return true;
    }

    if (ticketForm.typeBase === "zone") {
      dispatch(resetZones());
      zones.forEach((zone) => {
        dispatch(setZonesAction(zone));
      });
      dispatch(setShowtimes(localShowtimes));
      return true;
    }

    if (ticketForm.typeBase === "seat") {
      return new Promise((resolve) => {
        const seats = selectedSeats.map((seatId) => {
          const [row, col] = seatId.split("-").map(Number);
          const rowLabel = String.fromCharCode(65 + row);
          return {
            seatId: `${rowLabel}${col + 1}`,
            row: row + 1,
            col: col + 1,
            label: `${rowLabel}${col + 1}`,
            price: seatPrice,
            area: area,
          };
        });

        const newZone = {
          name: area,
          layout: {
            rows,
            cols,
            seats,
          },
          showtimes: [
            {
              startTime: startUnix,
              endTime: endUnix,
            },
          ],
        };

        // cập nhật state trước khi dispatch
        setZones((prev) => {
          const filtered = prev.filter((z) => !z.layout?.seats);
          const updatedZones = [...filtered, newZone];

          dispatch(resetZones());
          dispatch(setZonesAction(newZone));
          dispatch(setShowtimes(localShowtimes));
          resolve(true); // chỉ resolve sau khi setZones và dispatch xong

          return updatedZones;
        });
      });
    }

    return true;
  };

  const handleSubmit = async () => {
    const isSaved = await handleSaveZoneOrSeat();
    if (!isSaved) return;

    // Đợi một chút để Redux state cập nhật hoàn tất
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await submitEvent(); // gọi sau khi chắc chắn dữ liệu đã cập nhật
  };

  const submitEvent = async () => {
    try {
      setAlertStatus("loading");

      console.log("📦 Payload gửi đi:", JSON.stringify(eventInfo, null, 2));
      // const response = await eventApi.addEvent(eventInfo);
      // console.log("✅ API Response:", response.data);

      // if (response.data?.status === true) {
      dispatch(resetEventInfo());
      dispatch(resetAddress());

      setAlertStatus("success"); // 👈 Thành công

      setTimeout(() => {
        navigate("/dashboard-organizer");
      }, 1000);
      // }
    } catch (error) {
      console.error("❌ Lỗi khi tạo sự kiện:", error);
      if (error.response) {
        console.error("💥 Phản hồi từ server:", error.response.data);
      }

      setAlertStatus("error"); // 👈 Thất bại
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* <CustomDateTimePicker
              label="Thời gian bắt đầu"
              value={startDateTime}
              onChange={(newValue) => setStartDateTime(newValue)}
              name="startTime"
            /> */}
            <Grid container spacing={3}>
              {/* Tên địa điểm */}
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Thời gian bắt đầu bán vé"
                  type="datetime-local"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  error={Boolean(timeError)}
                  helperText={timeError}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  label="Thời gian kết thúc bán vé"
                  type="datetime-local"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  error={Boolean(timeError)}
                  helperText={timeError}
                />
              </Grid>
            </Grid>
            <Box>
              <Typography variant="h6" gutterBottom>
                Hình thức loại vé
              </Typography>
              <RadioGroup
                row
                value={ticketForm.typeBase}
                onChange={handleChangeTypeBase}
                sx={{ p: 2 }}
              >
                <FormControlLabel value="none" control={<Radio />} label="Thường" />
                <FormControlLabel value="zone" control={<Radio />} label="Khu vực" />
                <FormControlLabel value="seat" control={<Radio />} label="Ghế" />
              </RadioGroup>
            </Box>

            {ticketForm.typeBase === "none" && (
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      label="Giá vé"
                      type="number"
                      value={ticketPriceZone}
                      onChange={(e) => setTicketPriceZone(e.target.value)}
                      placeholder="Nhập giá vé"
                      error={Boolean(ticketPriceZoneError)}
                      helperText={ticketPriceZoneError}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      label="Tổng số lượng vé"
                      type="number"
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(e.target.value)}
                      placeholder="Nhập số lượng vé"
                      error={Boolean(ticketQuantityError)}
                      helperText={ticketQuantityError}
                    />
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <Typography variant="h5" gutterBottom>
                    Tạo suất chiếu
                  </Typography>
                  {showtimeListError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, ml: 1 }}>
                      * Vui lòng tạo ít nhất một suất chiếu.
                    </Typography>
                  )}

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Thời gian bắt đầu suất chiếu"
                        type="datetime-local"
                        value={showtimeStart}
                        onChange={handleShowtimeStartChange}
                        fullWidth
                        error={!!showtimeError}
                        helperText={showtimeError}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Thời gian kết thúc suất chiếu"
                        type="datetime-local"
                        value={showtimeEnd}
                        onChange={handleShowtimeEndChange} // <- Đổi từ setShowtimeEnd trực tiếp
                        fullWidth
                        error={!!showtimeError}
                        helperText={showtimeError}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        onClick={handleAddShowtime}
                        fullWidth
                        sx={{
                          mt: 4,
                          backgroundColor: "#1976D2",
                          color: "#fff",
                          border: "1px solid #1976D2", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#1976D2",
                            border: "1px solid #1976D2", // giữ nguyên border khi hover
                          },
                        }}
                      >
                        Tạo suất chiếu
                      </Button>
                    </Grid>
                  </Grid>

                  {localShowtimes.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Danh sách suất chiếu đã tạo:
                      </Typography>
                      <Grid container spacing={2}>
                        {localShowtimes.map((show, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Suất #{index + 1}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Bắt đầu:</strong> {formatTime(show.startTime)}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Kết thúc:</strong> {formatTime(show.endTime)}
                                </Typography>
                              </Box>
                              <IconButton
                                aria-label="Xoá suất chiếu"
                                size="small"
                                color="error"
                                onClick={() => handleRemoveShowtime(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {ticketForm.typeBase === "zone" && (
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  backgroundColor: "#fdfdfd",
                }}
              >
                {/* Nhập khu vực */}
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Thêm khu vực
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <CustomTextField
                        value={zoneName}
                        onChange={(e) => setZoneName(e.target.value)}
                        placeholder="Nhập tên khu vực"
                        label="Tên khu vực"
                        maxLength={80}
                        error={Boolean(zoneNameError)}
                        helperText={zoneNameError}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <CustomTextField
                        label="Giá vé"
                        type="number"
                        value={ticketPriceZone}
                        onChange={(e) => setTicketPriceZone(e.target.value)}
                        placeholder="Nhập giá vé"
                        error={Boolean(ticketPriceZoneError)}
                        helperText={ticketPriceZoneError}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <CustomTextField
                        label="Tổng số lượng vé"
                        type="number"
                        value={ticketQuantity}
                        onChange={(e) => setTicketQuantity(e.target.value)}
                        placeholder="Nhập số lượng vé"
                        error={Boolean(ticketQuantityError)}
                        helperText={ticketQuantityError}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleAddZone}
                        sx={{
                          backgroundColor: "#1976D2",
                          color: "#fff",
                          border: "1px solid #1976D2", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#1976D2",
                            border: "1px solid #1976D2", // giữ nguyên border khi hover
                          },
                        }}
                      >
                        Thêm khu vực
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Danh sách khu vực */}
                <Box>
                  {zones.length === 0 ? (
                    <Typography variant="body2" color="error" sx={{ ml: 1, mt: -2, mb: -2 }}>
                      {zoneError}
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Danh sách khu vực đã thêm:
                        </Typography>
                      </Grid>
                      {zones.map((zone, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Paper
                            elevation={1}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              p: 2,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Khu vực: {zone.name}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Giá vé:</strong> {zone.price.toLocaleString()} ₫
                              </Typography>
                              <Typography variant="body2">
                                <strong>Số lượng vé:</strong> {zone.totalTicketCount}
                              </Typography>
                            </Box>

                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleRemoveZone(index)}
                              aria-label="Xoá khu vực"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>

                {/* Nhập suất chiếu */}
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Tạo suất chiếu
                  </Typography>
                  {showtimeListError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, ml: 1 }}>
                      * Vui lòng tạo ít nhất một suất chiếu.
                    </Typography>
                  )}
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Thời gian bắt đầu"
                        type="datetime-local"
                        value={showtimeStart}
                        onChange={(e) => setShowtimeStart(e.target.value)}
                        fullWidth
                        error={!!showtimeError}
                        helperText={showtimeError}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Thời gian kết thúc"
                        type="datetime-local"
                        value={showtimeEnd}
                        onChange={(e) => setShowtimeEnd(e.target.value)}
                        fullWidth
                        error={!!showtimeError}
                        helperText={showtimeError}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        onClick={handleAddShowtime}
                        fullWidth
                        sx={{
                          mt: 4,
                          backgroundColor: "#1976D2",
                          color: "#fff",
                          border: "1px solid #1976D2", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#1976D2",
                            border: "1px solid #1976D2", // giữ nguyên border khi hover
                          },
                        }}
                      >
                        Tạo suất chiếu
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Danh sách suất chiếu */}
                  {localShowtimes.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Danh sách suất chiếu đã tạo:
                      </Typography>
                      <Grid container spacing={2}>
                        {localShowtimes.map((show, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Box
                              sx={{
                                p: 2,
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Suất #{index + 1}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Bắt đầu:</strong> {formatTime(show.startTime)}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Kết thúc:</strong> {formatTime(show.endTime)}
                                </Typography>
                              </Box>
                              <IconButton
                                aria-label="Xoá suất chiếu"
                                size="small"
                                color="error"
                                onClick={() => handleRemoveShowtime(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {ticketForm.typeBase === "seat" && (
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  backgroundColor: "#fdfdfd",
                }}
              >
                {/* Thông tin khu vực */}

                <Typography variant="h5">Thông tin khu vực ghế</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      label="Tên khu vực ghế"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Nhập tên khu vực"
                      maxLength={80}
                      error={Boolean(zoneNameError)}
                      helperText={zoneNameError}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomTextField
                      label="Giá vé"
                      type="number"
                      value={ticketPriceZone}
                      onChange={(e) => setTicketPriceZone(e.target.value)}
                      placeholder="Nhập giá vé"
                      error={Boolean(ticketPriceZoneError)}
                      helperText={ticketPriceZoneError}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CustomTextField
                      label="Tổng số lượng vé"
                      type="number"
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(e.target.value)}
                      placeholder="Nhập số lượng vé"
                      error={Boolean(ticketQuantityError)}
                      helperText={ticketQuantityError}
                    />
                  </Grid>
                </Grid>
                {/* Suất chiếu */}
                <Typography variant="h5" sx={{ mb: -2 }}>
                  Tạo suất chiếu
                </Typography>
                {showtimeListError && (
                  <Typography variant="body2" color="error" sx={{ mt: -1, ml: 1, mb: -1 }}>
                    * Vui lòng tạo ít nhất một suất chiếu.
                  </Typography>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <CustomTextField
                      label="Thời gian bắt đầu"
                      type="datetime-local"
                      value={showtimeStart}
                      onChange={(e) => setShowtimeStart(e.target.value)}
                      fullWidth
                      error={!!showtimeError}
                      helperText={showtimeError}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <CustomTextField
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      value={showtimeEnd}
                      onChange={(e) => setShowtimeEnd(e.target.value)}
                      fullWidth
                      error={!!showtimeError}
                      helperText={showtimeError}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      onClick={handleAddShowtime}
                      fullWidth
                      sx={{
                        mt: 4,
                        backgroundColor: "#1976D2",
                        color: "#fff",
                        border: "1px solid #1976D2", // ✅ thêm vào trạng thái mặc định
                        boxSizing: "border-box",
                        "&:hover": {
                          backgroundColor: "#fff",
                          color: "#1976D2",
                          border: "1px solid #1976D2", // giữ nguyên border khi hover
                        },
                      }}
                    >
                      Tạo suất chiếu
                    </Button>
                  </Grid>
                </Grid>
                {/* Danh sách suất chiếu */}
                {localShowtimes.length > 0 && (
                  <Box mt={3} sx={{ mt: -1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Danh sách suất chiếu đã tạo:
                    </Typography>
                    <Grid container spacing={2}>
                      {localShowtimes.map((show, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Box
                            sx={{
                              p: 2,
                              border: "1px solid #ccc",
                              borderRadius: 2,
                              backgroundColor: "#f5f5f5",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Suất #{index + 1}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Bắt đầu:</strong> {formatTime(show.startTime)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Kết thúc:</strong> {formatTime(show.endTime)}
                              </Typography>
                            </Box>
                            <IconButton
                              aria-label="Xoá suất chiếu"
                              size="small"
                              color="error"
                              onClick={() => handleRemoveShowtime(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {/* Sơ đồ ghế */}
                <Typography variant="h5" gutterBottom>
                  Tạo sơ đồ ghế
                </Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} md={3}>
                    <CustomTextField
                      label="Số hàng"
                      type="number"
                      value={rows}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setRows(value);
                        if (value <= 0) setSeatLayoutError("Số hàng phải lớn hơn 0");
                        else setSeatLayoutError("");
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <CustomTextField
                      label="Số cột"
                      type="number"
                      value={cols}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setCols(value);
                        if (value <= 0) setSeatLayoutError("Số cột phải lớn hơn 0");
                        else setSeatLayoutError("");
                      }}
                    />
                  </Grid>
                </Grid>
                {seatLayoutError && (
                  <Typography color="error" variant="body2" sx={{ mt: -4 }}>
                    {seatLayoutError}
                  </Typography>
                )}

                {rows > 0 && cols > 0 ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Sơ đồ ghế
                    </Typography>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                      <Box key={rowIndex} sx={{ display: "flex", gap: 1, mb: 1 }}>
                        {Array.from({ length: cols }).map((_, colIndex) => {
                          const seatId = `${rowIndex}-${colIndex}`;
                          const isSelected = selectedSeats.includes(seatId);
                          return (
                            <Box
                              key={colIndex}
                              onClick={() => handleToggleSeat(rowIndex, colIndex)}
                              sx={{
                                width: 30,
                                height: 30,
                                backgroundColor: isSelected ? "#428BD9" : "lightgray",
                                color: isSelected ? "#fff" : "black",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 1,
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                            >
                              {String.fromCharCode(65 + rowIndex)}
                              {colIndex + 1}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Tổng số ghế đã chọn: <strong>{selectedSeats.length}</strong>
                    </Typography>

                    <Button
                      variant="outlined"
                      onClick={handleToggleAllSeats}
                      sx={{
                        mt: 2,
                        backgroundColor: "#1976D2",
                        color: "#fff",
                        border: "1px solid #1976D2",
                        "&:hover": {
                          backgroundColor: "#fff",
                          color: "#1976D2",
                        },
                      }}
                    >
                      {selectedSeats.length === rows * cols ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </Button>
                  </Box>
                ) : (
                  ""
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleSaveZoneOrSeat}
          sx={{
            color: "#1976D2",
            borderColor: "#1976D2",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#1976D2",
              color: "#fff",
            },
          }}
        >
          Lưu khu vực
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#1976D2",
            color: "#fff",
            border: "1px solid #1976D2",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#1976D2",
            },
          }}
        >
          Gửi
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            dispatch(resetEventInfo());
            dispatch(resetAddress());
          }}
          sx={{
            backgroundColor: "#1976D2",
            color: "#fff",
            border: "1px solid #1976D2",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#1976D2",
            },
          }}
        >
          Xoá
        </Button>
        <Snackbar
          open={alertStatus === "loading"}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="info"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            Đang tạo sự kiện...
          </Alert>
        </Snackbar>

        <Snackbar
          open={alertStatus === "success"}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={2000}
        >
          <Alert
            severity="success"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            Tạo sự kiện thành công!
          </Alert>
        </Snackbar>

        <Snackbar
          open={alertStatus === "error"}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={3000}
        >
          <Alert
            severity="error"
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            Tạo sự kiện thất bại!
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

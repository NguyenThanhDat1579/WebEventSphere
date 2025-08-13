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
import ZoneSeatLayout from "../../components/ZoneSeatLayout";
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

  const [localShowtimes, setLocalShowtimes] = useState([]);
  const [showtimeListError, setShowtimeListError] = useState(false);
  const [showtimeStart, setShowtimeStart] = useState("");
  const [showtimeEnd, setShowtimeEnd] = useState("");
  const [showtimeError, setShowtimeError] = useState("");
  const [zoneSeat, setZoneSeat] = useState(null);
  const [seatLayoutInfo, setSeatLayoutInfo] = useState({
      zones: [],
      rows: 0,
      cols: 0,
      hasValidLayout: false
    });
const [seatLayoutError, setSeatLayoutError] = useState("");

 
  const dispatch = useDispatch();
  const eventInfo = useSelector((state) => state.eventInfo);
  const [alertStatus, setAlertStatus] = useState(null); // "loading" | "success" | "error"
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    console.log("eventInfo đã cập nhật2:", eventInfo);
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
      setShowtimeError("Kết thúc suất diễn phải lớn hơn bắt đầu.");
    } else if (showStart < saleEnd) {
      setShowtimeError("Suất diễn phải bắt đầu sau khi kết thúc bán vé.");
    } else {
      setShowtimeError("");
    }
  };

  const handleAddShowtime = () => {
    // Kiểm tra nếu chưa nhập thời gian
    if (!showtimeStart || !showtimeEnd) {
      setShowtimeError("Vui lòng chọn thời gian bắt đầu và kết thúc suất diễn.");
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
    setSeatLayoutError("");
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
       if (seatLayoutInfo.zones.length === 0 || seatLayoutInfo.rows === 0 || seatLayoutInfo.cols === 0) {
        setSeatLayoutError("Vui lòng tạo sơ đồ ghế");
        hasError = true;
      } else if (!seatLayoutInfo.hasValidLayout) {
        setSeatLayoutError("Vui lòng tạo sơ đồ ghế");
        hasError = true;
      } else {
        setSeatLayoutError("");
      }
    }

    if (localShowtimes.length === 0) {
      setShowtimeListError(true);
      hasError = true;
    } else {
      setShowtimeListError(false);
    }

    return hasError;
  };

  const handleSaveZoneOrSeat = async () => {
    const hasError = validateForm();
    if (hasError) return false;
    setAlertStatus("success");
    setAlertMessage("Đã lưu dữ liệu");
    const startUnix = toUnixTimestamp(startTime);
    const endUnix = toUnixTimestamp(endTime);

    dispatch(setTimeStart(startUnix));
    dispatch(setTimeEnd(endUnix));
    dispatch(setTypeBase(ticketForm.typeBase));
    dispatch(setShowtimes(localShowtimes));
    const tempPayload = {
      ...eventInfo, // hoặc clone base info ở đây nếu cần
      timeStart: startUnix,
      timeEnd: endUnix,
      typeBase: ticketForm.typeBase,
      showtimes: [],
      zones: [],
    };

    if (ticketForm.typeBase === "none") {
      const mappedShowtimes = localShowtimes.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
        ticketPrice: Number(ticketPriceZone),
        ticketQuantity: Number(ticketQuantity),
      }));
      dispatch(resetZones());

      tempPayload.showtimes = mappedShowtimes;
      return tempPayload;
    }

    if (ticketForm.typeBase === "zone") {
      dispatch(resetZones());
      zones.forEach((zone) => dispatch(setZonesAction(zone)));
      tempPayload.showtimes = localShowtimes;
      tempPayload.zones = zones;
      return tempPayload;
    }

    if (ticketForm.typeBase === "seat") {
      dispatch(setZonesAction(zoneSeat));
      tempPayload.showtimes = localShowtimes;
      tempPayload.zones = zoneSeat;
      return tempPayload;
    }

    return tempPayload;
  };

  const handleLayoutSubmit = (data, layoutInfo) => {
    console.log("Dữ liệu nhận được từ ZoneSeatLayout:", data);
     console.log("Layout info:", layoutInfo);
  
    setZoneSeat(data);
    setSeatLayoutInfo(layoutInfo);
    setSeatLayoutError(""); 
  };

  const handleSubmit = async () => {
    const payload = await handleSaveZoneOrSeat();
    if (!payload) return;

    await submitEvent(payload); // Gửi API ngay với dữ liệu đã sẵn sàng
  };

  const submitEvent = async (payload) => {
    try {
      setAlertStatus("loading");
      setAlertMessage("Đang tạo sự kiện...");

      console.log("📦 Payload gửi đi:", JSON.stringify(payload, null, 2));
      const response = await eventApi.addEvent(payload);
      console.log("✅ API Response:", response.data);

      if (response.data?.status === true) {
        dispatch(resetEventInfo());
        dispatch(resetAddress());

        setAlertStatus("success");
        setAlertMessage("Tạo sự kiện thành công!");

        setTimeout(() => {
          navigate("/dashboard-organizer");
        }, 1000);
      }
    } catch (error) {
      console.error("Lỗi khi tạo sự kiện:", error);
      if (error.response) {
        console.error("Phản hồi từ server:", error.response.data);
      }

      setAlertStatus("error");
      setAlertMessage("Tạo sự kiện thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
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
                <FormControlLabel value="none" control={<Radio />} label="WorkShop" />
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
                      pop="money"
                      value={ticketPriceZone.toString()}
                      onChange={(e) => setTicketPriceZone(e.target.value)}
                      placeholder="Nhập giá vé"
                      error={Boolean(ticketPriceZoneError)}
                      helperText={ticketPriceZoneError}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextField
                      label="Số lượng vé"
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
                    Tạo suất diễn
                  </Typography>
                  {showtimeListError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, ml: 1 }}>
                      * Vui lòng tạo ít nhất một suất diễn.
                    </Typography>
                  )}

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <CustomTextField
                        label="Thời gian bắt đầu suất diễn"
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
                        label="Thời gian kết thúc suất diễn"
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
                          backgroundColor: "#5669FF",
                          color: "#fff",
                          border: "1px solid #5669FF", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#5669FF",
                            border: "1px solid #5669FF", // giữ nguyên border khi hover
                          },
                        }}
                      >
                        Tạo suất diễn
                      </Button>
                    </Grid>
                  </Grid>

                  {localShowtimes.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Danh sách suất diễn đã tạo:
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
                                aria-label="Xoá suất diễn"
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
                        pop="money"
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
                          backgroundColor: "#5669FF",
                          color: "#fff",
                          border: "1px solid #5669FF", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#5669FF",
                            border: "1px solid #5669FF", // giữ nguyên border khi hover
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
                    Tạo suất diễn
                  </Typography>
                  {showtimeListError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1, ml: 1 }}>
                      * Vui lòng tạo ít nhất một suất diễn.
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
                          backgroundColor: "#5669FF",
                          color: "#fff",
                          border: "1px solid #5669FF", // ✅ thêm vào trạng thái mặc định
                          boxSizing: "border-box",
                          "&:hover": {
                            backgroundColor: "#fff",
                            color: "#5669FF",
                            border: "1px solid #5669FF", // giữ nguyên border khi hover
                          },
                        }}
                      >
                        Tạo suất diễn
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Danh sách suất chiếu */}
                  {localShowtimes.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Danh sách suất diễn đã tạo:
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
                                aria-label="Xoá suất diễn"
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
                <Typography variant="h5">
                  Tạo sơ đồ ghế
                </Typography>
                {seatLayoutError && (
                <Typography variant="body2" color="error" sx={{ ml: 1, mb: 1 }}>
                  * {seatLayoutError}
                </Typography>
              )}
                {/* Thông tin khu vực */}
                <ZoneSeatLayout onSubmit={handleLayoutSubmit} />

                {/* Suất chiếu */}
                <Typography variant="h5" sx={{ mb: -2 }}>
                  Tạo suất diễn
                </Typography>
                {showtimeListError && (
                  <Typography variant="body2" color="error" sx={{ mt: -1, ml: 1, mb: -1 }}>
                    * Vui lòng tạo ít nhất một suất diễn.
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
                        backgroundColor: "#5669FF",
                        color: "#fff",
                        border: "1px solid #5669FF", // ✅ thêm vào trạng thái mặc định
                        boxSizing: "border-box",
                        "&:hover": {
                          backgroundColor: "#fff",
                          color: "#5669FF",
                          border: "1px solid #5669FF", // giữ nguyên border khi hover
                        },
                      }}
                    >
                      Tạo suất diễn
                    </Button>
                  </Grid>
                </Grid>
                {/* Danh sách suất chiếu */}
                {localShowtimes.length > 0 && (
                  <Box mt={3} sx={{ mt: -1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Danh sách suất diễn đã tạo:
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
                              aria-label="Xoá suất diễn"
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
            )}
          </Box>
        </Paper>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        {/* <Button
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
        </Button> */}

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#5669FF",
            color: "#fff",
            border: "1px solid #5669FF",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#5669FF",
            },
          }}
        >
          Gửi
        </Button>
        {/* <Button
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
        </Button> */}
        <Snackbar
          open={Boolean(alertStatus)}
          autoHideDuration={3000}
          onClose={() => setAlertStatus(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={
              alertStatus === "loading" ? "info" : alertStatus === "success" ? "success" : "error"
            }
            sx={{ width: "100%", display: "flex", alignItems: "center" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TicketDialog from "../components/TicketDialog";
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
  setDescription,
  setEventBanner,
  setEventImages,
  setEventLogo,
  setLatitude,
  setLongitude,
  setTags,
  setUserId,
} from "../../../../../redux/store/slices/eventInfoSlice";
export default function ScheduleSection() {
  const [performance, setPerformance] = useState({
    startTime: null,
    endTime: null,
    tickets: [],
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handleTimeChange = (field, value) => {
    setPerformance((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTicket = (ticket) => {
    setPerformance((prev) => ({
      ...prev,
      tickets: [...prev.tickets, ticket],
    }));
  };

  const [ticketForm, setTicketForm] = useState({ typeBase: "none" });
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [ticketPriceZone, setTicketPriceZone] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [price, setPrice] = useState("");
  const dispatch = useDispatch();
  const eventInfo = useSelector((state) => state.eventInfo);

  useEffect(() => {
    console.log("eventInfo đã cập nhật:", eventInfo);
    console.log("TimeStart: ", startTime);
  }, [eventInfo]);

  function toUnixTimestamp(datetimeString) {
    if (!datetimeString) return null;

    const timestamp = Date.parse(datetimeString); // hoặc new Date(datetimeString).getTime()
    return isNaN(timestamp) ? null : timestamp;
  }

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };
  const handleChangeTypeBase = (e) => {
    setTicketForm({ ...ticketForm, typeBase: e.target.value });
    // Reset zones mỗi khi đổi typeBase
    setZones([]);
  };

  // Hàm thêm zone mới vào danh sách zones
  const handleAddZone = () => {
    if (!zoneName || !ticketPriceZone || !ticketQuantity) {
      alert("Vui lòng điền đầy đủ thông tin khu vực!");
      return;
    }

    console.log("📋 Danh sách zones hiện tại:", zones);
    const newZone = {
      name: zoneName,
      showtimes: [
        {
          ticketPrice: Number(ticketPriceZone),
          ticketQuantity: Number(ticketQuantity),
          totalTicketCount: Number(ticketQuantity),
          price: Number(ticketPriceZone),
        },
      ],
    };

    setZones((prev) => [...prev, newZone]);

    // Reset form nhập zone
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

  const handleSaveZoneOrSeat = () => {
    if (ticketForm.typeBase === "none") {
      dispatch(setTypeBase(ticketForm.typeBase));
      dispatch(setTicketPrice(Number(price)));
      dispatch(setTicketQuantityAction(Number(ticketQuantity)));
    }
    if (ticketForm.typeBase === "zone") {
      dispatch(setTypeBase(ticketForm.typeBase));
      const newZones = zones.map((zone) => ({
        ...zone,
        showtimes: zone.showtimes.map((showtime) => ({
          ...showtime,
          startTime: toUnixTimestamp(startTime),
          endTime: toUnixTimestamp(endTime),
        })),
      }));

      console.log("✅ newZones đã thêm startTime và endTime:", newZones);
      console.log("time " + toUnixTimestamp(startTime) + "end " + toUnixTimestamp(endTime));
      // Ghi đè zone cũ bằng zone có thời gian mới
      setZones(newZones);
      dispatch(setZonesAction(newZones));
    }

    if (ticketForm.typeBase === "seat") {
      dispatch(setTypeBase(ticketForm.typeBase));
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
            startTime: toUnixTimestamp(startTime),
            endTime: toUnixTimestamp(endTime),
          },
        ],
      };

      setZones((prev) => {
        const filtered = prev.filter((z) => !z.layout?.seats);
        return [...filtered, newZone];
      });

      console.log("✅ Zone dạng ghế đã được cập nhật:", newZone);
      dispatch(setZonesAction(newZone));
    }

    dispatch(setTimeStart(toUnixTimestamp(startTime)));
    dispatch(setTimeEnd(toUnixTimestamp(endTime)));
  };

  const handleOpenTicketDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSubmitTicket = (ticketData) => {
    handleAddTicket(ticketData);
    handleCloseDialog();
  };

  const submitEvent = async () => {
    try {
      // Gửi lên API
      console.log("📦 Payload gửi đi:", JSON.stringify(eventInfo, null, 2));

      const response = await eventApi.addEvent(eventInfo);
      console.log("✅ API Response:", response.data);
    } catch (error) {
      console.error("❌ Lỗi khi tạo sự kiện:", error);
      if (error.response) {
        console.error("💥 Phản hồi từ server:", error.response.data);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <CustomTextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              value={startTime}
              onChange={handleStartTimeChange}
            />

            <CustomTextField
              label="Thời gian kết thúc"
              type="datetime-local"
              value={endTime}
              onChange={handleEndTimeChange}
            />
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
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <CustomTextField
                  label="Giá vé"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <CustomTextField
                  label="Tổng số lượng vé"
                  type="number"
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(e.target.value)}
                />
              </Box>
            )}

            {ticketForm.typeBase === "zone" && (
              <Box
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 2,
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Grid container spacing={3}>
                  {/* Tên địa điểm */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thêm khu vực
                    </Typography>
                    <CustomTextField
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Tên khu vực"
                      maxLength={80}
                      maxWidth="100%"
                    />
                  </Grid>
                </Grid>

                <CustomTextField
                  label="Giá vé"
                  type="number"
                  value={ticketPriceZone}
                  onChange={(e) => setTicketPriceZone(e.target.value)}
                />
                <CustomTextField
                  label="Tổng số lượng vé"
                  type="number"
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(e.target.value)}
                />

                <Button variant="contained" onClick={handleAddZone}>
                  Thêm khu vực
                </Button>

                <Box>
                  <Typography variant="subtitle1" mt={2}>
                    Danh sách khu vực đã thêm
                  </Typography>
                  {zones.length === 0 && (
                    <Typography color="textSecondary">Chưa có khu vực nào.</Typography>
                  )}
                  <ul>
                    {zones.map((zone, index) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box>
                          Khu vực: {zone.name} - Giá vé:{" "}
                          {zone.showtimes[0].ticketPrice.toLocaleString()} - Số lượng:{" "}
                          {zone.showtimes[0].ticketQuantity.toLocaleString()}
                        </Box>

                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveZone(index)}
                          sx={{ ml: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </ul>
                </Box>
              </Box>
            )}

            {ticketForm.typeBase === "seat" && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={5}>
                    <CustomTextField
                      label="Giá vé"
                      type="number"
                      value={ticketPriceZone}
                      onChange={(e) => setTicketPriceZone(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <CustomTextField
                      label="Tổng số lượng vé"
                      type="number"
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={5}>
                    <Typography variant="h6" gutterBottom>
                      Tên sự kiện
                    </Typography>
                    <CustomTextField
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Nhập tên khu vực"
                      maxLength={80}
                      maxWidth="100%"
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <CustomTextField
                      label="Giá ghế"
                      type="number"
                      value={seatPrice}
                      onChange={(e) => setSeatPrice(Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Tạo sơ đồ ghế
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={5}>
                    <CustomTextField
                      label="Số hàng"
                      type="number"
                      value={rows}
                      onChange={(e) => setRows(Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <CustomTextField
                      label="Số cột"
                      type="number"
                      value={cols}
                      onChange={(e) => setCols(Number(e.target.value))}
                    />
                  </Grid>
                </Grid>
                {/* Layout ghế */}
                <Box sx={{ mt: 4 }}>
                  {rows > 0 && cols > 0 ? (
                    <>
                      <Typography variant="h6" mb={2}>
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
                                  backgroundColor: isSelected ? "#33FFFF" : "lightgray",
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
                      <Button
                        variant="outlined"
                        onClick={handleToggleAllSeats}
                        sx={{ mt: 2, mr: 2 }}
                      >
                        {selectedSeats.length === rows * cols ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </Button>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Vui lòng nhập số hàng và cột hợp lệ
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* <Typography>Loại vé:</Typography>
            {performance.tickets.length === 0 ? (
              <Typography>Chưa có loại vé nào.</Typography>
            ) : (
              performance.tickets.map((ticket, index) => (
                <Box key={index} sx={{ border: "1px solid #ccc", padding: 1, mb: 1 }}>
                  <Typography>Tên vé: {ticket.name}</Typography>
                  <Typography>Giá: {ticket.price}</Typography>
                  <Typography>Loại: {ticket.typeBase || "Thường"}</Typography>
                </Box>
              ))
            )}

            <Button onClick={handleOpenTicketDialog} variant="contained">
              Tạo loại vé mới
            </Button> */}
          </Box>
        </Paper>

        <TicketDialog
          openDialog={openDialog}
          handleCloseDialog={handleCloseDialog}
          handleSubmitTicket={handleSubmitTicket}
        />
      </Box>
      <Button variant="contained" color="success" onClick={handleSaveZoneOrSeat}>
        Lưu khu vực
      </Button>
      <Button variant="contained" color="success" onClick={submitEvent}>
        Gửi
      </Button>
    </LocalizationProvider>
  );
}

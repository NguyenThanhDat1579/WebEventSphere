import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
} from "@mui/material";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // hoặc CloseIcon
import CustomTextField from "./CustomTextField";
function generateSeats(rows, cols, area, price) {
  const seats = [];
  const startCharCode = "A".charCodeAt(0);

  for (let row = 1; row <= rows; row++) {
    const rowLabel = String.fromCharCode(startCharCode + row - 1);
    for (let col = 1; col <= cols; col++) {
      const seatId = `${rowLabel}${col}`;
      seats.push({
        seatId,
        row,
        col,
        label: seatId,
        price,
        area,
      });
    }
  }

  return seats;
}

export default function TicketDialog({ openDialog, handleCloseDialog, handleSubmitTicket }) {
  const [ticketName, setTicketName] = useState("");

  const [ticketForm, setTicketForm] = useState({ typeBase: "none" });
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [area, setArea] = useState("VIP");
  const [seatPrice, setSeatPrice] = useState(300000);

  // State quản lý danh sách zones nhập cho typeBase === "zone"
  const [zones, setZones] = useState([]);

  // State form zone mới
  const [zoneName, setZoneName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [ticketPriceZone, setTicketPriceZone] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleChangeTicketForm = (e) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
  };

  const handleChangeTypeBase = (e) => {
    setTicketForm({ ...ticketForm, typeBase: e.target.value });
    // Reset zones mỗi khi đổi typeBase
    setZones([]);
  };

  const handleRemoveZone = (indexToRemove) => {
    const updatedZones = zones.filter((_, idx) => idx !== indexToRemove);
    setZones(updatedZones);
  };

  // Hàm thêm zone mới vào danh sách zones
  const handleAddZone = () => {
    if (!zoneName || !startTime || !endTime || !ticketPriceZone || !ticketQuantity || !price) {
      alert("Vui lòng điền đầy đủ thông tin khu vực!");
      return;
    }

    const newZone = {
      name: zoneName,
      showtimes: [
        {
          startTime: new Date(startTime).getTime() / 1000, // chuyển sang timestamp giây
          endTime: new Date(endTime).getTime() / 1000,
          ticketPrice: Number(ticketPriceZone),
          ticketQuantity: Number(ticketQuantity),
          totalTicketCount: Number(ticketQuantity),
          price: Number(price),
        },
      ],
    };

    setZones((prev) => [...prev, newZone]);

    // Reset form nhập zone
    setZoneName("");
    setStartTime("");
    setEndTime("");
    setTicketPriceZone("");
    setTicketQuantity("");
    setPrice("");
  };

  const handleSubmit = () => {
    let formData = { ...ticketForm };

    if (ticketForm.typeBase === "zone") {
      formData.zones = zones;
    } else if (ticketForm.typeBase === "seat") {
      formData.zones = [
        {
          name: "Khu VIP",
          layout: {
            rows,
            cols,
            seats: generateSeats(rows, cols, area, seatPrice),
          },
          showtimes: [
            {
              startTime: 1719100000,
              endTime: 1719103600,
            },
            {
              startTime: 1719300000,
              endTime: 1719105600,
            },
          ],
        },
      ];
    }

    handleSubmitTicket(formData);
    handleCloseDialog();

    // Reset form và zones
    setTicketForm({ typeBase: "none" });
    setZones([]);
  };

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="m" fullWidth>
      <DialogTitle>Tạo loại vé</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" gutterBottom>
              Tên sự kiện
            </Typography>

            <CustomTextField
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              placeholder="Nhập tên sự kiện"
              maxLength={50}
              maxWidth="100%"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Thời gian bắt đầu bán vé
            </Typography>
            <CustomTextField
              type="datetime-local"
              value={ticketForm.startSell || ""}
              onChange={handleChangeTicketForm}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Thời gian kết thúc bán vé
            </Typography>
            <CustomTextField
              type="datetime-local"
              value={ticketForm.endSell || ""}
              onChange={handleChangeTicketForm}
            />
          </Grid>

          {/* <TextField
            label="Số lượng tối thiểu / đơn"
            name="minPerOrder"
            type="number"
            value={ticketForm.minPerOrder || ""}
            onChange={handleChangeTicketForm}
          />
          <TextField
            label="Số lượng tối đa / đơn"
            name="maxPerOrder"
            type="number"
            value={ticketForm.maxPerOrder || ""}
            onChange={handleChangeTicketForm}
          /> */}
          <Grid item xs={12} sm={7}>
            <Typography variant="h6" gutterBottom>
              Thông tin vé
            </Typography>
            <TextField
              placeholder="Thông tin vé"
              multiline
              rows={5}
              fullWidth
              value={ticketForm.description || ""}
              onChange={handleChangeTicketForm}
            />
          </Grid>
        </Grid>
        <Box>
          <Typography variant="h6" gutterBottom>
            Hình thức loại vé
          </Typography>
          <RadioGroup row value={ticketForm.typeBase} onChange={handleChangeTypeBase}>
            <FormControlLabel value="none" control={<Radio />} label="Thường" />
            <FormControlLabel value="zone" control={<Radio />} label="Khu vực" />
            <FormControlLabel value="seat" control={<Radio />} label="Ghế" />
          </RadioGroup>
        </Box>

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
            <Typography variant="h6">Thêm khu vực</Typography>
            <TextField
              label="Tên khu vực"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
            />
            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <TextField
              label="Thời gian kết thúc"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <TextField
              label="Giá vé (VNĐ)"
              type="number"
              value={ticketPriceZone}
              onChange={(e) => setTicketPriceZone(e.target.value)}
            />
            <TextField
              label="Số lượng vé"
              type="number"
              value={ticketQuantity}
              onChange={(e) => setTicketQuantity(e.target.value)}
            />
            <TextField
              label="Giá"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
                      {zone.name} - {new Date(zone.showtimes[0].startTime * 1000).toLocaleString()}{" "}
                      đến {new Date(zone.showtimes[0].endTime * 1000).toLocaleString()} - Giá vé:{" "}
                      {zone.showtimes[0].ticketPrice.toLocaleString()} - Số lượng:{" "}
                      {zone.showtimes[0].ticketQuantity.toLocaleString()} - Giá:{" "}
                      {zone.showtimes[0].price.toLocaleString()}
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
            <TextField
              label="Số hàng"
              type="number"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
            <TextField
              label="Số cột"
              type="number"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
            <TextField label="Khu vực" value={area} onChange={(e) => setArea(e.target.value)} />
            <TextField
              label="Giá ghế (VNĐ)"
              type="number"
              value={seatPrice}
              onChange={(e) => setSeatPrice(Number(e.target.value))}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseDialog}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

TicketDialog.propTypes = {
  openDialog: PropTypes.bool.isRequired,
  handleCloseDialog: PropTypes.func.isRequired,
  handleSubmitTicket: PropTypes.func.isRequired,
};

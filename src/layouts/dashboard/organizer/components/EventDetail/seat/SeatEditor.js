// File: SeatEditor.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SelectMenu from "layouts/dashboard/organizer/OrganizerCreateNewEvent/components/SelectMenu";
import CustomTextField from "layouts/dashboard/organizer/OrganizerCreateNewEvent/components/CustomTextField";

const defaultZones = [
  {
    name: "Lối đi",
    area: "none",
    price: 0,
    color: "transparent",
  },
];

const SeatEditor = ({ seatLayouts, isEditing, onChange }) => {
  const [layout, setLayout] = useState(seatLayouts?.[0]?.layout || { rows: 0, cols: 0, seats: [] });
  const [customZones, setCustomZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(defaultZones[0]);
  const [zoneName, setZoneName] = useState("");
  const [zonePrice, setZonePrice] = useState(0);
  const [zoneColor, setZoneColor] = useState("#000");
  const [showLabels, setShowLabels] = useState(true);
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);

  const colorOptions = [
  { label: "Xanh tím", value: "#7C89FF" },
  { label: "Tím nhạt", value: "#c9b6f3" },
  { label: "Đỏ", value: "#f44336" },
  { label: "Xanh biển", value: "#2196f3" },
  { label: "Xanh lá", value: "#4caf50" },
  { label: "Cam", value: "#ff9800" },
  { label: "Tím", value: "#9c27b0" },
];


  // Đồng bộ khi props thay đổi
  useEffect(() => {
    if (seatLayouts?.[0]?.layout) {
      setLayout(seatLayouts[0].layout);
    }
  }, [seatLayouts]);

  // Lấy danh sách khu vực từ dữ liệu ghế ban đầu
  useEffect(() => {
    const extractedZones = [];
    const seats = seatLayouts?.[0]?.layout?.seats || [];
    seats.forEach((s) => {
      const exists = extractedZones.find((z) => z.area === s.area);
      if (!exists && s.area !== "none") {
        extractedZones.push({
          name: s.area,
          area: s.area,
          price: s.price,
          color: s.color,
        });
      }
    });
    setCustomZones(extractedZones);
  }, [seatLayouts]);

  const combinedZones = [...defaultZones, ...customZones];

  const handleSeatClick = (row, col) => {
  if (!isEditingMatrix) return;

  const index = layout.seats.findIndex((s) => s.row === row && s.col === col);
  const updatedSeats = [...layout.seats];

  if (index !== -1) {
    updatedSeats.splice(index, 1);
  } else {
    const newSeat =
      selectedZone.area === "none"
        ? {
            row,
            col,
            seatId: "none",
            label: "none",
            area: "none",
            price: 0,
            color: "none",
          }
        : {
            row,
            col,
            seatId: `${String.fromCharCode(64 + row)}${col}`,
            label: `${String.fromCharCode(64 + row)}${col}`,
            area: selectedZone.area,
            price: selectedZone.price,
            color: selectedZone.color,
          };

    updatedSeats.push(newSeat);
  }

  setLayout({ ...layout, seats: updatedSeats });
};

  const renderSeat = (row, col) => {
    const seat = layout.seats.find((s) => s.row === row && s.col === col);
    const isNone = seat?.seatId === "none";

    return (
      <Box
        key={`r${row}c${col}`}
        onClick={() => handleSeatClick(row, col)}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: isNone ? "transparent" : seat?.color || "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          m: 0.5,
          cursor: "pointer",
          border: "1px solid #999",
          userSelect: "none",
          fontSize: "0.75rem",
          color: !seat || isNone || !showLabels ? "transparent" : "#fff",
        }}
      >
        {seat && !isNone && showLabels ? seat.label : ""}
      </Box>
    );
  };

  const handleRowColChange = (type, value) => {
    const num = Number(value);
    if (!num || num < 1) return;

    const newLayout = { ...layout, [type]: num };
    setLayout({
      ...newLayout,
      seats: layout.seats.filter(
        (seat) => seat.row <= newLayout.rows && seat.col <= newLayout.cols
      ),
    });
  };

  const handleAddZone = () => {
    if (!zoneName || !zoneColor || !zonePrice) return;
    const newZone = {
      name: zoneName,
      area: zoneName,
      price: parseInt(zonePrice),
      color: zoneColor,
    };
    setCustomZones((prev) => [...prev, newZone]);
    setZoneName("");
    setZonePrice(0);
    setZoneColor("#000");
    setSelectedZone(newZone);
  };

  const handleDeleteZone = (zoneNameToDelete) => {
    const updatedZones = customZones.filter((z) => z.name !== zoneNameToDelete);
    setCustomZones(updatedZones);
    if (selectedZone.name === zoneNameToDelete) {
      setSelectedZone(defaultZones[0]);
    }
    const updatedSeats = layout.seats.filter((s) => s.area !== zoneNameToDelete);
    setLayout({ ...layout, seats: updatedSeats });
  };

  const handleCancel = () => {
    setLayout(seatLayouts?.[0]?.layout || { rows: 0, cols: 0, seats: [] });
    setShowLabels(true);
  };

  const handleSave = () => {
  const { rows, cols, seats } = layout;
  const seatMap = new Map(seats.map((s) => [`${s.row}-${s.col}`, s]));
  const fullSeats = [];

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const key = `${r}-${c}`;
      let seat = seatMap.get(key);

      if (!seat) {
        seat = {
          row: r,
          col: c,
          seatId: "none",
          label: "none",
          area: "none",
          price: 0,
          color: "none",
        };
      }

      const { _id, status, ...cleanSeat } = seat;
      fullSeats.push(cleanSeat);
    }
  }

  const finalZone = [
    {
      name: "Sơ đồ ghế",
      layout: {
        rows,
        cols,
        seats: fullSeats,
      },
    },
  ];

  onChange(finalZone);
  setShowLabels(true);
};

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Chỉnh sửa sơ đồ ghế
      </Typography>

      {isEditingMatrix && (
        <Stack direction="row" spacing={2} mb={2}>
          <CustomTextField
            label="Số hàng"
            type="number"
            size="small"
            value={layout.rows}
            onChange={(e) => handleRowColChange("rows", e.target.value)}
          />
          <CustomTextField
            label="Số cột"
            type="number"
            size="small"
            value={layout.cols}
            onChange={(e) => handleRowColChange("cols", e.target.value)}
          />
        </Stack>
      )}

      {isEditingMatrix && (
         <>
          <Typography fontWeight={600} fontSize={14} mb={1}>
            Tạo khu vực mới
          </Typography>
         <Grid container spacing={2} mb={2} alignItems="flex-end">
            <Grid item xs={12} sm={4} md={3}>
              <CustomTextField
                label="Tên khu vực"
                size="small"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <CustomTextField
                label="Giá vé"
                size="small"
                type="number"
                pop="money"
                value={zonePrice}
                onChange={(e) => setZonePrice(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
              <SelectMenu
                label="Màu khu vực"
                value={zoneColor}
                onChange={(val) => setZoneColor(val)}
                options={colorOptions}
                renderOption={(item) =>
                  item ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 0.5,
                          bgcolor: item.value,
                          border: "1px solid #ccc",
                        }}
                      />
                      <Typography variant="body2">{item.label}</Typography>
                    </Box>
                  ) : null
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" onClick={handleAddZone}  sx={{
                mt: 2,
                backgroundColor: "#5669FF",
                border:  "1px solid #5669FF",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                  borderColor: "#5669FF",
                },}} >
                Thêm
              </Button>
            </Grid>
          </Grid>
      </>
      )}

      <Typography fontWeight={600} fontSize={14} gutterBottom>
        Danh sách khu vực:
      </Typography>

      <Box display="flex" sx={{ overflowX: "auto", pr: 2, mb: 2 }}>
        {combinedZones.map((zone, index) => (
         <Paper
            key={index}
            sx={{
              position: "relative",
              p: 1,
              px: 2,
              borderRadius: 2,
              backgroundColor:
                selectedZone?.name === zone.name
                  ? zone.color
                  : `${zone.color}B3`,
              color: zone.name === "Lối đi" ? "#000" : "#fff", // ✅ text đen nếu là Lối đi
              border: zone.name === "Lối đi" ? "1px dashed #999" : "none", // ✅ border cho Lối đi
              cursor: "pointer",
              minWidth: 230,
              mr: 2,
              flexShrink: 0,
              transition: "0.3s",
              "&:hover": {
                boxShadow: 4,
              },
            }}
            onClick={() => setSelectedZone(zone)}
          >
            {/* ❌ Không hiện nút xoá nếu là Lối đi */}
            {zone.name !== "Lối đi" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  cursor: "pointer",
                  zIndex: 2,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteZone(zone.name);
                }}
              >
                <CloseIcon sx={{ fontSize: 18, color: "#fff" }} />
              </Box>
            )}

            <Typography fontWeight={600} fontSize={16}>
              Khu vực ghế - {zone.name}
            </Typography>
            <Typography fontSize={15}>
              Giá:{" "}
              {zone.price > 0
                ? zone.price.toLocaleString("vi-VN") + "đ"
                : "Miễn phí"}
            </Typography>
          </Paper>

        ))}
      </Box>

      <Box display="inline-block" p={2} sx={{ border: "1px dashed #aaa", backgroundColor: "#fafafa" }}>
        {[...Array(layout.rows)].map((_, rowIndex) => (
          <Box key={rowIndex} display="flex">
            {[...Array(layout.cols)].map((_, colIndex) =>
              renderSeat(rowIndex + 1, colIndex + 1)
            )}
          </Box>
        ))}
      </Box>

      <Stack direction="row" spacing={2} mt={2}>
        {!isEditingMatrix ? (
          <>
            <Button
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: "#5669FF",
                border:  "1px solid #5669FF",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                  borderColor: "#5669FF",
                },
            }}
               onClick={() => {
              setIsEditingMatrix(true);
              setShowLabels(false); // 🔄 Ẩn label khi bắt đầu chỉnh sửa
            }}
                    
            >
              Thay đổi
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              color="success"
              sx={{
                mt: 2,
                backgroundColor: "#5669FF",
                border:  "1px solid #5669FF",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                  borderColor: "#5669FF",
                },}}
              
              onClick={() => {
                handleSave();
                setIsEditingMatrix(false);
                 setShowLabels(true);
              }}
            >
              Lưu thay đổi
            </Button>
            <Button
              variant="outlined"
                sx={{
                mt: 2,
                backgroundColor: "#fff",
                border:  "1px solid #5669FF",
                color: "#5669FF",
                "&:hover": {
                  backgroundColor: "#5669FF",
                  color: "#fff",
                  borderColor: "#5669FF",
                },}}
              onClick={() => {
                handleCancel();
                setIsEditingMatrix(false);
                 setShowLabels(true);
              }}
            >
              Hủy thay đổi
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

SeatEditor.propTypes = {
  seatLayouts: PropTypes.array.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SeatEditor;

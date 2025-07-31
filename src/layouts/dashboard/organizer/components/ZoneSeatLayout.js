import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Typography, MenuItem, Paper, Avatar, Stack, Grid } from "@mui/material";
import CustomTextField from "../OrganizerCreateNewEvent/components/CustomTextField";
import SelectMenu from "../OrganizerCreateNewEvent/components/SelectMenu";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayIcon from "@mui/icons-material/Replay";
import { IconButton, Tooltip } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

const colorOptions = [
  { label: "Xanh tím", value: "#7C89FF" },
  { label: "Tím nhạt", value: "#c9b6f3" },
  { label: "Đỏ", value: "#f44336" },
  { label: "Xanh biển", value: "#2196f3" },
  { label: "Xanh lá", value: "#4caf50" },
  { label: "Cam", value: "#ff9800" },
  { label: "Tím", value: "#9c27b0" },
];
const seatSize = 30;
const seatMargin = 0.5 * 2;
const seatTotal = seatSize + seatMargin;



const ZoneSeatLayout = ({ onSubmit }) => {
  const [zones, setZones] = useState([]);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrix, setMatrix] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [price, setPrice] = useState(0);
  const [color, setColor] = useState(colorOptions[0].value);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const isDrawing = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const panRef = useRef({
    dragging: false,
    originX: 0,
    originY: 0,
  });

  const handleMouseDownPan = (e) => {
    if (selectedZone) return;

    panRef.current.dragging = true;
    panRef.current.originX = e.clientX;
    panRef.current.originY = e.clientY;
    panRef.current.startX = pan.x;
    panRef.current.startY = pan.y;
  };

  const handleMouseMovePan = (e) => {
    if (!panRef.current.dragging) return;
    const dx = e.clientX - panRef.current.originX;
    const dy = e.clientY - panRef.current.originY;
    setPan({
      x: panRef.current.startX + dx,
      y: panRef.current.startY + dy,
    });
  };

  const handleMouseUpPan = () => {
    panRef.current.dragging = false;
  };

  const handleWheelZoom = (e) => {
    e.preventDefault(); // ✅ Ngăn cuộn trang khi zoom
    const delta = e.deltaY;

    const newZoom = Math.min(3, Math.max(0.5, zoom - delta * 0.001));

    // ✅ Zoom tại vị trí chuột đang đứng
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const scale = newZoom / zoom;
    const newPanX = offsetX - scale * (offsetX - pan.x);
    const newPanY = offsetY - scale * (offsetY - pan.y);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleWheel = (e) => {
        e.preventDefault();
        handleWheelZoom(e);
      };

      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, [zoom, pan]);

  const scrollRef = useRef();
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons(); // kiểm tra ban đầu

    const handleScroll = () => updateScrollButtons();

    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [zones]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleAddZone = () => {
    if (!zoneName || !price || !color) return;
    const newZone = { name: zoneName, price: parseInt(price), color };
    setZones([...zones, newZone]);
    setZoneName("");
    setPrice(0);
    setColor(colorOptions[0].value);
  };

  useEffect(() => {
    if (rows > 0 && cols > 0) {
      const newMatrix = Array.from({ length: rows }, (_, rowIdx) =>
        Array.from({ length: cols }, (_, colIdx) => ({
          row: rowIdx + 1,
          col: colIdx + 1,
          selected: false,
          seatId: "none",
          label: "none",
          area: "none",
          price: 0,
          color: "none",
        }))
      );
      setMatrix(newMatrix);
    }
  }, [rows, cols]);

  // Dùng khi click chuột
  const toggleCellByClick = (rowIdx, colIdx) => {
    if (!selectedZone || isFinalized) return;
    const newMatrix = [...matrix];
    const cell = newMatrix[rowIdx][colIdx];

    if (cell.selected && cell.area === selectedZone.name) {
      // Cho phép XÓA khi nhấp
      cell.selected = false;
      cell.label = "none";
      cell.seatId = "none";
      cell.area = "none";
      cell.price = 0;
      cell.color = "none";
    } else {
      // TÔ mới
      cell.selected = true;
      cell.area = selectedZone.name;
      cell.price = selectedZone.price;
      cell.color = selectedZone.color;
    }

    setMatrix(newMatrix);
  };

  // Dùng khi rê chuột
  const toggleCellByDrag = (rowIdx, colIdx) => {
    if (!selectedZone || isFinalized) return;
    const newMatrix = [...matrix];
    const cell = newMatrix[rowIdx][colIdx];

    const isSameZone =
      cell.selected && cell.area === selectedZone.name && cell.color === selectedZone.color;

    if (isSameZone) return; // Bỏ qua nếu giống zone đang chọn

    // TÔ mới
    cell.selected = true;
    cell.area = selectedZone.name;
    cell.price = selectedZone.price;
    cell.color = selectedZone.color;

    setMatrix(newMatrix);
  };

  const handleDeleteZone = (zoneNameToDelete) => {
    // Xóa zone khỏi danh sách
    const updatedZones = zones.filter((z) => z.name !== zoneNameToDelete);
    setZones(updatedZones);

    // Xóa các ô đã chọn thuộc zone đó khỏi ma trận
    const newMatrix = matrix.map((row) =>
      row.map((cell) => {
        if (cell.area === zoneNameToDelete) {
          return {
            ...cell,
            selected: false,
            seatId: "none",
            label: "none",
            area: "none",
            price: "none",
            color: "none",
          };
        }
        return cell;
      })
    );

    setMatrix(newMatrix);

    // Nếu zone đang chọn bị xóa thì bỏ chọn
    if (selectedZone?.name === zoneNameToDelete) {
      setSelectedZone(null);
    }
  };

  const handleMouseDown = (rowIdx, colIdx) => {
    isDrawing.current = true;
    toggleCell(rowIdx, colIdx);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseEnter = (rowIdx, colIdx) => {
    if (isDrawing.current) {
      toggleCell(rowIdx, colIdx);
    }
  };

  const handleGenerateSeats = () => {
    if (isFinalized) {
      setIsFinalized(false);
      return;
    }

    const rowLabel = (index) => String.fromCharCode(65 + index);
    const counter = {};

    const newMatrix = matrix.map((row, rowIdx) => {
      const labelRow = rowLabel(rowIdx);
      counter[labelRow] = 1;

      return row.map((cell) => {
        if (cell.selected && cell.area !== "none") {
          const label = `${labelRow}${counter[labelRow]++}`;
          return {
            ...cell,
            label,
            seatId: label,
          };
        }
        return cell;
      });
    });

    const allSeats = newMatrix.flat().map(({ selected, ...rest }) => rest);

    const result = [
      {
        name: "Sơ đồ ghế",
        layout: {
          rows,
          cols,
          seats: allSeats,
        },
      },
    ];

    console.log("\u2705 Dữ liệu ghế đã lưu:", JSON.stringify(result, null, 2));
    setMatrix(newMatrix);
    setIsFinalized(true);

    if (typeof onSubmit === "function") {
      onSubmit(result); // 👈 gửi dữ liệu lên component cha
    }
  };

  const handleSelectZone = (zone) => {
    if (selectedZone?.name === zone.name) {
      setSelectedZone(null);
    } else {
      setSelectedZone(zone);
    }
  };
  return (
    <Box onMouseUp={handleMouseUp}>
      {/* 1. Tiêu đề */}
      <Typography variant="h5" mb={2}>
        Tạo sơ đồ ghế
      </Typography>

      {/* 2. Form nhập thông tin khu vực */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <CustomTextField
            label="Tên khu vực"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={2}>
          <CustomTextField
            label="Giá vé"
            type="number"
            pop="money"
            value={price.toString()}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box>
            <Typography variant="h6" mb={1}>
              Màu ghế
            </Typography>
            <SelectMenu
              label="Màu khu vực"
              value={color}
              onChange={(val) => setColor(val)}
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
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box mt={{ xs: 2, sm: 4 }}>
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
              Tạo khu vực ghế
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* 4. Nhập số dòng / cột */}
      <Grid container spacing={2} alignItems="center" mt={3} mb={3}>
        {/* Số dòng */}
        <Grid item xs={12} sm={2.5}>
          <CustomTextField
            label="Số dòng"
            type="number"
            value={rows.toString()}
           onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 0) setRows(value);
            }}
            disabled={isFinalized}
          />
        </Grid>

        {/* Số cột */}
        <Grid item xs={12} sm={2.5}>
          <CustomTextField
            label="Số cột"
            type="number"
            value={cols.toString()}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 0) setCols(value);
            }}
            disabled={isFinalized}
          />
        </Grid>

        {/* Zoom In */}
        <Grid item xs={0.6} sm={0.6} mt={4}>
          <Tooltip title="Phóng to">
            <IconButton
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
              sx={{
                border: "1px solid #1976D2",
                color: "#1976D2",
                width: "100%",
                height: 40,
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        {/* Reset */}
        <Grid item xs={0.6} sm={0.6} mt={4}>
          <Tooltip title="Reset thu phóng">
            <IconButton
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              sx={{
                border: "1px solid #1976D2",
                color: "#1976D2",
                width: "100%",
                height: 40,
              }}
            >
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        {/* Zoom Out */}
        <Grid item xs={0.6} sm={0.6} mt={4}>
          <Tooltip title="Thu nhỏ">
            <IconButton
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}
              sx={{
                border: "1px solid #1976D2",
                color: "#1976D2",
                width: "100%",
                height: 40,
              }}
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      {/* 3. Danh sách khu vực đã tạo */}
      <Box mt={3} mb={2}>
        <Typography variant="h6" mb={1}>
          Danh sách khu vực
        </Typography>

        <Box sx={{ position: "relative" }}>
          {/* Nút cuộn trái */}
          {showLeft && (
            <IconButton
              size="small"
              onClick={() => scrollByAmount(-200)}
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                transform: "translateY(-50%)",
                zIndex: 2,
                backgroundColor: "#fff",
                border: "1px solid #1976D2",
                color: "#1976D2",
                "&:hover": {
                  backgroundColor: "#1976D2",
                  color: "#fff",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}

          {/* Vùng scroll chính */}
          <Box
            ref={scrollRef}
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              px: 4,
              scrollbarWidth: "none", // Firefox
              "&::-webkit-scrollbar": { display: "none" }, // Chrome

              p: 1,
            }}
          >
            <Box display="flex" sx={{ pr: 2, whiteSpace: "nowrap" }}>
              {zones.map((zone, index) => (
                <Paper
                  key={index}
                  sx={{
                    position: "relative",
                    p: 1,
                    px: 2,
                    borderRadius: 2,
                    backgroundColor:
                      selectedZone?.name === zone.name ? zone.color : `${zone.color}B3`,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "0.2s",
                    minWidth: 230,
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  {/* nút xoá */}
                  <Box
                    sx={{ position: "absolute", top: 4, right: 4, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteZone(zone.name);
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18, color: "#fff" }} />
                  </Box>

                  <Box onClick={() => handleSelectZone(zone)}>
                    <Typography fontWeight="600" fontSize={16}>
                      Khu vực ghế - {zone.name}
                    </Typography>
                    <Typography fontSize={16}>
                      Giá: {new Intl.NumberFormat("vi-VN").format(zone.price)}đ
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Nút cuộn phải */}
          {showRight && (
            <IconButton
              size="small"
              onClick={() => scrollByAmount(200)}
              sx={{
                position: "absolute",
                top: "50%",
                right: 0,
                transform: "translateY(-50%)",
                zIndex: 2,
                backgroundColor: "#fff",
                border: "1px solid #1976D2",
                color: "#1976D2",
                "&:hover": {
                  backgroundColor: "#1976D2",
                  color: "#fff",
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* 5. Ma trận ghế */}
   <Box
  ref={containerRef}
  onWheel={handleWheelZoom}
  onMouseDown={handleMouseDownPan}
  onMouseMove={handleMouseMovePan}
  onMouseUp={handleMouseUpPan}
  onMouseLeave={handleMouseUpPan}
  sx={{
    width: "100%",
    height: 500,
    overflow: "hidden",
    border: "1px solid #ddd",
    position: "relative",
    cursor: selectedZone ? "default" : panRef.current?.dragging ? "grabbing" : "grab",
  }}
>
  <Box
    sx={{
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "top left",
      display: "flex",
      flexDirection: "column",
      alignItems: "center", // 👉 để canh giữa sân khấu theo chiều ngang
    }}
  >
    {/* ✅ Sân khấu */}
  <Box
  sx={{
    width: `${cols * seatTotal}px`,
    height: 40,
    backgroundColor: "#333",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    mb: 1,
  }}
>
  <Typography
    fontWeight="bold"
    sx={{
      fontSize: `${Math.max(0.6, Math.min(1.5, cols * 0.08))}rem`,
      textAlign: "center",
      whiteSpace: "nowrap",
    }}
  >
    SÂN KHẤU
  </Typography>
</Box>


    {/* ✅ Ma trận ghế */}
    {matrix.map((row, rowIdx) => (
      <Box key={rowIdx} display="flex">
        {row.map((cell, colIdx) => (
          <Paper
            key={colIdx}
            onMouseDown={() => {
              isDrawing.current = true;
              toggleCellByClick(rowIdx, colIdx);
            }}
            onMouseEnter={() => {
              if (isDrawing.current) {
                toggleCellByDrag(rowIdx, colIdx);
              }
            }}
            sx={{
              width: seatTotal,
              height: seatTotal,
              margin: 0.5,
              backgroundColor:
                cell.selected && cell.area !== "none"
                  ? zones.find((z) => z.name === cell.area)?.color || "#ccc"
                  : "#e0e0e0",
              cursor: isFinalized ? "default" : "pointer",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "600",
              fontSize: "0.85rem",
              userSelect: "none",
            }}
          >
            {cell.label !== "none" ? cell.label : ""}
          </Paper>
        ))}
      </Box>
    ))}
  </Box>
</Box>

      {/* 6. Nút hoàn thành */}
      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="outlined"
          onClick={() => {
            const clearedMatrix = matrix.map((row) =>
              row.map((cell) => ({
                ...cell,
                selected: false,
                seatId: "none",
                label: "none",
                area: "none",
                price: 0,
                color: "none",
              }))
            );
            setMatrix(clearedMatrix);
          }}
          disabled={isFinalized}
          sx={{
            color: "#5669FF",
            borderColor: "#5669FF",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#5669FF",
              color: "#fff",
            },
          }}
        >
          Bỏ chọn tất cả
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#5669FF",
            color: "#fff",
            border: "1px solid #5669FF",
            boxSizing: "border-box",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#5669FF",
              border: "1px solid #5669FF",
            },
          }}
          onClick={handleGenerateSeats}
          disabled={!zones.length || !rows || !cols}
        >
          {isFinalized ? "Sửa" : "Hoàn thành"}
        </Button>
      </Box>
    </Box>
  );
};

ZoneSeatLayout.propTypes = {
  onSubmit: PropTypes.func,
};

export default ZoneSeatLayout;

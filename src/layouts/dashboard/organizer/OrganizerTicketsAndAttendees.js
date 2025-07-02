import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  InputLabel,
  FormControl,
  Stack,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DeleteIcon from "@mui/icons-material/Delete";
const colorOptions = [
  "#f44336", // Đỏ
  "#2196f3", // Xanh dương
  "#4caf50", // Xanh lá
  "#ff9800", // Cam
  "#9c27b0", // Tím
];

function OrganizerTicketsAndAttendees() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrix, setMatrix] = useState([]);
  const [submittedMatrix, setSubmittedMatrix] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [newZone, setNewZone] = useState({
    name: "",
    price: "",
    color: colorOptions[0],
  });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMode, setDragMode] = useState(null); // "select" | "deselect"
  // Tạo lại ma trận khi thay đổi số dòng/cột
  useEffect(() => {
    if (rows > 0 && cols > 0) {
      const newMatrix = Array.from({ length: rows }, (_, rowIdx) =>
        Array.from({ length: cols }, (_, colIdx) => ({
          selected: false,
          row: rowIdx + 1,
          col: colIdx + 1,
          zone: null,
        }))
      );
      setMatrix(newMatrix);
      setSubmittedMatrix([]);
    }
  }, [rows, cols]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setDragMode(null);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Khi bấm Hoàn thành
  const handleSubmit = () => {
    const rowCounters = {};
    const resultMatrix = matrix.map((row, rowIdx) => {
      const rowLabel = String.fromCharCode(65 + rowIdx);
      rowCounters[rowLabel] = 1;

      return row.map((cell) => {
        if (cell.selected && cell.zone) {
          const label = `${rowLabel}${rowCounters[rowLabel]++}`;
          return {
            seatId: label,
            label,
            row: cell.row,
            col: cell.col,
            area: cell.zone.name,
            price: cell.zone.price,
            // color: cell.zone.color,
            // selected: true,
          };
        } else {
          return {
            seatId: "none",
            label: "none",
            row: cell.row,
            col: cell.col,
            area: "none",
            price: 0,
            // color: "#e0e0e0",
            // selected: false,
          };
        }
      });
    });

    setSubmittedMatrix(resultMatrix);
    console.log("✅ Dữ liệu ghế đã lưu:\n", JSON.stringify(resultMatrix.flat(), null, 2));
  };

  const handleMouseDown = (row, col) => {
    const cell = matrix[row][col];
    const newMatrix = [...matrix];

    if (cell.selected) {
      // Bỏ chọn
      newMatrix[row][col] = { ...cell, selected: false, zone: null };
      setDragMode("deselect");
    } else if (selectedZone) {
      // Chọn
      newMatrix[row][col] = { ...cell, selected: true, zone: selectedZone };
      setDragMode("select");
    }

    setMatrix(newMatrix);
    setIsMouseDown(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!isMouseDown) return;

    const newMatrix = [...matrix];
    const cell = newMatrix[row][col];

    if (dragMode === "select" && !cell.selected && selectedZone) {
      newMatrix[row][col] = {
        ...cell,
        selected: true,
        zone: selectedZone,
      };
    }

    if (dragMode === "deselect" && cell.selected) {
      newMatrix[row][col] = {
        ...cell,
        selected: false,
        zone: null,
      };
    }

    setMatrix(newMatrix);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setDragMode(null);
  };

  const handleAddZone = () => {
    if (!newZone.name || !newZone.price) return;
    setZones([...zones, newZone]);
    setNewZone({ name: "", price: "", color: colorOptions[0] });
  };

  const handleDeleteZone = (zoneName) => {
    setZones(zones.filter((z) => z.name !== zoneName));
    if (selectedZone?.name === zoneName) setSelectedZone(null);
  };

  return (
    <DashboardLayout>
      {/* <Box p={3} sx={{ position: "relative" }}>
        <Typography variant="h4" gutterBottom>
          🎫 Quản lý vé
        </Typography>


        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">🗂️ Chọn sự kiện</MenuItem>
            <MenuItem value="event1">GAMA Music Festival</MenuItem>
            <MenuItem value="event2">Workshop Canva</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<AddIcon />}>
            Thêm loại vé
          </Button>
        </Box>

     
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loại vé</TableCell>
                <TableCell>Giá vé</TableCell>
                <TableCell>Tổng vé</TableCell>
                <TableCell>Đã bán</TableCell>
                <TableCell>Còn lại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Vé thường</TableCell>
                <TableCell>200.000 ₫</TableCell>
                <TableCell>100</TableCell>
                <TableCell>80</TableCell>
                <TableCell>20</TableCell>
                <TableCell sx={{ color: "green" }}>🟢 Còn bán</TableCell>
                <TableCell>
                  <Button size="small">✏️ Sửa</Button>
                  <Button size="small" color="error">
                    🗑️ Xóa
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Vé VIP</TableCell>
                <TableCell>500.000 ₫</TableCell>
                <TableCell>50</TableCell>
                <TableCell>50</TableCell>
                <TableCell>0</TableCell>
                <TableCell sx={{ color: "red" }}>🔴 Hết vé</TableCell>
                <TableCell>
                  <Button size="small">✏️ Sửa</Button>
                  <Button size="small" color="error">
                    🗑️ Xóa
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ mb: 5 }}>
          Xuất dữ liệu vé (.xlsx)
        </Button>


        <Typography variant="h5" gutterBottom>
          👥 Danh sách người tham dự
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <TextField fullWidth placeholder="🔍 Tìm kiếm tên/email/số điện thoại" />
          <Select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Loại vé</MenuItem>
            <MenuItem value="normal">Vé thường</MenuItem>
            <MenuItem value="vip">Vé VIP</MenuItem>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Trạng thái</MenuItem>
            <MenuItem value="checked-in">✅ Đã check-in</MenuItem>
            <MenuItem value="not-used">❌ Chưa sử dụng</MenuItem>
            <MenuItem value="cancelled">🚫 Hủy</MenuItem>
          </Select>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khách</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Loại vé</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Check-in</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Nguyễn Văn A</TableCell>
                <TableCell>a.nguyen@email.com</TableCell>
                <TableCell>Vé thường</TableCell>
                <TableCell>✅ Đã check-in</TableCell>
                <TableCell>
                  <Button size="small" color="error">
                    🗑️ Hủy
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Trần Thị B</TableCell>
                <TableCell>b.tran@email.com</TableCell>
                <TableCell>Vé VIP</TableCell>
                <TableCell>❌ Chưa sử dụng</TableCell>
                <TableCell>
                  <Button size="small" color="success">
                    ✔️ Check-in
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Lê Văn C</TableCell>
                <TableCell>c.le@email.com</TableCell>
                <TableCell>Vé thường</TableCell>
                <TableCell>🚫 Hủy</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ mt: 3 }}>
          Xuất danh sách người tham dự (.xlsx)
        </Button>
      </Box> */}

      <Box sx={{ position: "relative" }}>
        <Typography variant="h5" gutterBottom>
          Tạo sơ đồ ghế
        </Typography>

        {/* Nhập dòng và cột */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Số dòng"
            type="number"
            size="small"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
          <TextField
            label="Số cột"
            type="number"
            size="small"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Hoàn thành
          </Button>
        </Box>

        {/* Thêm khu vực mới */}
        <Box mb={3}>
          <Typography variant="h6">Thêm khu vực:</Typography>
          <Box display="flex" gap={2} mt={1} flexWrap="wrap">
            <TextField
              label="Tên khu vực"
              size="small"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <TextField
              label="Giá vé"
              type="number"
              size="small"
              value={newZone.price}
              onChange={(e) => setNewZone({ ...newZone, price: e.target.value })}
            />
            <TextField
              select
              label="Màu"
              size="small"
              value={newZone.color}
              onChange={(e) => setNewZone({ ...newZone, color: e.target.value })}
              style={{ minWidth: 120 }}
            >
              {colorOptions.map((color) => (
                <MenuItem key={color} value={color}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      display: "inline-block",
                      marginRight: 1,
                      borderRadius: 1,
                    }}
                  />
                  {color}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleAddZone}>
              Thêm khu vực
            </Button>
          </Box>
        </Box>

        {/* Chọn khu vực */}
        {zones.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6">Chọn khu vực để vẽ:</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              {zones.map((zone) => (
                <Box
                  key={zone.name}
                  display="flex"
                  alignItems="center"
                  onClick={() => setSelectedZone(zone)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: "bold",
                    cursor: "pointer",
                    backgroundColor: zone.color,
                    color: selectedZone?.name === zone.name ? "#fff" : "#000",
                    border:
                      selectedZone?.name === zone.name ? "2px solid #000" : "2px solid transparent",
                    boxShadow:
                      selectedZone?.name === zone.name ? "0 0 4px rgba(0,0,0,0.3)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {zone.name} ({parseInt(zone.price).toLocaleString()}đ)
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteZone(zone.name);
                    }}
                    sx={{ ml: 1, color: selectedZone?.name === zone.name ? "#fff" : "#000" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Ma trận chọn ghế */}
        {matrix.length > 0 && (
          <Box mb={4} sx={{ userSelect: "none" }}>
            <Typography variant="h6">Vẽ sơ đồ ghế:</Typography>
            {matrix.map((row, rowIdx) => (
              <Box key={rowIdx} display="flex">
                {row.map((cell, colIdx) => (
                  <Paper
                    key={colIdx}
                    onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                    onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                    onMouseUp={() => setIsMouseDown(false)}
                    sx={{
                      width: 40,
                      height: 40,
                      m: 0.5,
                      backgroundColor: cell.selected ? cell.zone?.color || "#ccc" : "#ccc",
                      cursor: "pointer",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )}

        {/* Kết quả sau khi hoàn thành */}
        {submittedMatrix.length > 0 && (
          <Box>
            <Typography variant="h6">Sơ đồ đã lưu:</Typography>
            {submittedMatrix.map((row, rowIdx) => (
              <Box key={rowIdx} display="flex">
                {row.map((cell, colIdx) => (
                  <Paper
                    key={colIdx}
                    sx={{
                      width: 50,
                      height: 40,
                      m: 0.5,
                      backgroundColor: cell.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: cell.label !== "none" ? "#fff" : "#777",
                      fontWeight: "bold",
                      fontSize: 14,
                      borderRadius: 1,
                    }}
                  >
                    {cell.label !== "none" ? cell.label : ""}
                  </Paper>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
export default OrganizerTicketsAndAttendees;

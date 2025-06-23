import React, { useState } from "react";
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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
function OrganizerTicketsAndAttendees() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  return (
    <DashboardLayout>
      <Box p={3} sx={{ position: "relative" }}>
        <Typography variant="h4" gutterBottom>
          🎫 Quản lý vé
        </Typography>

        {/* Bộ lọc sự kiện và thêm loại vé */}
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

        {/* Bảng loại vé */}
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

        {/* Danh sách người tham dự */}
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
      </Box>
    </DashboardLayout>
  );
}
export default OrganizerTicketsAndAttendees;

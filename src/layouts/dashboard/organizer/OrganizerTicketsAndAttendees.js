import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";

import { useState } from "react";
import { position } from "stylis";

function OrganizerTicketsAndAttendees() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const showtimeOptions = [
    { value: "1", label: "20/07/2025 - 19:00 - Sân khấu A" },
    { value: "2", label: "21/07/2025 - 20:00 - Sân khấu B" },
  ];

  return (
    <DashboardLayout>
      <Box p={3} sx={{ position: "relative" }}>
        {/* Tiêu đề chính */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🎫 Quản lý vé & người tham dự
        </Typography>

        {/* Chọn sự kiện & suất diễn */}
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={3}>
          <Select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            displayEmpty
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">🗂️ Chọn sự kiện</MenuItem>
            <MenuItem value="event1">GAMA Music Festival</MenuItem>
            <MenuItem value="event2">Workshop Canva</MenuItem>
          </Select>

          <Select
            value={selectedShowtime}
            onChange={(e) => setSelectedShowtime(e.target.value)}
            displayEmpty
            sx={{ minWidth: 280 }}
          >
            <MenuItem value="">📅 Chọn suất diễn</MenuItem>
            {showtimeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Bảng loại vé */}
        <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
          <Typography variant="h6" mb={2}>
            📋 Danh sách loại vé
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loại vé</TableCell>
                  <TableCell>Giá vé</TableCell>
                  <TableCell>Tổng vé</TableCell>
                  <TableCell>Đã bán</TableCell>
                  <TableCell>Còn lại</TableCell>
                  <TableCell>Trạng thái</TableCell>
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
                </TableRow>
                <TableRow>
                  <TableCell>Vé VIP</TableCell>
                  <TableCell>500.000 ₫</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>50</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell sx={{ color: "red" }}>🔴 Hết vé</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Xuất dữ liệu vé (.xlsx)
            </Button>
          </Box>
        </Paper>

        {/* Danh sách người tham dự */}
        <Paper elevation={2} sx={{ mb: 5, p: 2 }}>
          <Typography variant="h6" mb={2}>
            👥 Danh sách người tham dự
          </Typography>

          {/* Bộ lọc tìm kiếm */}
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              fullWidth
              placeholder="🔍 Tìm kiếm tên / email / số điện thoại"
              sx={{ minWidth: 300 }}
            />
            <Select
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Loại vé</MenuItem>
              <MenuItem value="normal">Vé thường</MenuItem>
              <MenuItem value="vip">Vé VIP</MenuItem>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Trạng thái</MenuItem>
              <MenuItem value="checked-in">✅ Đã check-in</MenuItem>
              <MenuItem value="not-used">❌ Chưa sử dụng</MenuItem>
              <MenuItem value="cancelled">🚫 Hủy</MenuItem>
            </Select>
          </Box>

          {/* Bảng người tham dự */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên khách</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Loại vé</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
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

          <Box mt={2}>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Xuất danh sách người tham dự (.xlsx)
            </Button>
          </Box>
        </Paper>

        <Footer />
      </Box>
    </DashboardLayout>
  );
}

export default OrganizerTicketsAndAttendees;

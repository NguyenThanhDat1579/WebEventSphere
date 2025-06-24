import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Button,
  Avatar,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import ArgonTypography from "components/ArgonTypography";

function MyEventTable({ events, onViewDetail }) {
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const weekday = weekdayNames[date.getDay()];

    return `${hours}:${minutes}, ${weekday}, ${day} tháng ${month} ${year}`;
  };

  const getStatusChip = (event) => {
    const now = new Date();
    const start = new Date(event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000);
    const end = new Date(event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000);

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const timeUntilStart = start.getTime() - now.getTime();

    if (now >= start && now <= end) {
      return <Chip label="Đang diễn ra" color="success" size="small" sx={{ color: "#fff" }} />;
    } else if (timeUntilStart > 0 && timeUntilStart <= oneWeekMs) {
      return <Chip label="Sắp diễn ra" color="error" size="small" sx={{ color: "#fff" }} />;
    } else if (timeUntilStart > oneWeekMs) {
      return <Chip label="Chưa diễn ra" color="warning" size="small" sx={{ color: "#fff" }} />;
    } else {
      return <Chip label="Đã kết thúc" color="default" size="small" sx={{ color: "#fff" }} />;
    }
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto", mt: -3 }}>
      <Table size="medium" sx={{ minWidth: 700, tableLayout: "fixed" }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ width: "35%", fontWeight: "bold", fontSize: "1rem" }}>
              Sự kiện
            </TableCell>
            <TableCell sx={{ width: "30%", fontWeight: "bold", fontSize: "1rem" }}>
              Ngày diễn ra
            </TableCell>
            <TableCell sx={{ width: "15%", fontWeight: "bold", fontSize: "1rem" }}>
              Trạng thái
            </TableCell>
            <TableCell
              sx={{ width: "20%", fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}
            >
              Chi tiết
            </TableCell>
          </TableRow>

          {events.map((event, index) => (
            <TableRow
              key={event.id}
              hover
              sx={{
                backgroundColor: index % 2 === 0 ? "#f8f9fa" : "#fff",
                borderBottom: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar
                    src={event.avatar}
                    alt={event.title}
                    variant="rounded"
                    sx={{ width: 48, height: 48, borderRadius: 2 }}
                  />
                  <Box>
                    <ArgonTypography
                      sx={{ fontWeight: "600", fontSize: "0.9rem", whiteSpace: "wrap" }}
                    >
                      {event.title}
                    </ArgonTypography>
                  </Box>
                </Box>
              </TableCell>

              <TableCell>
                <ArgonTypography
                  color="text.primary"
                  sx={{ fontWeight: "600", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  {formatDateTime(event.timeStart)}
                </ArgonTypography>
              </TableCell>

              <TableCell sx={{ fontWeight: "bold" }}>{getStatusChip(event)}</TableCell>

              <TableCell sx={{ textAlign: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onViewDetail(event.id)}
                  sx={{
                    backgroundColor: "#1A73E8", // màu xanh lam đậm
                    color: "#fff",
                    borderColor: "#1A73E8",
                    "&:hover": {
                      backgroundColor: "#fff",
                      color: "#1A73E8",
                      borderColor: "#1A73E8",
                    },
                  }}
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

MyEventTable.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      timeStart: PropTypes.number.isRequired,
      timeEnd: PropTypes.number.isRequired,
    })
  ).isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default MyEventTable;

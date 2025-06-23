import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  Avatar,
  Box,
  Chip,
  Typography,
} from "@mui/material";

function EventTable({ events }) {
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const weekday = weekdayNames[date.getDay()];
    return `${hours}:${minutes}, ${weekday} ${day}/${month}/${year}`;
  };

  const getStatusChip = (event) => {
    const now = new Date();
    const start = new Date(event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000);
    const end = new Date(event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000);
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const timeUntilStart = start.getTime() - now.getTime();

    if (now >= start && now <= end)
      return <Chip label="Đang diễn ra" color="success" size="small" sx={{ color: "#fff" }} />;
    if (timeUntilStart > 0 && timeUntilStart <= oneWeekMs)
      return <Chip label="Sắp diễn ra" color="error" size="small" sx={{ color: "#fff" }} />;
    if (timeUntilStart > oneWeekMs)
      return <Chip label="Chưa diễn ra" color="warning" size="small" sx={{ color: "#fff" }} />;
    return <Chip label="Đã kết thúc" color="default" size="small" sx={{ color: "#fff" }} />;
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto" }}>
      <Table size="medium" sx={{ minWidth: 1000, tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: 60, paddingRight: 12 }}>Ảnh</TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: 240, paddingRight: 10, whiteSpace: "nowrap" }}
            >
              Tên sự kiện
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: 300, paddingRight: 7, whiteSpace: "nowrap" }}
            >
              Ngày diễn ra
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: 130, paddingRight: 7, whiteSpace: "nowrap" }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: 100, paddingRight: 10, whiteSpace: "nowrap" }}
              align="center"
            >
              Số vé đã bán
            </TableCell>
            <TableCell
              sx={{ fontWeight: "bold", width: 100, paddingRight: 15, whiteSpace: "nowrap" }}
              align="center"
            >
              Tổng vé
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: 160, whiteSpace: "nowrap" }} align="right">
              Doanh thu
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {events.map((event, index) => {
            const startTime = formatDateTime(event.timeStart);
            const endTime = formatDateTime(event.timeEnd);

            const soldTickets = event.soldTickets || 0;
            const totalTickets = event.ticketQuantity || 0;
            const revenue = event.revenue || 0;

            return (
              <TableRow
                key={event._id || index}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell>
                  <Avatar src={event.avatar} variant="rounded" sx={{ width: 80, height: 80 }} />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "bold",
                      maxWidth: 180,
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {event.title || event.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "600" }}>
                    {startTime}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(event)}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "600" }}>
                    {soldTickets}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "600" }}>
                    {totalTickets}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "600" }}>
                    {revenue > 0 ? revenue.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
EventTable.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      timeStart: PropTypes.number.isRequired,
      timeEnd: PropTypes.number.isRequired,
      ticketPrice: PropTypes.number,
      ticketQuantity: PropTypes.number,
      showtimes: PropTypes.arrayOf(
        PropTypes.shape({
          soldTickets: PropTypes.number,
        })
      ),
    })
  ).isRequired,
};
EventTable.propTypes = {
  events: PropTypes.array.isRequired,
};

export default EventTable;

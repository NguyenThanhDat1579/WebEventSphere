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
import { format } from "date-fns";

function EventTable({ events }) {
  const getStatusChip = (event) => {
    const now = new Date();

    if (!event.showtimes || event.showtimes.length === 0) {
      return (
        <Chip
          label="Chưa có lịch"
          color="default"
          size="medium"
          sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
      );
    }

    // Tìm thời gian bắt đầu sớm nhất và kết thúc muộn nhất
    const start = new Date(Math.min(...event.showtimes.map((s) => s.startTime)));
    const end = new Date(Math.max(...event.showtimes.map((s) => s.endTime)));

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const timeUntilStart = start.getTime() - now.getTime();

    if (now >= start && now <= end) {
      return (
        <Chip
          label="Đang diễn ra"
          color="success"
          size="small"
          sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
      );
    }

    if (timeUntilStart > 0 && timeUntilStart <= oneWeekMs) {
      return (
        <Chip
          label="Sắp diễn ra"
          color="error"
          size="small"
          sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
      );
    }

    if (timeUntilStart > oneWeekMs) {
      return (
        <Chip
          label="Chưa diễn ra"
          color="warning"
          size="small"
          sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
        />
      );
    }

    return (
      <Chip
        label="Đã kết thúc"
        color="default"
        size="small"
        sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}
      />
    );
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto" }}>
      <Table size="medium" sx={{ minWidth: 1000, tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "700", fontSize: 14, width: 60, paddingRight: 20 }}>
              {""}
            </TableCell>
            <TableCell
              sx={{
                width: 240,
                paddingRight: 15,
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Tên sự kiện
            </TableCell>
            <TableCell
              sx={{
                width: 300,
                paddingRight: 14,
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Ngày diễn ra
            </TableCell>
            <TableCell
              sx={{
                width: 130,
                paddingRight: 9,
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{
                fontWeight: "bold",
                width: 100,
                paddingRight: 10,
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontSize: 14,
              }}
              align="center"
            >
              Số vé đã bán/Tổng vé
            </TableCell>

            <TableCell
              sx={{
                fontWeight: "bold",
                width: 160,
                whiteSpace: "nowrap",
                fontWeight: "700",
                fontSize: 14,
              }}
              align="right"
            >
              Doanh thu
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {events.map((event, index) => {
            // Hàm định dạng
            const showtimes = event.showtimes || [];

            let dateDisplay = "Chưa có lịch";

            if (showtimes.length > 0) {
              const minStart = Math.min(...showtimes.map((s) => s.startTime));
              const maxEnd = Math.max(...showtimes.map((s) => s.endTime));

              const startDate = format(new Date(minStart), "dd/MM/yyyy");
              const endDate = format(new Date(maxEnd), "dd/MM/yyyy");

              dateDisplay = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
            }

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
                  <Avatar
                    src={event.avatar}
                    variant="rounded"
                    sx={{ width: 110, height: 110, borderRadius: 2 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: "600",
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
                  <Typography variant="body2" sx={{ fontWeight: "400", fontSize: "14" }}>
                    {dateDisplay}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(event)}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "500", fontSize: "14" }}>
                    {soldTickets}/{totalTickets}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: "600", fontSize: "14" }}>
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

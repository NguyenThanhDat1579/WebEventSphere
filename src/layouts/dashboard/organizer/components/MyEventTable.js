import React, { useEffect, useState } from "react";
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
  Stack,
} from "@mui/material";
import { format } from "date-fns";
import ArgonTypography from "components/ArgonTypography";
import eventApi from "api/eventApi";
import { useNavigate } from "react-router-dom";
function MyEventTable({ events, onViewDetail }) {
  const navigate = useNavigate();

  const toDate = (timestamp) => new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);

  const formatTimeRange = (startTimestamp, endTimestamp) => {
    const start = toDate(startTimestamp);
    const end = toDate(endTimestamp);

    const startHours = String(start.getHours()).padStart(2, "0");
    const startMinutes = String(start.getMinutes()).padStart(2, "0");

    const endHours = String(end.getHours()).padStart(2, "0");
    const endMinutes = String(end.getMinutes()).padStart(2, "0");

    const day = String(start.getDate()).padStart(2, "0");
    const month = String(start.getMonth() + 1).padStart(2, "0");
    const year = start.getFullYear();

    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}, ${day}/${month}/${year}`;
  };

  const getDisplayShowtime = (showtimes = []) => {
    if (!showtimes.length) return "Chưa có suất diễn";

    const now = Date.now();
    let running = null;
    let upcoming = null;
    let past = null;

    showtimes.forEach((s) => {
      const start = toDate(s.startTime).getTime();
      const end = toDate(s.endTime).getTime();

      if (now >= start && now <= end) {
        if (!running || start < toDate(running.startTime).getTime()) {
          running = s;
        }
      } else if (start > now) {
        if (!upcoming || start < toDate(upcoming.startTime).getTime()) {
          upcoming = s;
        }
      } else {
        if (!past || start > toDate(past.startTime).getTime()) {
          past = s;
        }
      }
    });

    if (running) return `Đang diễn: ${formatTimeRange(running.startTime, running.endTime)}`;
    if (upcoming) return `Sắp diễn: ${formatTimeRange(upcoming.startTime, upcoming.endTime)}`;
    if (past) return `Đã diễn: ${formatTimeRange(past.startTime, past.endTime)}`;

    return "Chưa có suất phù hợp";
  };

  const getStatusChip = (event) => {
    const showtimes = event.showtimes || [];
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    if (!showtimes.length) {
      return <Chip label="Chưa lên lịch" color="default" size="small" sx={{ color: "#fff" }} />;
    }

    const isOngoing = showtimes.some((s) => {
      const start = toDate(s.startTime).getTime();
      const end = toDate(s.endTime).getTime();
      return now >= start && now <= end;
    });

    if (isOngoing) {
      return <Chip label="Đang diễn ra" color="success" size="small" sx={{ color: "#fff" }} />;
    }

    const allEnded = showtimes.every((s) => toDate(s.endTime).getTime() < now);
    if (allEnded) {
      return <Chip label="Đã kết thúc" color="default" size="small" sx={{ color: "#fff" }} />;
    }

    const upcomingTimes = showtimes
      .filter((s) => toDate(s.startTime).getTime() > now)
      .map((s) => toDate(s.startTime).getTime());

    const soonest = Math.min(...upcomingTimes);
    const timeUntilSoonest = soonest - now;

    if (timeUntilSoonest <= oneWeekMs) {
      return <Chip label="Sắp diễn ra" color="error" size="small" sx={{ color: "#fff" }} />;
    }

    return <Chip label="Chưa diễn ra" color="warning" size="small" sx={{ color: "#fff" }} />;
  };

  const handleViewRevenue = (eventId, eventTitle) => {
    const encodedTitle = encodeURIComponent(eventTitle); // Encode để giữ khoảng trắng và ký tự đặc biệt
    navigate(`/revenue-organizer/${eventId}/${encodedTitle}`);
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto", mt: -3 }}>
      <Table size="medium" sx={{ minWidth: 700, tableLayout: "fixed" }}>
        <TableBody>
          <TableRow>
            <TableCell
              sx={{
                width: "25%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Sự kiện
            </TableCell>
            <TableCell
              sx={{
                width: "20%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Ngày diễn ra
            </TableCell>
            <TableCell
              sx={{
                width: "15%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{
                width: "10%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Vé đã bán
            </TableCell>
            <TableCell
              sx={{
                width: "10%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Địa điểm
            </TableCell>
            <TableCell
              sx={{
                width: "10%",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#333",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Chi tiết
            </TableCell>
          </TableRow>

          {events.map((event, index) => {
            return (
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
                      sx={{ width: 110, height: 110, borderRadius: 2 }}
                    />
                    <Box>
                      <ArgonTypography
                        sx={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "wrap" }}
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
                    {getDisplayShowtime(event.showtimes)}
                  </ArgonTypography>
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>{getStatusChip(event)}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 400, fontSize: "0.9rem" }}>
                    {event.soldTickets}/{event.totalTickets}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 400, fontSize: "0.9rem" }}>
                    {event.location || "Đang cập nhật"}
                  </Typography>
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => onViewDetail(event.id)}
                      sx={{
                        p: 0,
                        minWidth: "unset",
                        color: "#1A73E8",
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      Xem chi tiết
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleViewRevenue(event.id, event.title)}
                      sx={{
                        p: 0,
                        minWidth: "unset",
                        color: "#4CAF50",
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        "&:hover": {
                          textDecoration: "underline",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      Doanh thu
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
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
      location: PropTypes.string,
      soldTickets: PropTypes.number,
      totalTickets: PropTypes.number,
      revenue: PropTypes.number,
      ticketPrice: PropTypes.number,
      status: PropTypes.string,
      showtimes: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string,
          startTime: PropTypes.number.isRequired,
          endTime: PropTypes.number.isRequired,
          soldTickets: PropTypes.number,
          totalTickets: PropTypes.number,
          revenue: PropTypes.number,
        })
      ),
    })
  ).isRequired,
  onViewDetail: PropTypes.func.isRequired,
};

export default MyEventTable;

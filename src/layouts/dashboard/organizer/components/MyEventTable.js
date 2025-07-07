import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArgonTypography from "components/ArgonTypography";
import { useNavigate } from "react-router-dom";

function MyEventTable({ events, onViewDetail }) {
  const navigate = useNavigate();

  const toDate = (timestamp) => new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);

  const formatTimeRange = (startTimestamp, endTimestamp) => {
    const start = toDate(startTimestamp);
    const end = toDate(endTimestamp);

    const startStr = `${String(start.getHours()).padStart(2, "0")}:${String(
      start.getMinutes()
    ).padStart(2, "0")}`;
    const endStr = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(
      2,
      "0"
    )}`;
    const dateStr = `${String(start.getDate()).padStart(2, "0")}/${String(
      start.getMonth() + 1
    ).padStart(2, "0")}/${start.getFullYear()}`;

    return `${startStr} - ${endStr}, ${dateStr}`;
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
    const encodedTitle = encodeURIComponent(eventTitle);
    navigate(`/revenue-organizer/${eventId}/${encodedTitle}`);
  };

  // === Pagination logic ===
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(events.length / rowsPerPage);
  const paginatedEvents = events.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto", mt: -3 }}>
        <Table size="medium" sx={{ minWidth: 700, tableLayout: "fixed" }}>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: "25%", fontWeight: 600, fontSize: "0.95rem" }}>
                Sự kiện
              </TableCell>
              <TableCell sx={{ width: "20%", fontWeight: 600, fontSize: "0.95rem" }}>
                Ngày diễn ra
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ width: "10%", fontWeight: 600, fontSize: "0.95rem" }}>
                Vé đã bán
              </TableCell>
              <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>
                Địa điểm
              </TableCell>
              <TableCell
                sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem", textAlign: "center" }}
              >
                Chi tiết
              </TableCell>
            </TableRow>

            {paginatedEvents.map((event, index) => (
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
                      sx={{ width: 100, height: 100, borderRadius: 2 }}
                    />
                    <ArgonTypography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {event.title}
                    </ArgonTypography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                    {getDisplayShowtime(event.showtimes)}
                  </Typography>
                </TableCell>

                <TableCell> 
                  <Chip
                      label={
                        event.status === "Ongoing"
                          ? "Đang diễn ra"
                          : event.status === "Upcoming"
                          ? "Sắp diễn ra"
                          : "Đã kết thúc"
                      }
                      color={
                        event.status === "Ongoing"
                          ? "success"
                          : event.status === "Upcoming"
                          ? "error"
                          : "default"
                      }
                      size="small"
                      sx={{ color: "#fff" }}
                    /></TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                    {event.soldTickets}/{event.totalTickets}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                    {event.location || "Đang cập nhật"}
                  </Typography>
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <Stack spacing={1} alignItems="center">
                    <Box
                      onClick={() => onViewDetail(event.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        color: "#1A73E8",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          backgroundColor: "#e8f0fe",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      <span>[Xem chi tiết]</span>
                    </Box>

                    <Box
                      onClick={() => handleViewRevenue(event.id, event.title)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        color: "#4CAF50",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          backgroundColor: "#e8f5e9",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      <span>[Doanh thu]</span>
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Control */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={2}>
        <IconButton
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ArrowBackIosIcon sx={{ fontSize: 26 }} />
        </IconButton>

        <Typography
          sx={{ fontWeight: 500, fontSize: "1rem", minWidth: "50px", textAlign: "center" }}
        >
          {currentPage}/{totalPages}
        </Typography>

        <IconButton
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 26 }} />
        </IconButton>
      </Stack>
    </>
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

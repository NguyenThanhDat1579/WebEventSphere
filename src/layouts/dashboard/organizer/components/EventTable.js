import React, { useState } from "react";
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
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
const ITEMS_PER_PAGE = 8;

function EventTable({ events }) {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusChip = (event) => {
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const showtimes = event.showtimes || [];

    if (!showtimes.length) {
      return <Chip label="Chưa có lịch" color="default" size="small" sx={{ color: "#fff" }} />;
    }

    const start = Math.min(...showtimes.map((s) => s.startTime));
    const end = Math.max(...showtimes.map((s) => s.endTime));

    if (now >= start && now <= end) {
      return <Chip label="Đang diễn ra" color="success" size="small" sx={{ color: "#fff" }} />;
    }

    const timeUntilStart = start - now;
    if (timeUntilStart > 0 && timeUntilStart <= oneWeekMs) {
      return <Chip label="Sắp diễn ra" color="error" size="small" sx={{ color: "#fff" }} />;
    }

    if (timeUntilStart > oneWeekMs) {
      return <Chip label="Chưa diễn ra" color="warning" size="small" sx={{ color: "#fff" }} />;
    }

    return <Chip label="Đã kết thúc" color="default" size="small" sx={{ color: "#fff" }} />;
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const paginatedEvents = events.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Box>
      <TableContainer component={Paper} sx={{ boxShadow: 2, overflowX: "auto" }}>
        <Table size="medium" sx={{ minWidth: 1000 }}>
          <TableRow sx={{ backgroundColor: "#fff" }}>
            <TableCell sx={{ width: "25%", fontWeight: 600, fontSize: "0.95rem" }}>
              Sự kiện
            </TableCell>
            <TableCell sx={{ width: "20%", fontWeight: 600, fontSize: "0.95rem" }}>
              Ngày diễn ra
            </TableCell>
            <TableCell sx={{ width: "20%", fontWeight: 600, fontSize: "0.95rem" }}>
              Trạng thái
            </TableCell>
            <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>
              Vé đã bán
            </TableCell>
            <TableCell sx={{ width: "20%", fontWeight: 600, fontSize: "0.95rem" }}>
              Doanh thu
            </TableCell>
          </TableRow>

          <TableBody>
            {paginatedEvents.map((event, index) => {
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
                    backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                    "&:hover": { backgroundColor: "#e3f2fd" },
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={event.avatar}
                        variant="rounded"
                        sx={{ width: 100, height: 100, borderRadius: 2 }}
                      />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {event.title || event.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                      {dateDisplay}
                    </Typography>
                  </TableCell>

                  <TableCell>{getStatusChip(event)}</TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                      {soldTickets}/{totalTickets}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {revenue > 0 ? revenue.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} mt={2}>
        <IconButton
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          sx={{ color: "#1976d2" }}
        >
          <ArrowBackIosIcon sx={{ fontSize: 26 }} />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: "1rem",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          {currentPage}/{totalPages}
        </Typography>

        <IconButton
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          sx={{ color: "#1976d2" }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 26 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}

EventTable.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      ticketQuantity: PropTypes.number,
      soldTickets: PropTypes.number,
      revenue: PropTypes.number,
      showtimes: PropTypes.arrayOf(
        PropTypes.shape({
          startTime: PropTypes.number.isRequired,
          endTime: PropTypes.number.isRequired,
        })
      ),
    })
  ).isRequired,
};

export default EventTable;

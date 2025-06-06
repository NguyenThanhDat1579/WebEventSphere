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
} from "@mui/material";
import { format } from "date-fns";
import ArgonTypography from "components/ArgonTypography";

function MyEventTable({ events }) {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1, overflowX: "auto" }}>
      <Table size="medium" sx={{ minWidth: 800, tableLayout: "fixed" }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Sự kiện</TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold" }}>Thời gian</TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold" }}>Trạng thái</TableCell>
            <TableCell sx={{ width: "15%", fontWeight: "bold", textAlign: "center" }}>
              Vé đã bán
            </TableCell>
            <TableCell sx={{ width: "15%", fontWeight: "bold", textAlign: "right" }}>
              Doanh thu
            </TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold", textAlign: "center" }}>
              Chi tiết
            </TableCell>
          </TableRow>

          {events.map((event, index) => (
            <TableRow
              key={event.id}
              hover
              sx={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                borderBottom: "1px solid #ddd",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              {/* Avatar + Title */}
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={event.avatar}
                    alt={event.title}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                  />
                  <ArgonTypography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ whiteSpace: "normal" }}
                  >
                    {event.title}
                  </ArgonTypography>
                </Box>
              </TableCell>

              <TableCell>
                {`${format(new Date(event.timeStart * 1000), "dd/MM/yyyy")} - ${format(
                  new Date(event.timeEnd * 1000),
                  "dd/MM/yyyy"
                )}`}
              </TableCell>

              <TableCell>
                <ArgonTypography
                  variant="caption"
                  color={event.status === "Published" ? "success" : "warning"}
                  fontWeight="medium"
                >
                  {event.status === "Published" ? "Đang diễn ra" : "Đã kết thúc"}
                </ArgonTypography>
              </TableCell>

              <TableCell sx={{ textAlign: "center" }}>
                {event.soldTickets} / {event.totalTickets}
              </TableCell>

              <TableCell sx={{ textAlign: "right" }}>{formatCurrency(event.revenue)}</TableCell>

              <TableCell sx={{ textAlign: "center" }}>
                <Button color="info" size="small">
                  Chi tiết
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
      timeStart: PropTypes.number.isRequired, // Thêm
      timeEnd: PropTypes.number.isRequired,
      status: PropTypes.oneOf(["Published", "Ended"]).isRequired,
      soldTickets: PropTypes.number.isRequired,
      totalTickets: PropTypes.number.isRequired,
      revenue: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MyEventTable;

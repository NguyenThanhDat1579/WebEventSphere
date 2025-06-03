import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
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
      <Table size="medium" sx={{ minWidth: 700, tableLayout: "fixed" }}>
        {/* Bỏ TableHead */}

        <TableBody>
          {/* Chuyển TableHead thành 1 TableRow trong TableBody */}
          <TableRow>
            <TableCell sx={{ width: "15%", fontWeight: "bold" }}>Tên sự kiện</TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold" }}>Ngày</TableCell>
            <TableCell sx={{ width: "15%", fontWeight: "bold" }}>Địa điểm</TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold" }}>Trạng thái</TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold", textAlign: "center" }}>
              Vé đã bán
            </TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold", textAlign: "center" }}>
              Doanh thu
            </TableCell>
            <TableCell sx={{ width: "10%", fontWeight: "bold", textAlign: "center" }}>
              Chi tiết
            </TableCell>
          </TableRow>

          {/* Các rows dữ liệu */}
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
              <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                {event.title}
              </TableCell>
              <TableCell>{format(event.date, "dd/MM/yyyy")}</TableCell>
              <TableCell>{event.location || "Đang cập nhật"}</TableCell>
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
              <TableCell sx={{ textAlign: "right" }}>
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
      date: PropTypes.instanceOf(Date).isRequired,
      location: PropTypes.string,
      status: PropTypes.oneOf(["Published", "Ended"]).isRequired,
      soldTickets: PropTypes.number.isRequired,
      totalTickets: PropTypes.number.isRequired,
      ticketPrice: PropTypes.number,
      revenue: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MyEventTable;

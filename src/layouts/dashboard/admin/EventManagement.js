import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import eventApi from "api/eventApi";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function EventManagement() {
  const [columns, setColumns] = useState([
    { name: "ảnh", align: "center" },
    { name: "tên sự kiện", align: "left" },
    { name: "ngày bắt đầu", align: "center" },
    { name: "giá vé", align: "center" },
    { name: "số vé đã bán", align: "center" },
    { name: "doanh thu", align: "center" },
    { name: "trạng thái diễn ra", align: "center" },
    { name: "trạng thái", align: "center" },
    { name: "hành động", align: "center" },
  ]);

  const [rows, setRows] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventApi.getAllHome();
        if (res.data.status) {
          const data = res.data.data;

          const mappedRows = data.map((event) => {
  const soldTickets = Number(event.soldTickets) ||0;
  const ticketPrice = Number(event.ticketPrice) ||0;
  const revenue = soldTickets * ticketPrice;

  return {
    id: event._id,
    "ảnh": (
      <img
        src={event.avatar}
        alt={event.name}
        style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
      />
    ),
    "tên sự kiện": (
      <Typography
        variant="body2"
        style={{ fontSize: 14, maxWidth: 160, wordBreak: "break-word", whiteSpace: "normal" }}
      >
        {event.name}
      </Typography>
    ),
    "ngày bắt đầu": new Date(event.timeStart).toLocaleDateString("vi-VN"),
    "giá vé": `${ticketPrice.toLocaleString()} ₫`,
    "số vé đã bán": soldTickets,
    "doanh thu": `${revenue.toLocaleString()} ₫`,
    "trạng thái diễn ra": getTimelineStatus(event.timeStart, event.timeEnd),
    "trạng thái": renderStatus(event.status || "Chưa duyệt"),
    "hành động": (
      <Button
        variant="contained"
        size="small"
        sx={{
          backgroundColor: "#1976d2",
          color: "#fff",
          fontSize: "0.75rem",
          padding: "4px 12px",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#fff",
            color: "#1976d2",
            border: "1px solid #1976d2",
          },
        }}
        startIcon={<InfoOutlinedIcon sx={{ fontSize: "16px" }} />}
        onClick={() => handleRowClick(event._id)}
      >
        Chi tiết
      </Button>
    ),
  };
});


          setRows(mappedRows);
        }
      } catch (err) {
        console.error("Lỗi khi gọi API /events/home:", err);
      }
    };

    fetchEvents();
  }, []);

  const renderStatus = (status) => {
    const colorMap = {
      "Đã duyệt": "#2e7d32",
      "Từ chối": "#d32f2f",
      "Chưa duyệt": "#ed6c02",
    };

    return (
      <Typography
        variant="body2"
        sx={{
          backgroundColor: colorMap[status] || "#999",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "0.75rem",
          borderRadius: "6px",
          padding: "4px 12px",
          display: "inline-block",
          textAlign: "center",
        }}
      >
        {status}
      </Typography>
    );
  };

  const getTimelineStatus = (start, end) => {
    const now = Date.now();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime)
      return (
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#d32f2f",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.75rem",
            borderRadius: "6px",
            padding: "4px 12px",
            display: "inline-block",
            textAlign: "center",
          }}
        >
          Sắp diễn ra
        </Typography>
      );

    if (now > endTime)
      return (
        <Typography
          variant="body2"
          sx={{
            backgroundColor: "#757575",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "0.75rem",
            borderRadius: "6px",
            padding: "4px 12px",
            display: "inline-block",
            textAlign: "center",
          }}
        >
          Đã diễn ra
        </Typography>
      );

    return (
      <Typography
        variant="body2"
        sx={{
          backgroundColor: "#2e7d32",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "0.75rem",
          borderRadius: "6px",
          padding: "4px 12px",
          display: "inline-block",
          textAlign: "center",
        }}
      >
        Đang diễn ra
      </Typography>
    );
  };

  const handleRowClick = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await eventApi.getDetail(id);
      if (res.data.status) {
        setSelectedEvent(res.data.data);
        setOpenDialog(true);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API chi tiết:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const updateEventStatus = (newStatus) => {
    if (!selectedEvent) return;

    const updatedRows = rows.map((row) =>
      row.id === selectedEvent._id ? { ...row, "trạng thái": renderStatus(newStatus) } : row
    );
    setRows(updatedRows);
    setSelectedEvent({ ...selectedEvent, status: newStatus });
    setOpenDialog(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox p={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
                <ArgonTypography variant="h6">Danh sách sự kiện</ArgonTypography>
              </ArgonBox>
              <ArgonBox
                sx={{
                  overflowX: "auto",
                  "& .MuiTableRow-root:hover": { backgroundColor: "#f5f5f5" },
                  "& .MuiTableCell-root": { padding: "8px 12px", fontSize: 13 },
                }}
              >
                <Table columns={columns} rows={rows} />
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết sự kiện</DialogTitle>
        <DialogContent dividers>
  {loadingDetail || !selectedEvent ? (
    <CircularProgress />
  ) : (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
          {selectedEvent.name}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <img
          src={selectedEvent.avatar}
          alt="Event"
          style={{
            width: "100%",
            height: 280,
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid #ddd",
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom color="text.secondary">
          Mô tả sự kiện
        </Typography>
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: 16,
            background: "#f9f9f9",
            fontSize: 14,
            lineHeight: 1.7,
            maxHeight: 200,
            overflowY: "auto",
            fontFamily: "Roboto, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: selectedEvent.description }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" gutterBottom>
          <strong>Địa điểm:</strong> {selectedEvent.location}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Giá vé:</strong> {selectedEvent.ticketPrice?.toLocaleString() || 0} VNĐ
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Số vé đã bán:</strong> {selectedEvent.soldTickets}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" gutterBottom>
          <strong>Bắt đầu:</strong> {new Date(selectedEvent.timeStart).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Kết thúc:</strong> {new Date(selectedEvent.timeEnd).toLocaleString()}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Trạng thái:</strong>{" "}
          <span
            style={{
              backgroundColor:
                selectedEvent.status === "Đã duyệt"
                  ? "#2e7d32"
                  : selectedEvent.status === "Từ chối"
                  ? "#d32f2f"
                  : "#ed6c02",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {selectedEvent.status || "Chưa duyệt"}
          </span>
        </Typography>
      </Grid>
    </Grid>
  )}
</DialogContent>

<DialogActions
  sx={{
    justifyContent: "flex-end",
    padding: "16px 24px",
    gap: 2,
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
  }}
>
  <Button
    variant="outlined"
    color="error"
    startIcon={<CancelIcon />}
    onClick={() => updateEventStatus("Từ chối")}
    sx={{
      textTransform: "none",
      padding: "6px 20px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "0.9rem",
      minWidth: 120,
      borderColor: "#f44336",
      color: "#f44336",
      "&:hover": {
        backgroundColor: "#f44336",
        color: "#fff",
      },
    }}
  >
    Từ chối
  </Button>

  <Button
    variant="outlined"
    color="success"
    startIcon={<CheckCircleIcon />}
    onClick={() => updateEventStatus("Đã duyệt")}
    sx={{
      textTransform: "none",
      padding: "6px 20px",
      borderRadius: "8px",
      fontWeight: 600,
      fontSize: "0.9rem",
      minWidth: 120,
      backgroundColor: "#FFFFF",
      borderColor: "#1b5e20",
      color: "#1b5e20",
      "&:hover": {
        backgroundColor: "#1b5e20",
        color: "#fff",
      },
    }}
  >
    Duyệt
  </Button>
</DialogActions>



      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EventManagement;

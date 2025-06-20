import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Chip,
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

          const mappedRows = data.map((event) => ({
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
            "giá vé": `${event.ticketPrice?.toLocaleString() || 0} ₫`,
            "số vé đã bán": event.soldTickets,
            "doanh thu": `${(event.ticketPrice * event.soldTickets)?.toLocaleString() || 0} ₫`,
            "trạng thái diễn ra": getTimelineStatus(event.timeStart, event.timeEnd),
            "trạng thái": renderStatus(event.status || "Chưa duyệt"),
            "hành động": (
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoOutlinedIcon />}
                onClick={() => handleRowClick(event._id)}
              >
                Chi tiết
              </Button>
            ),
          }));


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
    "Đã duyệt": "#2e7d32",   // xanh lá
    "Từ chối": "#d32f2f",    // đỏ
    "Chưa duyệt": "#ed6c02", // cam
  };

  return (
    <Typography
      variant="body"
      sx={{
        color: colorMap[status] || "#666",
        fontWeight: "bold",
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
      <Typography variant="body" sx={{ color: "#0288d1", fontWeight: "bold", textAlign: "center" }}>
        Sắp diễn ra
      </Typography>
    );

  if (now > endTime)
    return (
      <Typography variant="body" sx={{ color: "#999", fontWeight: "bold", textAlign: "center" }}>
        Đã diễn ra
      </Typography>
    );

  return (
    <Typography variant="body" sx={{ color: "#1976d2", fontWeight: "bold", textAlign: "center" }}>
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
      row.id === selectedEvent._id
        ? { ...row, "trạng thái": renderStatus(newStatus) }
        : row
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
                  "& .MuiTableRow-root": {
                    "&:nth-of-type(odd)": {
                      backgroundColor: "#ffffff",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: "#f7f7f7",
                    },
                    "&:hover": {
                      backgroundColor: "#eaeaea",
                    },
                  },
                  "& .MuiTableCell-root": {
                    padding: "8px 12px",
                    fontSize: 13,
                    borderBottom: "1px solid #ddd",
                  },
                  "& .MuiTableHead-root": {
                    backgroundColor: "#e0e0e0",
                  },
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
            <>
              <Typography variant="h6">{selectedEvent.name}</Typography>
              <img
                src={selectedEvent.avatar}
                alt="Event"
                width="100%"
                style={{ borderRadius: 10, marginTop: 10 }}
              />
              <Typography mt={2}><strong>Mô tả:</strong> {selectedEvent.description}</Typography>
              <Typography mt={1}><strong>Địa điểm:</strong> {selectedEvent.location}</Typography>
              <Typography mt={1}><strong>Giá vé:</strong> {selectedEvent.ticketPrice?.toLocaleString() || 0} VNĐ</Typography>
              <Typography mt={1}><strong>Số vé đã bán:</strong> {selectedEvent.soldTickets}</Typography>
              <Typography mt={1}><strong>Thời gian bắt đầu:</strong> {new Date(selectedEvent.timeStart).toLocaleString()}</Typography>
              <Typography mt={1}><strong>Thời gian kết thúc:</strong> {new Date(selectedEvent.timeEnd).toLocaleString()}</Typography>
              <Typography mt={1}><strong>Trạng thái hiện tại:</strong> {selectedEvent.status || "Chưa duyệt"}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateEventStatus("Từ chối")} color="error" startIcon={<CancelIcon />}>
            Từ chối
          </Button>
          <Button onClick={() => updateEventStatus("Đã duyệt")} color="success" variant="contained" startIcon={<CheckCircleIcon />}>
            Duyệt
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EventManagement;

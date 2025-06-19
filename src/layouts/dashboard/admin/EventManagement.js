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
import { Chip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";


function EventManagement() {
  const [columns, setColumns] = useState([
    { name: "tên sự kiện", align: "left" },
    { name: "trạng thái", align: "center" },
    { name: "trạng thái diễn ra", align: "center" },
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
          console.log(data);
          const mappedRows = data.map((event) => ({
            id: event._id,
            "tên sự kiện": event.name,
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
    switch (status) {
      case "Đã duyệt":
        return <Chip label="Đã duyệt" color="success" />;
      case "Từ chối":
        return <Chip label="Từ chối" color="error" />;
      default:
        return <Chip label="Chưa duyệt" color="warning" />;
    }
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

  // Cập nhật selectedEvent
  setSelectedEvent({ ...selectedEvent, status: newStatus });

  // Đóng dialog
  setOpenDialog(false);
};

  const getTimelineStatus = (start, end) => {
    const now = Date.now();
    if (now < start) return <Chip label="Sắp diễn ra" color="info" />;
    if (now > end) return <Chip label="Đã diễn ra" color="default" />;
    return <Chip label="Đang diễn ra" color="primary" />;
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox
        p={2}
        sx={{
          "& .MuiTableRow-root:hover": {
            backgroundColor: "#f5f5f5",
          },
          "& .MuiTableCell-root": {
            padding: "12px 16px",
          },
          "& .MuiTableHead-root": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
                <ArgonTypography variant="h6">Danh sách sự kiện</ArgonTypography>
              </ArgonBox>
              <ArgonBox
                sx={{
                  "& .MuiTableRow-root:not(:last-child)": {
                    "& td": {
                      borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                        `${borderWidth[1]} solid ${borderColor}`,
                    },
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
          <Button
            onClick={() => updateEventStatus("Từ chối")}
            color="error"
            startIcon={<CancelIcon />}
          >
            Từ chối
          </Button>
          <Button
            onClick={() => updateEventStatus("Đã duyệt")}
            color="success"
            variant="contained"
            startIcon={<CheckCircleIcon />}
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

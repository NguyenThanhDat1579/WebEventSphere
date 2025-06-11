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

function EventManagement() {
  const [columns, setColumns] = useState([
    { name: "tên sự kiện", align: "left" },
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
            "tên sự kiện": event.name,
            "trạng thái": renderStatus(event.status || "Chưa duyệt"),
            "hành động": (
              <Button
                variant="outlined"
                size="small"
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
        return <Typography color="success.main">{status}</Typography>;
      case "Từ chối":
        return <Typography color="error.main">{status}</Typography>;
      default:
        return <Typography color="warning.main">Chưa duyệt</Typography>;
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

    // Cập nhật UI rows
    const updatedRows = rows.map((row) =>
      row["tên sự kiện"] === selectedEvent.name
        ? {
            ...row,
            "trạng thái": renderStatus(newStatus),
          }
        : row
    );
    setRows(updatedRows);

    // (Tùy chọn) Gọi API thật nếu cần sau này:
    // await eventApi.updateStatus(selectedEvent._id, newStatus);

    // Cập nhật selectedEvent tạm thời
    setSelectedEvent({ ...selectedEvent, status: newStatus });

    // Đóng dialog
    setOpenDialog(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
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
          <Button onClick={() => updateEventStatus("Từ chối")} color="error">Từ chối</Button>
          <Button onClick={() => updateEventStatus("Đã duyệt")} color="primary" variant="contained">Duyệt</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EventManagement;

import React, { useEffect, useState } from "react";
import {
  Grid, Card, Typography, Button, CircularProgress, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

import eventApi from "api/eventApi";

function EventManagement() {
  const [columns] = useState([
    { title: "Ảnh", field: "thumb", align: "center" },
    { title: "Tên sự kiện", field: "name", align: "left" },
    { title: "Ngày bắt đầu", field: "start", align: "center" },
    { title: "Giá vé", field: "price", align: "center" },
    { title: "Diễn ra", field: "timeline", align: "center" },
    { title: "Trạng thái", field: "status", align: "center" },
    { title: "Hành động", field: "actions", align: "center" },
  ]);
  const [rows, setRows] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

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
        }}
      >
        {status}
      </Typography>
    );
  };

  const renderTimeline = (start, end) => {
    const now = Date.now();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    let label = "Đang diễn ra", color = "#2e7d32";
    if (now < startTime) { label = "Sắp diễn ra"; color = "#d32f2f"; }
    else if (now > endTime) { label = "Đã diễn ra"; color = "#757575"; }

    return (
      <Typography
        variant="body2"
        sx={{
          backgroundColor: color,
          color: "#fff",
          fontWeight: "bold",
          fontSize: "0.75rem",
          borderRadius: "6px",
          padding: "4px 12px",
          display: "inline-block",
        }}
      >
        {label}
      </Typography>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await eventApi.getAllHome();
        if (!data?.status) return;

        const mapped = data.data.map(ev => ({
          id: ev._id,
          thumb: (
            <img
              src={ev.avatar}
              alt={ev.name}
              style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover" }}
            />
          ),
          name: (
            <Typography variant="body2" sx={{ whiteSpace: "normal", maxWidth: 200 }}>
              {ev.name}
            </Typography>
          ),
          start: new Date(ev.timeStart).toLocaleDateString("vi-VN"),
          price: `${(+ev.ticketPrice || 0).toLocaleString("vi-VN")} ₫`,
          timeline: renderTimeline(ev.timeStart, ev.timeEnd),
          status: renderStatus(ev.status ?? "Chưa duyệt"),
          actions: (
            <Button
              size="small"
              variant="contained"
              startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => openDetail(ev._id)}
              sx={{
                textTransform: "none",
                fontSize: 12,
                px: 1.5,
                background: "#64b5f6",
                "&:hover": { background: "#fff", color: "#64b5f6", border: "1px solid #64b5f6" },
              }}
            >
              Chi tiết
            </Button>
          ),
        }));
        setRows(mapped);
      } catch (e) {
        console.error("Fetch event list error:", e);
      } finally {
        setLoadingTable(false);
      }
    })();
  }, []);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await eventApi.getDetail(id);
      if (res.data.status) {
        setSelected(res.data.data);
        setDetailMode(true);
      }
    } catch (e) {
      console.error("Fetch detail error:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateEventStatus = (newStatus) => {
    if (!selected) return;
    setRows((prev) =>
      prev.map((r) => (r.id === selected._id ? { ...r, status: renderStatus(newStatus) } : r))
    );
    setSelected({ ...selected, status: newStatus });
    setConfirmDialogOpen(false);
    setDetailMode(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={2}>
        {detailMode ? (
          <Card sx={{ p: 3 }}>
            {loadingDetail ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: "bold",
                    mb: 2,
                  }}
                  onClick={() => setDetailMode(false)}
                >
                  Quay lại danh sách
                </Button>

                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {selected.name}
                </Typography>

                <img
                  src={selected.avatar}
                  alt={selected.name}
                  style={{
                    width: "100%",
                    height: 350,
                    objectFit: "cover",
                    borderRadius: 12,
                    border: "1px solid #ddd",
                  }}
                />

                <Grid container spacing={3} mt={1}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Địa điểm:</strong> {selected.location}</Typography>
                    <Typography><strong>Giá vé:</strong> {(selected.ticketPrice || 0).toLocaleString()} VNĐ</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Bắt đầu:</strong> {new Date(selected.timeStart).toLocaleString()}</Typography>
                    <Typography><strong>Kết thúc:</strong> {new Date(selected.timeEnd).toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box mt={2} sx={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 2, p: 2, maxHeight: 250, overflow: "auto" }}
                      dangerouslySetInnerHTML={{ __html: selected.description }}
                    />
                  </Grid>
                  <Grid item xs={12} display="flex" gap={2}>
                    <Button variant="outlined" color="error" startIcon={<CancelIcon />}
                      onClick={() => { setPendingStatus("Từ chối"); setConfirmDialogOpen(true); }}>
                      Từ chối
                    </Button>
                    <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />}
                      onClick={() => { setPendingStatus("Đã duyệt"); setConfirmDialogOpen(true); }}>
                      Duyệt
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
          </Card>
        ) : (
          <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
            <ArgonBox px={3} py={2} bgcolor="primary.main" color="#fff">
              <ArgonTypography variant="h5" fontWeight="bold">Danh sách sự kiện</ArgonTypography>
            </ArgonBox>
            <Divider />
            {loadingTable ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : (
              <Box sx={{ overflowX: "auto", minWidth: 840 }}>
                <Table columns={columns} rows={rows} />
              </Box>
            )}
          </Card>
        )}
      </ArgonBox>

      {/* Dialog xác nhận */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác nhận hành động</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn <strong>{pendingStatus === "Đã duyệt" ? "duyệt" : "từ chối"}</strong> sự kiện này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
          <Button onClick={() => updateEventStatus(pendingStatus)}>Xác nhận</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EventManagement;

import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Typography,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
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
    { name: "ảnh", align: "center" },
    { name: "tên sự kiện", align: "left" },
    { name: "ngày bắt đầu", align: "center" },
    { name: "giá vé", align: "center" },
    { name: "trạng thái diễn ra", align: "center" },
    { name: "trạng thái", align: "center" },
    { name: "hành động", align: "center" },
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
          textAlign: "center",
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
    if (now < startTime) {
      label = "Sắp diễn ra"; color = "#d32f2f";
    } else if (now > endTime) {
      label = "Đã diễn ra"; color = "#757575";
    }

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
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    );
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await eventApi.getAllHome();
        if (res.data.status) {
          const mapped = res.data.data.map((ev) => ({
            id: ev._id,
            ảnh: (
              <img
                src={ev.avatar}
                alt={ev.name}
                style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
              />
            ),
            "tên sự kiện": (
              <Typography variant="body2" sx={{ maxWidth: 180, whiteSpace: "normal" }}>
                {ev.name}
              </Typography>
            ),
            "ngày bắt đầu": new Date(ev.timeStart).toLocaleDateString("vi-VN"),
            "giá vé": `${(+ev.ticketPrice || 0).toLocaleString()} ₫`,
            "trạng thái diễn ra": renderTimeline(ev.timeStart, ev.timeEnd),
            "trạng thái": renderStatus(ev.status ?? "Chưa duyệt"),
            "hành động": (
              <Button
                variant="contained"
                size="small"
                startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => openDetail(ev._id)}
                sx={{
                  backgroundColor: "#64b5f6",
                  color: "#fff",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#fff",
                    color: "#64b5f6",
                    border: "1px solid #64b5f6",
                  },
                }}
              >
                Chi tiết
              </Button>
            ),
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error("Fetch list error:", e);
      } finally {
        setLoadingTable(false);
      }
    };
    fetchList();
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
      prev.map((r) => (r.id === selected._id ? { ...r, "trạng thái": renderStatus(newStatus) } : r))
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
                  variant="text"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    borderRadius: "8px",
                    textTransform: "none",
                    boxSizing: "border-box",
                    border: "1px solid #1976d2",
                    marginBottom: 2,
                    px: 2,
                    "&:hover": {
                      backgroundColor: "#fff",
                      color: "#1976d2",
                      border: "1px solid #1976d2",
                    },
                    alignSelf: "flex-start",
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
                    <Typography variant="body1">
                      <strong>Địa điểm:</strong> {selected.location}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Giá vé:</strong> {(selected.ticketPrice || 0).toLocaleString()} VNĐ
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Bắt đầu:</strong> {new Date(selected.timeStart).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Kết thúc:</strong> {new Date(selected.timeEnd).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      mt={2}
                      sx={{
                        background: "#f9f9f9",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        p: 2,
                        maxHeight: 250,
                        overflow: "auto",
                      }}
                      dangerouslySetInnerHTML={{ __html: selected.description }}
                    />
                  </Grid>

                  <Grid item xs={12} display="flex" gap={2} mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setPendingStatus("Từ chối");
                        setConfirmDialogOpen(true);
                      }}
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
                      onClick={() => {
                        setPendingStatus("Đã duyệt");
                        setConfirmDialogOpen(true);
                      }}
                      sx={{
                        textTransform: "none",
                        padding: "6px 20px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        minWidth: 120,
                        backgroundColor: "#fff",
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
                  </Grid>
                </Grid>
              </>
            )}
          </Card>
        ) : (
          <Card>
            <ArgonBox p={3}>
              <ArgonTypography variant="h5" fontWeight="bold" mb={1}>
                Danh sách sự kiện
              </ArgonTypography>
              {loadingTable ? (
                <Box display="flex" justifyContent="center" py={5}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table columns={columns} rows={rows} />
              )}
            </ArgonBox>
          </Card>
        )}
      </ArgonBox>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Xác nhận hành động</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn <strong>{pendingStatus === "Đã duyệt" ? "duyệt" : "từ chối"}</strong> sự kiện này không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              textTransform: "none",
              padding: "6px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              minWidth: 120,
              border: "1px solid",
              borderColor: "#f44336",
              color: "#f44336",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#f44336",
                color: "#fff",
              },
            }}
          >
            Hủy
          </Button>

          <Button
            onClick={() => {
              updateEventStatus(pendingStatus);
              setConfirmDialogOpen(false);
              setDetailMode(false);
            }}
            sx={{
              textTransform: "none",
              padding: "6px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              minWidth: 120,
              backgroundColor: "#1b5e20",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#",
                color: "#1b5e20",
                border: "1px solid",
                borderColor: "#1b5e20",
              },
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default EventManagement;

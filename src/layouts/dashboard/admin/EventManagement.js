// src/pages/EventManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Grid, Card, Typography, Button, CircularProgress, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Chip, useTheme,
  Pagination,
  TextField,
  InputAdornment
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PropTypes from "prop-types";
import SearchIcon from "@mui/icons-material/Search";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import eventApi from "api/eventApi";


const chipStatus = st => (
  <Chip
    label={st}
    size="small"
    color={st === "Đã duyệt" ? "success" : st === "Từ chối" ? "error" : "warning"}
  />
);

const chipTimeline = (s, e) => {
  const now = Date.now(), st = new Date(s).getTime(), ed = new Date(e).getTime();
  let lbl = "Đang diễn ra", col = "success", textColor = undefined;

  if (now < st) {
    lbl = "Sắp diễn ra";
    col = "warning";
  } else if (now > ed) {
    lbl = "Đã diễn ra";
    col = "default";
  } else {
    // Đang diễn ra
    textColor = "#ffffff";
  }

  return (
    <Chip
      label={lbl}
      size="small"
      color={col}
      sx={textColor ? { color: textColor } : undefined}
    />
  );
};

const getTimelineCategory = (start, end) => {
  const now = Date.now();
  const st = new Date(start).getTime();
  const ed = new Date(end).getTime();

  if (now < st) return 1;         // Sắp diễn ra
  if (now > ed) return 2;         // Đã diễn ra
  return 0;                       // Đang diễn ra
};



function EventManagement() {
  const [rows, setRows] = useState([]);
  const [loadingTbl, setLoadingTbl] = useState(true);

  const [detail, setDetail] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  const [dlg, setDlg] = useState({ open: false, status: "" });
  const theme = useTheme();

  const columns = [
    { title: "Ảnh", field: "thumb", align: "center", width: "80px" },
    { title: "Tên sự kiện", field: "name", align: "left", width: "30%" },
    { title: "Ngày bắt đầu", field: "start", align: "center", width: "120px" },
    { title: "Giá vé", field: "price", align: "center", width: "150px" },
    { title: "Diễn ra", field: "timeline", align: "center", width: "120px" },
    { title: "Trạng thái", field: "status", align: "center", width: "110px" },
    { title: "", field: "action", align: "center", width: "100px" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = rows.filter(r => {
  const nameText = typeof r.name === "string"
    ? r.name
    : r.name?.props?.children?.toLowerCase?.() || "";

  return nameText.includes(searchTerm.toLowerCase());
});

  /* ---------- fetch list ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await eventApi.getAllHome();
        const raw = data?.data || [];

        const filtered = raw.filter(ev => {
          const hasImage = ev.avatar && ev.avatar.trim() !== "";
          
          // Kiểm tra giá vé - hỗ trợ cả 2 cấu trúc dữ liệu
          let hasValidPrice = false;
          
          // Kiểm tra minTicketPrice và maxTicketPrice
          if (ev.minTicketPrice !== null && ev.minTicketPrice !== undefined && 
              ev.maxTicketPrice !== null && ev.maxTicketPrice !== undefined) {
            hasValidPrice = true;
          }
          // Nếu không có, kiểm tra ticketInfo (fallback)
          else if (ev.ticketInfo?.length > 0) {
            const validTickets = ev.ticketInfo.filter(t => t?.price != null);
            hasValidPrice = validTickets.length > 0;
          }
          
          return hasImage && hasValidPrice;
        });

        const mapped = filtered.map(ev => {
          let min, max;
          
          // Ưu tiên sử dụng minTicketPrice và maxTicketPrice
          if (ev.minTicketPrice !== null && ev.minTicketPrice !== undefined && 
              ev.maxTicketPrice !== null && ev.maxTicketPrice !== undefined) {
            min = ev.minTicketPrice;
            max = ev.maxTicketPrice;
          }
          // Fallback sử dụng ticketInfo nếu không có
          else if (ev.ticketInfo?.length > 0) {
            const prices = ev.ticketInfo.map(ticket => ticket.price).filter(price => price != null);
            if (prices.length > 0) {
              min = Math.min(...prices);
              max = Math.max(...prices);
            }
          }

          return {
            id: ev._id,
            thumb: (
              <img
                src={ev.avatar}
                alt={ev.name}
                onError={(e) => { e.target.style.display = "none"; }}
                style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }}
              />
            ),
            name: (
              <Typography variant="body2" sx={{
                fontSize: 14, fontWeight: 500,
                lineHeight: 1.4,
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {ev.name}
              </Typography>
            ),
            start: (
              <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
                {new Date(ev.timeStart).toLocaleDateString("vi-VN")}
              </Typography>
            ),
            price: (
              <Typography variant="body2" sx={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#1976d2",
                whiteSpace: "nowrap" 
              }}>
                {min === max
                  ? `${min.toLocaleString("vi-VN")}`
                  : `${min.toLocaleString("vi-VN")} - ${max.toLocaleString("vi-VN")}`}
              </Typography>
            ),
            timeline: chipTimeline(ev.timeStart, ev.timeEnd),
            status: chipStatus(ev.status || "Chưa duyệt"),
            action: (
              <Button
                size="small"
                variant="contained"
                color="info"
                startIcon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={() => openDetail(ev._id)}
                sx={{ 
                  textTransform: "none", 
                  fontSize: 11, 
                  px: 1.5, 
                  py: 0.5,
                  minWidth: "auto",
                  borderRadius: 1.5,
                  fontWeight: 500
                }}
              >
                Chi tiết
              </Button>
            ),
          };
        });

        const sorted = mapped.sort((a, b) => {
          const aCategory = getTimelineCategory(
            filtered.find(ev => ev._id === a.id)?.timeStart,
            filtered.find(ev => ev._id === a.id)?.timeEnd
          );
          const bCategory = getTimelineCategory(
            filtered.find(ev => ev._id === b.id)?.timeStart,
            filtered.find(ev => ev._id === b.id)?.timeEnd
          );
          return aCategory - bCategory;
        });

        setRows(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTbl(false);
      }
    })();
  }, []);

  const openDetail = async id => {
    setLoadingDet(true);
    try {
      const { data } = await eventApi.getDetail(id);
      if (data?.status) setDetail(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDet(false);
    }
  };

  const applyStatus = st => {
    setRows(prev => prev.map(r => r.id === detail._id ? { ...r, status: chipStatus(st) } : r));
    setDetail(null);
    setDlg({ open: false, status: "" });
  };

  /* ===================== RENDER ====================== */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box py={2}>
        {/* Danh sách hoặc chi tiết */}
        {!detail ? (
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <ArgonBox px={3} py={2} sx={{ bgcolor: "#5669FF", color: theme.palette.primary.contrastText }}>
              <ArgonTypography variant="h5" fontWeight="bold">
                Danh sách sự kiện
              </ArgonTypography>
            </ArgonBox>
            <Divider />
                 <ArgonBox px={3} py={2} mt={-3} >
                  <Box sx={{width: "30%"}}>
                      <TextField
                        fullWidth
                        padding="10"
                        size="small"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                  </Box>
                </ArgonBox>
            {loadingTbl ? (
              <Box py={8} display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
              <Box sx={{ overflowX: "auto", minHeight: 400 }}>
                <Table
                  columns={columns}
                  rows={filteredRows.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)}
                  sxTable={{
                    minWidth: 800,
                    tableLayout: "fixed",
                    "& th": { 
                      py: 2, 
                      px: 1.5, 
                      fontSize: 13, 
                      fontWeight: 600,
                      backgroundColor: "#f5f5f5",
                      borderBottom: "2px solid #e0e0e0",
                      whiteSpace: "nowrap"
                    },
                    "& td": { 
                      py: 1.5, 
                      px: 1.5, 
                      fontSize: 13,
                      borderBottom: "1px solid #f0f0f0",
                      verticalAlign: "center"
                    },
                    "& tbody tr:hover": { 
                      backgroundColor: "#f8f9ff",
                      cursor: "pointer"
                    },
                    "& tbody tr": {
                      transition: "background-color 0.2s ease"
                    }
                  }}
                />
                <Box display="flex" justifyContent="flex-end" py={2}>
                <Pagination
                  count={Math.ceil(filteredRows.length / eventsPerPage)}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
              </Box>
            )}
          </Card>
        ) : (
          <Card sx={{ p: 3 }}>
            {loadingDet ? (
              <Box py={5} display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
              <>
                <Box mb={2}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDetail(null)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      px: 2,
                      fontSize: 13,
                      borderRadius: 2,
                      backgroundColor: "#5669FF",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#115293" },
                    }}
                  >
                    Quay lại danh sách
                  </Button>
                </Box>

                <Box sx={{ width: "100%", height: 340, borderRadius: 2, overflow: "hidden", mb: 3 }}>
                  <img src={detail.avatar} alt={detail.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>

                <Typography variant="h5" fontWeight={700} mb={2}>{detail.name}</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Info label="Địa điểm" value={detail.location} />
                    {/* Hiển thị giá vé từ minTicketPrice và maxTicketPrice hoặc ticketInfo */}
                    {(() => {
                      // Kiểm tra minTicketPrice và maxTicketPrice trước
                      if (detail.minTicketPrice !== null && detail.minTicketPrice !== undefined && 
                          detail.maxTicketPrice !== null && detail.maxTicketPrice !== undefined) {
                        return (
                          <Info
                            label="Giá vé"
                            value={detail.minTicketPrice === detail.maxTicketPrice
                              ? `${detail.minTicketPrice.toLocaleString("vi-VN")} ₫`
                              : `${detail.minTicketPrice.toLocaleString("vi-VN")} ₫ - ${detail.maxTicketPrice.toLocaleString("vi-VN")} ₫`}
                          />
                        );
                      }
                      
                      // Nếu không có, kiểm tra ticketInfo (fallback cho cấu trúc cũ)
                      if (detail.ticketInfo?.length > 0) {
                        const prices = detail.ticketInfo.map(ticket => ticket.price).filter(price => price != null);
                        if (prices.length > 0) {
                          const min = Math.min(...prices);
                          const max = Math.max(...prices);
                          return (
                            <Info
                              label="Giá vé"
                              value={min === max
                                ? `${min.toLocaleString("vi-VN")} ₫`
                                : `${min.toLocaleString("vi-VN")} ₫ - ${max.toLocaleString("vi-VN")} ₫`}
                            />
                          );
                        }
                      }
                      
                      return null;
                    })()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Info label="Bắt đầu" value={new Date(detail.timeStart).toLocaleString()} />
                    <Info label="Kết thúc" value={new Date(detail.timeEnd).toLocaleString()} />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Mô tả chi tiết</Typography>
                    <Box
                      sx={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 2, p: 3, lineHeight: 1.75, fontSize: 15 }}
                      dangerouslySetInnerHTML={{ __html: detail.description }}
                    />
                  </Grid>

                  <Grid item xs={12} mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="contained"
                      onClick={() => setDlg({ open: true, status: "Từ chối" })}
                      sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#e53935", color: "#fff", "&:hover": { backgroundColor: "#c62828" } }}
                    >Từ chối</Button>
                    <Button
                      variant="contained"
                      onClick={() => setDlg({ open: true, status: "Đã duyệt" })}
                      sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#43a047", color: "#fff", "&:hover": { backgroundColor: "#388e3c" } }}
                    >Duyệt</Button>
                  </Grid>
                </Grid>
              </>
            )}
          </Card>
        )}
      </Box>

      <Dialog open={dlg.open} onClose={() => setDlg({ open: false, status: "" })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          Bạn chắc chắn muốn <strong>{dlg.status.toLowerCase()}</strong> sự kiện này?
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#e53935", color: "#fff", "&:hover": { backgroundColor: "#c62828" } }}
            onClick={() => setDlg({ open: false, status: "" })}
          >Hủy</Button>
          <Button
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600, backgroundColor: "#43a047", color: "#fff", "&:hover": { backgroundColor: "#388e3c" } }}
            onClick={() => applyStatus(dlg.status)}
          >Xác nhận</Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
}

const Info = ({ label, value }) => (
  <Typography variant="body2" sx={{ fontSize: 14, mb: 1.2 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

Info.propTypes = { label: PropTypes.string, value: PropTypes.node };


export default EventManagement;


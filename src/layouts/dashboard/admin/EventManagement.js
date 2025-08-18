// src/pages/EventManagement.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Divider,
  Chip,
  useTheme,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SearchIcon from "@mui/icons-material/Search";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import eventApi from "api/eventApi";

import PropTypes from "prop-types";
import ZoneSeatViewer from "../organizer/components/EventDetail/seat/ZoneSeatViewer";
import SelectMenu from "../organizer/OrganizerCreateNewEvent/components/SelectMenu";

const chipStatus = (st) => {
  const color =
    st === "Đã duyệt" ? "success" : st === "Từ chối duyệt" ? "error" : "warning";
  return <Chip label={st} size="small" color={color} sx={{ color: "#fff"}} />;
};

const chipTimeline = (start, end) => {
  const now = Date.now();
  const st = new Date(start).getTime();
  const ed = new Date(end).getTime();

  if (now < st) {
    return <Chip label="Sắp diễn ra" size="small" color="warning" />;
  }
  if (now > ed) {
    return <Chip label="Đã diễn ra" size="small" color="default" />;
  }
  // Đang diễn ra
  return <Chip label="Đang diễn ra" size="small" color="success" sx={{ color: "#fff" }} />;
};

const getTimelineCategory = (start, end) => {
  const now = Date.now();
  const st = new Date(start).getTime();
  const ed = new Date(end).getTime();

  if (now < st) return 1; // Sắp diễn ra
  if (now > ed) return 2; // Đã diễn ra
  return 0; // Đang diễn ra
};

const Info = ({ label, value }) => (
  <Typography variant="body2" sx={{ fontSize: 16, mb: 1.2 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);
Info.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

const InfoTag = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      fontSize: 14,
      mb: 1.2,
    }}
  >
    <Typography variant="body2" sx={{ fontSize: 16,  minWidth: 50 }}>
      <strong>{label}:</strong>
    </Typography>
    <Box sx={{ flexWrap: "wrap", display: "flex", gap: 1, flex: 1 }}>
      {value}
    </Box>
  </Box>
);
InfoTag.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

function EventManagement() {
  const theme = useTheme();

  const [rows, setRows] = useState([]);
  const [loadingTbl, setLoadingTbl] = useState(true);

  const [detail, setDetail] = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  const [dlg, setDlg] = useState({ open: false, status: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const uniqueZones = detail?.zoneTickets?.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
      acc.push(current);
    }
    return acc;
  }, []) || [];



  // Hàm lấy giá vé min/max từ event
  const getPriceRange = useCallback((ev) => {
    if (ev.minTicketPrice != null && ev.maxTicketPrice != null) {
      return [ev.minTicketPrice, ev.maxTicketPrice];
    }
    if (ev.ticketInfo?.length > 0) {
      const prices = ev.ticketInfo
        .map(t => t.price)
        .filter(p => p != null);
      if (prices.length > 0) {
        return [Math.min(...prices), Math.max(...prices)];
      }
    }
    return [null, null];
  }, []);


  // Hàm xử lý lọc, map và sắp xếp sự kiện
      const processEvents = useCallback((rawEvents) => {
      const filtered = rawEvents.filter(ev => {
        const hasImage = ev.avatar && ev.avatar.trim();
        const [minPrice, maxPrice] = getPriceRange(ev);
        return hasImage && minPrice != null && maxPrice != null;
      });

      const mapped = filtered.map(ev => {
        const [minPrice, maxPrice] = getPriceRange(ev);

        return {
          id: ev._id,
          rawData: ev,
          thumb: (
            <img
              src={ev.avatar}
              alt={ev.name || ""}
              style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          ),
          name: (
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.4,
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {ev.name || ""}
            </Typography>
          ),
          start: (
            <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
              {ev.timeStart
                ? new Date(ev.timeStart).toLocaleDateString("vi-VN")
                : ""}
            </Typography>
          ),
          price: (
          <Typography
              variant="body2"
              sx={{ fontSize: 13, fontWeight: 600, color: "#1976d2", whiteSpace: "nowrap" }}
            >
              {minPrice != null && maxPrice != null && minPrice !== 0 && maxPrice !== 0
                ? (minPrice === maxPrice
                    ? `${minPrice.toLocaleString("vi-VN")}`
                    : `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString("vi-VN")}`)
                : "Xem chi tiết"}
            </Typography>

          ),
          timeline: (ev.timeStart && ev.timeEnd)
            ? chipTimeline(ev.timeStart, ev.timeEnd)
            : "Xem chi tiết",
          status: chipStatus(
              ev.approvalStatus === null
                ? "Đã duyệt"
                : ev.approvalStatus === "pending"
                  ? "Chờ duyệt"
                  : ev.approvalStatus
          ),
          action: (
            <Button
              key={`btn-${ev._id}`}
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
                fontWeight: 500,
              }}
            >
              Chi tiết
            </Button>
          ),
        };
      });

      // Sắp xếp theo timeline category
      return mapped.sort((a, b) => {
        const aCat = getTimelineCategory(a.rawData.timeStart, a.rawData.timeEnd);
        const bCat = getTimelineCategory(b.rawData.timeStart, b.rawData.timeEnd);
        return aCat - bCat;
      });

    }, [getPriceRange]);



  // Lấy danh sách sự kiện lần đầu
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingTbl(true);
      try {
      const [homeRes, pendingRes] = await Promise.all([
        eventApi.getAllHome(),
        eventApi.getPendingApproval()
      ]);

       const homeEvents = homeRes.data?.data || [];
        const pendingEvents = pendingRes.data?.data.events || [];
    
        const homeMapped = homeEvents?.map(evt => ({
          _id: evt._id, // giữ nguyên _id để dùng trong processEvents
          name: evt.name,
          avatar: evt.avatar,
          timeStart: evt.timeStart,
          timeEnd: evt.timeEnd,
          location: evt.location,
          approvalStatus: evt.approvalStatus || null,
          minTicketPrice: evt.minTicketPrice,
          maxTicketPrice: evt.maxTicketPrice,
          ticketInfo: evt.ticketInfo || [] // thêm để getPriceRange hoạt động
        }));

        const pendingMapped = pendingEvents?.map(evt => ({
          _id: evt._id,
          name: evt.name,
          avatar: evt.avatar,
          createdAt: evt.createdAt,
          timeStart: evt.timeStart,
          timeEnd: evt.timeEnd,
          location: evt.location || "",
          approvalStatus: evt.approvalStatus || null,
          minTicketPrice: evt.minTicketPrice || 0,
          maxTicketPrice: evt.maxTicketPrice || 0,
          ticketInfo: evt.ticketInfo || []
        }));

        const rawEvents = [...homeMapped, ...pendingMapped];

        if (!mounted) return;
        const processed = processEvents(rawEvents);
        setRows(processed)
     

      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingTbl(false);
      }
    })();
    return () => { mounted = false; };
  }, [processEvents]);

  // Lọc theo search term (an toàn)
const filteredRows = useMemo(() => {
  return rows.filter((row) => {
    // --- Filter theo trạng thái ---
    if (approvalStatus) {
      const status = row.rawData.approvalStatus;
      if (approvalStatus === "approved" && !(status === "approved" || status === null)) return false;
      if (approvalStatus === "pending" && status !== "pending") return false;
    }

    // --- Filter theo search term ---
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      const text = typeof row.name === "string"
        ? row.name
        : row.name?.props?.children?.toString().toLowerCase() || "";
      if (!text.includes(lowerTerm)) return false;
    }

    return true; // Nếu qua hết filter thì giữ lại
  });
}, [rows, approvalStatus, searchTerm]);


  // Trang hiện tại dữ liệu phân trang
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * eventsPerPage;
    return filteredRows.slice(start, start + eventsPerPage);
  }, [filteredRows, currentPage]);

  // Mở chi tiết event
  const openDetail = useCallback(async (id) => {
    setLoadingDet(true);
    try {
      const { data } = await eventApi.getDetail(id);
      if (data?.status) {
        const detailData = {
          ...data.data,
          approvalStatus: data.data?.approvalStatus ?? null
        };
        console.log("[DEBUG] Detail từ API:", detailData);
        setDetail(detailData);
      }

      
    
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDet(false);
    }
  }, []);



  // Cập nhật trạng thái event trong rows khi duyệt/từ chối duyệt
    const applyStatus = useCallback(async (status) => {
      if (!detail) return;
      
      setLoadingDet(true);
      try {
        console.log(`Bắt đầu xử lý ${status} cho sự kiện ID: ${detail._id}`);
        if (status === "Đã duyệt") {
          const approveResponse = await eventApi.approveEvent(detail._id);
          console.log("Kết quả API duyệt sự kiện:", approveResponse);
        } else if (status === "Từ chối duyệt") {
          console.log("Gọi API từ chối duyệt sự kiện với lý do:", rejectReason);
          const rejectResponse = await eventApi.rejectEvent(detail._id, rejectReason);
          console.log("Kết quả API từ chối duyệt sự kiện:", rejectResponse);
        }

        setRows((prev) =>
          prev.map((r) =>
            r.id === detail._id ? { ...r, status: chipStatus(status) } : r
          )
        );

        setDetail(null);
        setDlg({ open: false, status: "" });
        setRejectReason(""); // reset lý do
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái event:", error);
      } finally {
        setLoadingDet(false);
      }
    }, [detail, rejectReason]);



  // Cột bảng
  const columns = useMemo(() => [
    { title: "Ảnh", field: "thumb", align: "center", width: "80px" },
    { title: "Tên sự kiện", field: "name", align: "left", width: "30%" },
    { title: "Ngày bắt đầu", field: "start", align: "center", width: "120px" },
    { title: "Giá vé", field: "price", align: "center", width: "150px" },
    { title: "Diễn ra", field: "timeline", align: "center", width: "120px" },
    { title: "Trạng thái", field: "status", align: "center", width: "110px" },
    { title: "", field: "action", align: "center", width: "100px" },
  ], []);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box py={2}>
        {!detail ? (
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <ArgonBox
              px={3}
              py={2}
              sx={{ bgcolor: "#5669FF", color: theme.palette.primary.contrastText }}
            >
              <ArgonTypography variant="h5" fontWeight="bold">
                Danh sách sự kiện
              </ArgonTypography>
            </ArgonBox>
            <Divider />
              <ArgonBox px={3} py={2} mt={-3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ width: "30%" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm"
              value={searchTerm}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 22, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </Box>
          <Box sx={{ width: "30%",  }}>
            <SelectMenu
              label="Trạng thái duyệt"
              value={approvalStatus}
              onChange={(val) => setApprovalStatus(val)}
              options={[
                { label: "Tất cả", value: "" },
                { label: "Đã duyệt", value: "approved" },
                { label: "Chờ duyệt", value: "pending" },
              ]}
            />
          </Box>
        </Box>
      </ArgonBox>


            {loadingTbl ? (
              <Box py={8} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto", minHeight: 400 }}>
                <Table
                  columns={columns}
                  rows={pagedRows}
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
                      whiteSpace: "nowrap",
                    },
                    "& td": {
                      py: 1.5,
                      px: 1.5,
                      fontSize: 13,
                      borderBottom: "1px solid #f0f0f0",
                      verticalAlign: "center",
                    },
                    "& tbody tr:hover": {
                      backgroundColor: "#f8f9ff",
                      cursor: "pointer",
                    },
                    "& tbody tr": {
                      transition: "background-color 0.2s ease",
                    },
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
              <Box py={5} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
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

                <Box
                  sx={{ width: "100%",  borderRadius: 2, overflow: "hidden", mb: 3 }}
                >
                  <img
                    src={detail.avatar}
                    alt={detail.name}
                    style={{ width: "100%"}}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </Box>

                <Typography variant="h5" fontWeight={700} mb={2}>
                  {detail.name}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Info label="Địa điểm" value={detail.location} />

                    {(() => {
                      const [min, max] = getPriceRange(detail);
                      if (min == null || max == null) return null;

                      return (
                        <Info
                          label="Giá vé"
                          value={
                            min === max
                              ? `${min.toLocaleString("vi-VN")} ₫`
                              : `${min.toLocaleString("vi-VN")} ₫ - ${max.toLocaleString("vi-VN")} ₫`
                          }
                        />
                      );
                    })()}
                  </Grid>
                    <Grid item xs={12} md={6}> 
                      <InfoTag
                          label="Tag"
                          value={
                            detail.tags?.length > 0 ? (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {detail.tags.map((t, idx) => (
                                  <Chip key={idx} label={t} size="small" />
                                ))}
                              </Box>
                            ) : (
                              "Không có tag"
                            )
                          }
                        />
                    </Grid>
                   


                  <Grid item xs={12} md={6}>
                    <Info label="Bắt đầu" value={new Date(detail.timeStart).toLocaleString()} />
                    <Info label="Kết thúc" value={new Date(detail.timeEnd).toLocaleString()} />
                  </Grid>

                <Grid item xs={12} md={12}>

                 {detail.typeBase === "zone" && uniqueZones.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Vé theo khu vực
                      </Typography>
                      <Grid container spacing={2}>
                        {uniqueZones.map((zone, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Box
                              sx={{
                                p: 2,
                                border: "1px solid #ddd",
                                borderRadius: 2,
                                backgroundColor: "#f9f9f9",
                              }}
                            >
                              <Typography variant="body2" sx={{fontSize: 16}}><strong>Khu vực:</strong> {zone.name}</Typography>
                              <Typography variant="body2" sx={{fontSize: 16}}>
                                <strong>Giá vé:</strong> {zone.price.toLocaleString("vi-VN")} ₫
                              </Typography >
                              <Typography variant="body2" sx={{fontSize: 16}}><strong>Số vé:</strong> {zone.totalTicketCount}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {detail.typeBase === "none" && detail.showtimes?.length > 1 && (
                      <Box mt={2}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Thông tin vé
                      </Typography>
                      <Box
                      >
                        <Typography variant="body2" sx={{ fontSize: 16 }}>
                          <strong>Giá vé:</strong> {detail.showtimes[1].ticketPrice?.toLocaleString("vi-VN")} ₫
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize:16 }}>
                          <strong>Số lượng vé:</strong> {detail.showtimes[0].ticketQuantity}
                        </Typography>
                      </Box>
                      </Box>
                      )}

                        {detail.typeBase === "seat" && detail.zones && (
                          <ZoneSeatViewer layout={detail.zones[0].layout} />
                        )}
                  </Grid>

                  <Grid item xs={12} md={12}>
                  {detail.showtimes?.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="h6" fontWeight="bold" mb={2}>
                        Suất diễn
                      </Typography>
                      {detail.showtimes.map((showtime, idx) => {
                        const start = new Date(showtime.startTime);
                        const end = new Date(showtime.endTime);

                        // Định dạng thời gian giờ:phút
                        const formatTime = (date) => date.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        });

                        // Định dạng ngày tháng
                        const formatDate = (date) => date.toLocaleDateString("vi-VN");

                        return (
                          <Typography variant="body2"  key={idx} sx={{ mb: 1, fontSize: 16 }}>
                          
                            <strong>Suất {`${idx + 1}`}:</strong> {`${formatTime(start)} - ${formatTime(end)} ${formatDate(start)}`}
 
                          </Typography>
                        );
                      })}
                    </Box>
                  )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>
                      Mô tả chi tiết
                    </Typography>
                    <Box
                      sx={{
                        background: "#f9f9f9",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        p: 3,
                        lineHeight: 1.75,
                        fontSize: 15,
                      }}
                      dangerouslySetInnerHTML={{ __html: detail.description }}
                    />
                  </Grid>
   
                  <Grid item xs={12} mt={2} display="flex" justifyContent="flex-end" gap={2}>
                      {detail.approvalStatus === "approved" || detail.approvalStatus == null ? (
                        <Chip
                          label="Đã duyệt"
                          color="success"
                          size="medium"
                          sx={{ color: "#fff" }}
                        />
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => setDlg({ open: true, status: "Từ chối duyệt" })}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              backgroundColor: "#e53935",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#c62828" },
                            }}
                          >
                            Từ chối
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => setDlg({ open: true, status: "Đã duyệt" })}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              backgroundColor: "#43a047",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#388e3c" },
                            }}
                          >
                            Duyệt
                          </Button>
                        </>
                      )}
                    </Grid>
                </Grid>
              </>
            )}
          </Card>
        )}
      </Box>

     <Dialog open={dlg.open} onClose={() => setDlg({ open: false, status: "" })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>
            Bạn chắc chắn muốn <strong>{dlg.status.toLowerCase()}</strong> sự kiện này?
          </Typography>

          {dlg.status === "Từ chối duyệt" && (
            <TextField
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#e53935",
              color: "#fff",
              "&:hover": { backgroundColor: "#c62828" },
            }}
            onClick={() => setDlg({ open: false, status: "" })}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#43a047",
              color: "#fff",
              "&:hover": { backgroundColor: "#388e3c" },
            }}
            onClick={() => applyStatus(dlg.status)}
            disabled={dlg.status === "Từ chối duyệt" && !rejectReason.trim()}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
}

export default EventManagement;

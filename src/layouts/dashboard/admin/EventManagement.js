import React, { useEffect, useState } from "react";
import {
  Grid, Card, Typography, Button, CircularProgress, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Chip, useTheme
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CancelIcon       from "@mui/icons-material/Cancel";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import PropTypes        from "prop-types";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import DashboardLayout  from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar  from "examples/Navbars/DashboardNavbar";
import Footer           from "examples/Footer";
import Table            from "examples/Tables/Table";
import eventApi         from "api/eventApi";

/* ───────── CHIP helpers ───────── */
const chipStatus = st => (
  <Chip
    label={st}
    size="small"
    color={st === "Đã duyệt" ? "success" : st === "Từ chối" ? "error" : "warning"}
  />
);

const chipTimeline = (s, e) => {
  const now = Date.now(), st = new Date(s).getTime(), ed = new Date(e).getTime();
  let lbl = "Đang diễn ra", col = "success";
  if (now < st)        { lbl = "Sắp diễn ra"; col = "warning"; }
  else if (now > ed)   { lbl = "Đã diễn ra";  col = "default"; }
  return <Chip label={lbl} size="small" color={col} />;
};

/* =================================================================== */
function EventManagement() {
  const [rows,       setRows]       = useState([]);
  const [loadingTbl, setLoadingTbl] = useState(true);

  const [detail,     setDetail]     = useState(null);
  const [loadingDet, setLoadingDet] = useState(false);

  const [dlg, setDlg] = useState({ open: false, status: "" });
const theme = useTheme();
  /* ---------- table cols ---------- */
  const columns = [
    { title:"Ảnh",         field:"thumb",    align:"center" },
    { title:"Tên sự kiện", field:"name",     align:"left"   },
    { title:"Ngày bắt đầu",field:"start",    align:"center" },
    { title:"Giá vé",      field:"price",    align:"center" },
    { title:"Diễn ra",     field:"timeline", align:"center" },
    { title:"Trạng thái",  field:"status",   align:"center" },
    { title:"",            field:"action",   align:"center" },
  ];

  /* ---------- fetch list ---------- */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await eventApi.getAllHome();
       const mapped = (data?.data || [])
  .filter(ev => ev.avatar && ev.avatar.trim() !== "") // lọc sự kiện lỗi ảnh
  .map(ev => ({
    id   : ev._id,
    thumb: (
      <img
        src={ev.avatar}
        alt={ev.name}
        onError={(e) => { e.target.style.display = "none"; }}
        style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover" }}
      />
    ),
    name : (
      <Typography variant="body2" sx={{
        maxWidth: 240, fontSize: 14, fontWeight: 500,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
      }}>
        {ev.name}
      </Typography>
    ),
    start   : new Date(ev.timeStart).toLocaleDateString("vi-VN"),
    price   : `${(+ev.ticketPrice || 0).toLocaleString("vi-VN")} ₫`,
    timeline: chipTimeline(ev.timeStart, ev.timeEnd),
    status  : chipStatus(ev.status || "Chưa duyệt"),
    action  : (
      <Button
        size="small"
        variant="contained"
        color="info"
        startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
        onClick={() => openDetail(ev._id)}
        sx={{ textTransform: "none", fontSize: 12, px: 2 }}
      >
        Chi tiết
      </Button>
    ),
  }));

        setRows(mapped);
      } catch (err) { console.error(err); }
      finally       { setLoadingTbl(false); }
    })();
  }, []);

  /* ---------- open detail ---------- */
  const openDetail = async id => {
    setLoadingDet(true);
    try {
      const { data } = await eventApi.getDetail(id);
      if (data?.status) setDetail(data.data);
    } catch (err) { console.error(err); }
    finally       { setLoadingDet(false); }
  };

  /* ---------- apply status ---------- */
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
        {/* LIST */}
        {!detail ? (
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <ArgonBox
  px={3}
  py={2}
  sx={{
    bgcolor: "#5669FF",
    color: theme.palette.primary.contrastText,
  }}
>
  <ArgonTypography variant="h5" fontWeight="bold">
    Danh sách sự kiện
  </ArgonTypography>
</ArgonBox>
            <Divider />
            {loadingTbl ? (
              <Box py={8} display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  columns={columns}
                  rows={rows}
                  sxTable={{
                    "& td, & th": { py: 1.25, fontSize: 13 },
                    "& tbody tr:hover": { background: "#eef7ff" },
                  }}
                />
              </Box>
            )}
          </Card>
        ) : (
        /* DETAIL */
        <Card sx={{ p: 3 }}>
          {loadingDet ? (
            <Box py={5} display="flex" justifyContent="center"><CircularProgress /></Box>
          ) : (
            <>
              {/* Back button */}
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

              {/* Banner */}
              <Box sx={{ width: "100%", height: 340, borderRadius: 2, overflow: "hidden", mb: 3 }}>
                <img src={detail.avatar} alt={detail.name}
                     style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>

              <Typography variant="h5" fontWeight={700} mb={2}>{detail.name}</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Info label="Địa điểm" value={detail.location} />
                  <Info label="Giá vé"   value={`${(+detail.ticketPrice || 0).toLocaleString()} ₫`} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Info label="Bắt đầu"  value={new Date(detail.timeStart).toLocaleString()} />
                  <Info label="Kết thúc" value={new Date(detail.timeEnd).toLocaleString()} />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>Mô tả chi tiết</Typography>
                  <Box sx={{
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

                {/* Buttons */}
                <Grid item xs={12} mt={2} display="flex" justifyContent="flex-end" gap={2}>
                  <Button
                    variant="contained"
                    onClick={() => setDlg({ open: true, status: "Từ chối" })}
                    sx={{
                      textTransform: "none", fontWeight: 600,
                      backgroundColor: "#e53935", color: "#fff",
                      "&:hover": { backgroundColor: "#c62828" },
                    }}
                  >
                    Từ chối
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setDlg({ open: true, status: "Đã duyệt" })}
                    sx={{
                      textTransform: "none", fontWeight: 600,
                      backgroundColor: "#43a047", color: "#fff",
                      "&:hover": { backgroundColor: "#388e3c" },
                    }}
                  >
                    Duyệt
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Card>
        )}
      </Box>

      {/* Confirm dialog */}
      <Dialog open={dlg.open} onClose={() => setDlg({ open: false, status: "" })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          Bạn chắc chắn muốn&nbsp;
          <strong>{dlg.status.toLowerCase()}</strong>&nbsp;sự kiện này?
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            variant="contained"
            sx={{
              textTransform: "none", fontWeight: 600,
              backgroundColor: "#e53935", color: "#fff",
              "&:hover": { backgroundColor: "#c62828" },
            }}
            onClick={() => setDlg({ open: false, status: "" })}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none", fontWeight: 600,
              backgroundColor: "#43a047", color: "#fff",
              "&:hover": { backgroundColor: "#388e3c" },
            }}
            onClick={() => applyStatus(dlg.status)}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

/* -------- small Info row -------- */
const Info = ({ label, value }) => (
  <Typography variant="body2" sx={{ fontSize: 14, mb: 1.2 }}>
    <strong>{label}:</strong> {value}
  </Typography>
);

Info.propTypes = { label: PropTypes.string, value: PropTypes.node };

export default EventManagement;

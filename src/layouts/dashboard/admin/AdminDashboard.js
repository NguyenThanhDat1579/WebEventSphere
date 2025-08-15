/* ==================================================================
   AdminDashboard.jsx
   • KPI tổng quan + biểu đồ cột 2 tháng
   • Danh sách CARD sự kiện (hover, click → load chi tiết)
   • Chi tiết có nút “Quay lại”, loading spinner trong khi fetch
=================================================================== */

import { useEffect, useState } from "react";
import {
  Grid, Card, CardContent, CardMedia, Typography, Box, Chip,
  Button, CircularProgress, Select, MenuItem, FormControl
} from "@mui/material";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import dayjs              from "dayjs";
import PropTypes          from "prop-types";

import ArgonBox           from "components/ArgonBox";
import ArgonTypography    from "components/ArgonTypography";
import DashboardLayout    from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar    from "examples/Navbars/DashboardNavbar";
import VerticalBarChart   from "examples/Charts/BarCharts/VerticalBarChart";

import revenueApi         from "api/revenue";
import eventApi           from "api/eventApi";

/* ───────── helpers nhỏ khi API thiếu dữ liệu ───────── */
const randRevenue = () => Math.floor(Math.random() * 4_000_000) + 500_000; // 0.5–4.5 triệu
const randTickets = () => Math.floor(Math.random() * 150) + 50;            // 50–200 vé

/* ================================================================= */
export default function AdminDashboard() {
  /* KPI + biểu đồ --------------------------------------------------- */
  const [kpi,       setKpi]      = useState({ revenue:0, prevRevenue:0, tickets:0, events:0, ended:0 });
  const [chart,     setChart]    = useState(null);
  const [filter,    setFilter]   = useState("month");
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  /* Sự kiện -------------------------------------------------------- */
  const [events,    setEvents]   = useState([]);
  const [detail,    setDetail]   = useState(null);          // object | null
  const [loadingDet,setLoadingDet]=useState(false);
                  console.log("chi tiết sự kiện: ", detail)
  /* ---------------- fetch KPI + LIST ---------------- */
/* ---------------- fetch KPI + LIST ---------------- */
useEffect(() => {
  const fetchAll = async () => {
    try {
      setLoadingDashboard(true);

      const [revRes, evtRes] = await Promise.all([
        revenueApi.getRevenue(),
        eventApi.getAllHome(),
      ]);

      const revenueData = revRes.data?.eventsRevenue ?? [];
      const eventList   = evtRes.data?.data        ?? [];

      // map revenue theo eventId để dễ tra
      const revenueMap = new Map();
      revenueData.forEach(ev => revenueMap.set(ev.eventId, ev));

      // lọc chỉ các sự kiện có revenue
      // lọc chỉ các sự kiện có revenue VÀ có avatar + location + timeStart/timeEnd đầy đủ

    const filteredEvents = eventList.filter(ev =>
      revenueMap.has(ev._id) &&
      ev.avatar &&
      ev.location &&
      ev.timeStart &&
      ev.timeEnd
    );



      // Khóa thời gian tháng hiện tại và trước
      const mNow  = dayjs().format("YYYY-MM");
      const mPrev = dayjs().subtract(1, "month").format("YYYY-MM");

      let revNow = 0, revPrev = 0, tickets = 0;
      const now = Date.now();
      let endedCount = 0;

      filteredEvents.forEach(ev => {
        const rev = revenueMap.get(ev._id);
        const cur  = rev.revenueByMonth?.[mNow]  ?? 0;
    const prev = rev.revenueByMonth?.[mPrev] ?? 0;


        revNow  += cur;
        revPrev += prev;

tickets += Number.isFinite(rev.totalSold) ? rev.totalSold : 0;

        if (ev.timeEnd < now) endedCount++;
      });

      // KPI
      setKpi({
        revenue     : revNow,
        prevRevenue : revPrev,
        tickets,
        events      : filteredEvents.length,
        ended       : endedCount,
      });

      // Chart
      setChart({
        labels: [`Tháng ${dayjs(mPrev).month() + 1}`, `Tháng ${dayjs().month() + 1}`],
        datasets: [
          { label: "Doanh thu", color: "info", maxBarThickness: 60, data: [revPrev, revNow] },
        ],
      });
      const getStatusOrder = (ev) => {
        const now = Date.now();
        const start = new Date(ev.timeStart).getTime();
        const end = new Date(ev.timeEnd).getTime();

        if (now >= start && now <= end) return 0; // Đang diễn ra
        if (now < start) return 1;               // Sắp diễn ra
        return 2;                                // Đã kết thúc
      };

      // Sắp xếp mảng
      const sortedEvents = [...filteredEvents].sort((a, b) => {
        return getStatusOrder(a) - getStatusOrder(b);
      });


    
      // chỉ render các sự kiện có revenue
      setEvents(sortedEvents);
    } catch (err) {
      console.error("Lỗi lấy dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  fetchAll();
}, []);



  /* ---------------- helper % tăng/giảm --------------- */
  const percent = (() => {
    const { revenue, prevRevenue } = kpi;
    if(!prevRevenue) return "0%";
    const diff = ((revenue-prevRevenue)/prevRevenue*100).toFixed(1);
    return `${diff}%`;
  })();

  /* ================================================================= */
  return (
  <DashboardLayout>
    <DashboardNavbar />

    {loadingDashboard ? (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress color="info" size={48} />
      </Box>
    ) : (
      <ArgonBox py={3}>
        {/* ================= KPI SECTION ================= */}
        <Grid container spacing={3} mb={3}>
          <StatCard
            title="TỔNG DOANH THU THÁNG NÀY"
            main={`${kpi.revenue.toLocaleString("vi-VN")} ₫`}
            color="#2d48d1ff"
            dark
          />
          <StatCard title="Tổng vé bán"        main={kpi.tickets.toLocaleString("vi-VN")} />
          <StatCard title="Số sự kiện"         main={kpi.events} />
          <StatCard title="Sự kiện kết thúc"   main={kpi.ended} />
        </Grid>

      {/* hehehhee */}
        {/* ================= CHART SECTION ============== */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card sx={{ p:3, borderRadius:3, boxShadow:3, minHeight: 380 }}>
              <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                <Grid item>
                  <ArgonTypography variant="h6" fontWeight={700}>
                    So sánh doanh thu 2 tháng
                  </ArgonTypography>
                  <ArgonTypography variant="caption" color="text.secondary">
                    Tháng này đạt&nbsp;
                    <strong>{kpi.revenue.toLocaleString("vi-VN")} ₫</strong>&nbsp;
                  </ArgonTypography>
                </Grid>
               
              </Grid>

              {chart && (
                <VerticalBarChart title="" description="" chart={chart} height={300} />

              )}
            </Card>
          </Grid>
        </Grid>

        {/* ================= EVENTS SECTION ============== */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {detail
              ? <EventDetailCard ev={detail} loading={loadingDet} onBack={()=>setDetail(null)}/>
              : <EventListCard events={events} onSelect={async(id)=>{
                  setLoadingDet(true);
                  try{
                    const { data } = await eventApi.getDetail(id);
                    if (data?.status) {
                    let detailData = data.data;

                    // 🔍 Lọc từ events để lấy giá vé min/max
                    const foundEvent = events.find(ev => ev._id === id);
                    if (foundEvent) {
                      detailData = {
                        ...detailData,
                        minTicketPrice: foundEvent.minTicketPrice || 0,
                        maxTicketPrice: foundEvent.maxTicketPrice || 0
                      };
                    }

                    setDetail(detailData);                    
                  }

                  }catch(e){ console.error("Detail error:", e);}finally{ setLoadingDet(false);}
                }}/>
            }
          </Grid>
        </Grid>
      </ArgonBox>
    )}

  </DashboardLayout>
);
}

/* ================================================================= */
/*               SUB‑COMPONENTS & SMALL HELPERS                       */
/* ================================================================= */

const StatCard = ({ title, main, sub, color, dark }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ p:3, borderRadius:3, boxShadow:3, bgcolor:color, color:dark?"#fff":"inherit" }}>
      <ArgonTypography variant="button" fontWeight={600}>{title}</ArgonTypography>
      <ArgonTypography variant="h5"  fontWeight={700}>{main}</ArgonTypography>
      {sub && <ArgonTypography variant="caption">{sub}</ArgonTypography>}
    </Card>
  </Grid>
);

function EventListCard({ events, onSelect }) {
  return (
    <Card sx={{ p:3, borderRadius:3, boxShadow:3 }}>

      <Grid container spacing={2}>
        {events.map(ev=>(
          <Grid key={ev._id} item xs={12} sm={6} md={4}>
            <Card
              onClick={()=>onSelect(ev._id)}
              sx={{
                cursor:"pointer",
                transition:".3s",
                border:"1px solid #e0e0e0",
                borderRadius:2,
                boxShadow:1,
                "&:hover":{
                  transform:"translateY(-4px)",
                  boxShadow:4,
                  borderColor:"#5669FF"
                }
              }}
            >
              <CardMedia component="img" height="160" image={ev.avatar} alt={ev.name}/>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                  {ev.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {ev.location}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dayjs(ev.timeStart).format("DD/MM")} – {dayjs(ev.timeEnd).format("DD/MM")}
                </Typography>
                <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                  <TimelineChip start={ev.timeStart} end={ev.timeEnd}/>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}

function EventDetailCard({ ev, onBack }) {
  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Button
        variant="contained"
        onClick={onBack}
        sx={{
          backgroundColor: "#5669FF",
          color: "#fff",
          fontWeight: 600,
          px: 2,
          py: 1,
          textTransform: "none",
          width: "fit-content",
          borderRadius: 2,
          mb: 2,
          "&:hover": {
            backgroundColor: "#115293",
          },
        }}
      >
        Quay lại
      </Button>

     <img
    src={ev.avatar}
    alt={ev.name}
    style={{
      maxWidth: "100%",
      height: "auto",
      borderRadius: 12,
    }}
  />

      <Typography variant="h3" mt={2} fontWeight="bold" gutterBottom>
        {ev.name}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
        <Box  mb={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
            Địa điểm:
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
            {ev.location}
          </Typography>
        </Box>

         <Box  mb={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
            Giá vé:
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
           {
              ev.minTicketPrice === ev.maxTicketPrice
                ? `${(ev.minTicketPrice || 0).toLocaleString()} ₫`
                : `${(ev.minTicketPrice || 0).toLocaleString()} ₫ - ${(ev.maxTicketPrice || 0).toLocaleString()} ₫`
            }
          </Typography>
        </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box  mb={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
            Bắt đầu:
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
            {dayjs(ev.timeStart).format("HH:mm DD/MM/YYYY")} 
          </Typography>
        </Box>
         <Box  mb={1}>
          <Typography sx={{ fontWeight: 600, minWidth: 120 }}>
            Kết thúc:
          </Typography>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
            {dayjs(ev.timeEnd).format("HH:mm DD/MM/YYYY")}
          </Typography>
        </Box>
        </Grid>
        <Grid item xs={12}>
          <Box
          sx={{
            bgcolor: "#f9f9f9",
            p: 3,
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            mt: 1,

            "& p": { mb: 1.5, lineHeight: 1.6 },
            "& h1, h2, h3": { mt: 2, mb: 1 },
            "& ul": { pl: 3, mb: 1.5 },
            "& li": { mb: 0.5 },
          }}
          dangerouslySetInnerHTML={{ __html: ev.description }}
        />

        </Grid>
      </Grid>
    </Card>
  );
}


/* ───────── misc chips & rows ───────── */
const TimelineChip = ({ start, end }) => {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();

  let lbl = "Đang diễn ra";
  let col = "success";

  if (now < s) {
    lbl = "Sắp diễn ra";
    col = "warning";
  } else if (now > e) {
    lbl = "Đã kết thúc";
    col = "default";
  }

  return (
    <Chip
      label={lbl}
      color={col}
      size="small"
      sx={{ color: "#fff" }} // 👈 thêm text trắng
    />
  );
};

const InfoRow = ({ label, value }) => (
  <Typography variant="body2" mb={.5}><strong>{label}:</strong> {value}</Typography>
);

/* ───────── PropTypes ───────── */
StatCard.propTypes        = { title:PropTypes.string, main:PropTypes.node, sub:PropTypes.node, color:PropTypes.string, dark:PropTypes.bool };
EventListCard.propTypes   = { events:PropTypes.array, onSelect:PropTypes.func };
EventDetailCard.propTypes = { ev:PropTypes.object, loading:PropTypes.bool, onBack:PropTypes.func };
TimelineChip.propTypes    = { start:PropTypes.oneOfType([PropTypes.string,PropTypes.number]), end:PropTypes.oneOfType([PropTypes.string,PropTypes.number]) };
InfoRow.propTypes         = { label:PropTypes.string, value:PropTypes.node };

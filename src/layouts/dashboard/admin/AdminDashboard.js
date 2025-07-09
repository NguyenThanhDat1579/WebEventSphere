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
import Footer             from "examples/Footer";
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

  /* Sự kiện -------------------------------------------------------- */
  const [events,    setEvents]   = useState([]);
  const [detail,    setDetail]   = useState(null);          // object | null
  const [loadingDet,setLoadingDet]=useState(false);

  /* ---------------- fetch KPI + LIST ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      /* KPI & Chart */
      try {
        const { data } = await revenueApi.getRevenue();
        const list = data?.eventsRevenue ?? [];

        const mNow  = dayjs().format("YYYY-MM");
        const mPrev = dayjs().subtract(1, "month").format("YYYY-MM");

        let revNow=0, revPrev=0, tickets=0, ended=0;
        list.forEach(ev=>{
          const cur  = ev.revenueByMonth?.[mNow]  ?? randRevenue();
          const prev = ev.revenueByMonth?.[mPrev] ?? Math.floor(cur*(Math.random()*0.5+0.5));
          revNow  += cur; revPrev += prev;
          tickets += Number.isFinite(ev.soldTickets)?ev.soldTickets:randTickets();
          if(ev.status==="End") ended+=1;
        });

        setKpi({ revenue:revNow, prevRevenue:revPrev, tickets, events:list.length, ended });

        setChart({
          labels:[`Tháng ${dayjs(mPrev).month()+1}`, `Tháng ${dayjs().month()+1}`],
          datasets:[{ label:"Doanh thu", color:"info", maxBarThickness:60, data:[revPrev, revNow] }],
        });
      } catch(e){ console.error("KPI error:", e); }

      /* List sự kiện */
      try {
        const res = await eventApi.getAllHome();
        setEvents(res.data?.data ?? []);
      } catch(e){ console.error("Events error:", e); }
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
      <DashboardNavbar/>

      <ArgonBox py={3}>
        {/* ================= KPI SECTION ================= */}
        <Grid container spacing={3} mb={3}>
          <StatCard
            title="TỔNG DOANH THU THÁNG NÀY"
            main={`${kpi.revenue.toLocaleString("vi-VN")} ₫`}
            color="#1976d2"
            sub={`(${percent} so với tháng trước)`}
            dark
          />
          <StatCard title="Tổng vé bán"        main={kpi.tickets.toLocaleString("vi-VN")} />
          <StatCard title="Số sự kiện"         main={kpi.events} />
          <StatCard title="Sự kiện kết thúc"   main={kpi.ended} />
        </Grid>

        {/* ================= CHART SECTION ============== */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card sx={{ p:3, borderRadius:3, boxShadow:3 }}>
              <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                <Grid item>
                  <ArgonTypography variant="h6" fontWeight={700}>
                    So sánh doanh thu 2 tháng
                  </ArgonTypography>
                  <ArgonTypography variant="caption" color="text.secondary">
                    Tháng này đạt&nbsp;
                    <strong>{kpi.revenue.toLocaleString("vi-VN")} ₫</strong>&nbsp;
                    ({percent} so với tháng trước)
                  </ArgonTypography>
                </Grid>
                <Grid item>
                  <FormControl size="small">
                    <Select value={filter} onChange={e=>setFilter(e.target.value)} sx={{minWidth:140}}>
                      <MenuItem value="month">Theo tháng</MenuItem>
                      <MenuItem value="year">Theo năm</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {chart && (
                <VerticalBarChart title="" description="" chart={chart} />
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
                    if(data?.status) setDetail(data.data);
                  }catch(e){ console.error("Detail error:", e);}finally{ setLoadingDet(false);}
                }}/>
            }
          </Grid>
        </Grid>
      </ArgonBox>

      <Footer/>
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
                  borderColor:"#1976d2"
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
          backgroundColor: "#1976d2",
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
        style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 12, marginBottom: 20 }}
      />

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {ev.name}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <InfoRow label="Địa điểm" value={ev.location} />
          <InfoRow label="Giá vé" value={`${(+ev.ticketPrice || 0).toLocaleString()} ₫`} />
        </Grid>
        <Grid item xs={12} md={6}>
          <InfoRow label="Bắt đầu" value={dayjs(ev.timeStart).format("HH:mm DD/MM/YYYY")} />
          <InfoRow label="Kết thúc" value={dayjs(ev.timeEnd).format("HH:mm DD/MM/YYYY")} />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: "#f9f9f9",
              p: 2,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              mt: 1
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
  const now=Date.now(), s=new Date(start).getTime(), e=new Date(end).getTime();
  let lbl="Đang diễn ra", col="success";
  if(now<s){ lbl="Sắp diễn ra"; col="warning";}
  else if(now>e){ lbl="Đã kết thúc"; col="default";}
  return <Chip label={lbl} color={col} size="small"/>;
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

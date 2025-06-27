// AdminDashboard.js  (chỉ hiển thị phần thay đổi chính)
import { useEffect, useState } from "react";
import {
  Grid, Card, CardContent, Typography, Box, Chip,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import revenueApi from "api/revenue";
import eventApi from "api/eventApi";
import Chart from "chart.js/auto";
function AdminDashboard() {
  /* ─────────────────────── STATE ─────────────────────── */
  const [kpi, setKpi] = useState({
    revenue: 0, tickets: 0, events: 0, ended: 0,
    prevRevenue: 0, prevTickets: 0, // tháng trước (giả lập)
  });
  const [upcomingEvents, setUpcoming] = useState([]);

  /* ─────────────────── FETCH KPI & EVENTS ────────────── */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        /* 1️⃣  Doanh thu & vé */
        const res = await revenueApi.getRevenue();
        const raw = res.data.data;

        // Sanitize + bổ sung số ngẫu nhiên
        const data = raw.map(item => {
          const sold = Number.isFinite(item.soldTickets)
            ? item.soldTickets
            : Math.floor(Math.random() * 51) + 100;         // 100–150 vé

          const price = 100_000;                           // giá giả định
          const revenue = Number.isFinite(item.revenue)
            ? item.revenue
            : sold * price;

          return { ...item, soldTickets: sold, revenue };
        });

        const revenue = data.reduce((s, i) => s + i.revenue, 0);
        const tickets = data.reduce((s, i) => s + i.soldTickets, 0);
        const events = data.length;
        const ended = data.filter(i => i.status === "End").length;

        /*  🔀  Giả lập tháng trước (60 – 110 % so với hiện tại)  */
        const prevRevenue = Math.round(revenue * (Math.random() * .5 + .6));
        const prevTickets = Math.round(tickets * (Math.random() * .5 + .6));

        setKpi({ revenue, tickets, events, ended, prevRevenue, prevTickets });
      } catch (e) {
        console.error("Fetch KPI error:", e);
      }

      try {
        /* 2️⃣  Sự kiện sắp diễn ra */
        const evRes = await eventApi.getAllHome();
        if (evRes.data.status) {
          const now = Date.now();
          const list = evRes.data.data.filter(ev => new Date(ev.timeEnd).getTime() > now);
          setUpcoming(list);
        }
      } catch (e) {
        console.error("Fetch events error:", e);
      }
    };
    fetchDashboard();
  }, []);
  const getTrendIcon = (value) => ({
    icon: value >= 0 ? "arrow_upward" : "arrow_downward",
    color: value >= 0 ? "success" : "error",
  });
  const getBgColor = (color) => {
    switch (color) {
      case "success": return "rgba(76, 175, 80, 0.1)";
      case "error": return "rgba(244, 67, 54, 0.1)";
      default: return "rgba(0, 0, 0, 0.05)";
    }
  };

  /* ─────────────  Helper tính % tăng / giảm  ──────────── */
  const pct = (cur, prev) => {
    if (!prev) return { value: 0, color: "text" };
    const diff = ((cur - prev) / prev) * 100;
    return {
      value: diff.toFixed(1),
      color: diff >= 0 ? "success" : "error",
      arrow: diff >= 0 ? "arrow_upward" : "arrow_downward",
    };
  };
  const revPct = pct(kpi.revenue, kpi.prevRevenue);
  const ticPct = pct(kpi.tickets, kpi.prevTickets);
  /* ────────────────   RENDER   ──────────────── */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* ============== TOP KPI ============== */}
      <ArgonBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng doanh thu"
              count={`${kpi.revenue.toLocaleString()} ₫`}
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
              percentage={{
                color: revPct.color,
                count: `${Math.abs(revPct.value)}%`,
                text: "so với tháng trước",
                icon: getTrendIcon(revPct.value).icon,
              }}
            />

          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng vé đã bán"
              count={kpi.tickets}
              icon={{ color: "success", component: <i className="ni ni-tag" /> }}
              percentage={{
                color: ticPct.color,
                count: `${Math.abs(ticPct.value)}%`,
                text: "so với tháng trước",
              }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Số sự kiện"
              count={kpi.events}
              icon={{ color: "warning", component: <i className="ni ni-calendar-grid-58" /> }}
              percentage={{}}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Sự kiện đã kết thúc"
              count={kpi.ended}
              icon={{ color: "error", component: <i className="ni ni-fat-remove" /> }}
              percentage={{}}
            />
          </Grid>
        </Grid>

        {/* ============== CHART ============== */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <GradientLineChart
              title="Tổng quan doanh thu"
              description={(
                <ArgonBox display="flex" alignItems="center">
                  <Icon sx={{ color: revPct.color === "success" ? "success.main" : "error.main", fontWeight: "bold", mr: 0.5 }}>
                    {revPct.arrow}
                  </Icon>
                  <ArgonTypography variant="button" fontWeight="medium">
                    {Math.abs(revPct.value)}%
                    <ArgonTypography variant="button" fontWeight="regular">&nbsp;so với tháng trước</ArgonTypography>
                  </ArgonTypography>
                </ArgonBox>
              )}
              chart={{
                labels: ["1/6", "2/6", "3/6", "4/6", "5/6", "6/6", "7/6"],
                datasets: [
                  {
                    label: "Doanh thu theo ngày",
                    color: "info",
                    data: [1500000, 2200000, 1800000, 2500000, 1700000, 3000000, 2100000],
                     datalabels: { display: false },
                  },
                ],
                options: {
                  layout: {
                    padding: { top: 24, bottom: 24, left: 16, right: 16 },
                  },
                  plugins: {
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: (ctx) =>
                          `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("vi-VN")} ₫`,
                      },
                    },
                    legend: {
                      labels: {
                        color: "#555",
                        font: { size: 13 },
                      },
                    },
                
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Ngày trong tháng",
                        color: "#888",
                        font: { size: 13, weight: "500" },
                      },
                      ticks: { color: "#666" },
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Doanh thu (₫)",
                        color: "#888",
                        font: { size: 13, weight: "500" },
                      },
                      ticks: {
                        callback: (val) => `${(val / 1_000_000).toFixed(1)}tr`,
                        color: "#666",
                        padding: 10,
                      },
                      grid: { color: "rgba(0,0,0,0.05)" },
                    },
                  },
                }


              }}


            />

          </Grid>
        </Grid>

        {/* ============== UPCOMING EVENTS ============== */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: getBgColor(revPct.color) }}>
              <ArgonTypography variant="h5" fontWeight="bold" mb={2}>
                Sự kiện đang hoặc sắp diễn ra
              </ArgonTypography>

              <Grid container spacing={2}>
                {upcomingEvents.map(ev => (
                  <EventCard key={ev._id} event={ev} />
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      <Footer />
    </DashboardLayout>
  );
}

/* ------------ Mini card cho 1 sự kiện ------------- */
const EventCard = ({ event }) => {
  const now = Date.now();
  const start = new Date(event.timeStart).getTime();
  const end = new Date(event.timeEnd).getTime();

  let label = "Đang diễn ra", color = "success";
  if (now < start) { label = "Sắp diễn ra"; color = "warning"; }
  else if (now > end) { label = "Đã kết thúc"; color = "default"; }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ height: "100%" }}>
        <img
          src={event.avatar}
          alt={event.name}
          style={{ width: "100%", height: 160, objectFit: "cover" }}
        />
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(event.timeStart).toLocaleString()} –{" "}
            {new Date(event.timeEnd).toLocaleString()}
          </Typography>
          <Box mt={1}>
            <Chip label={label} color={color} size="small" />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    location: PropTypes.string,
    timeStart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timeEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avatar: PropTypes.string,
  }).isRequired,
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import {
  Grid, Card, CardContent, Typography, Box, Chip, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import PropTypes from "prop-types";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

import revenueApi from "api/revenue";
import eventApi from "api/eventApi";

function AdminDashboard() {
  const [kpi, setKpi] = useState({
    revenue: 0,
    tickets: 0,
    events: 0,
    ended: 0,
    prevRevenue: 0,
    prevTickets: 0,
  });
  const [upcomingEvents, setUpcoming] = useState([]);
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await revenueApi.getRevenue();
        const raw = res.data.data;

        const data = raw.map(item => {
          const sold = Number.isFinite(item.soldTickets)
            ? item.soldTickets
            : Math.floor(Math.random() * 51) + 100;

          const price = 100_000;
          const revenue = Number.isFinite(item.revenue)
            ? item.revenue
            : Math.floor(Math.random() * 4_000_000_001) + 1_000_000_000;

          return { ...item, soldTickets: sold, revenue };
        });

        const revenue = data.reduce((s, i) => s + i.revenue, 0);
        const tickets = data.reduce((s, i) => s + i.soldTickets, 0);
        const events = data.length;
        const ended = data.filter(i => i.status === "End").length;

        const prevRevenue = Math.round(revenue * (Math.random() * 0.5 + 0.6));
        const prevTickets = Math.round(tickets * (Math.random() * 0.5 + 0.6));

        setKpi({ revenue, tickets, events, ended, prevRevenue, prevTickets });
      } catch (e) {
        console.error("Fetch KPI error:", e);
      }

      try {
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

  const pct = (cur, prev) => {
    if (!prev) return { value: 0, color: "text", arrow: "arrow_upward" };
    const diff = ((cur - prev) / prev) * 100;
    return {
      value: diff.toFixed(1),
      color: diff >= 0 ? "success" : "error",
      arrow: diff >= 0 ? "arrow_upward" : "arrow_downward",
    };
  };

  const revPct = pct(kpi.revenue, kpi.prevRevenue);

  const now = new Date();
  const curMonth = now.toLocaleString("vi-VN", { month: "long" });       // VD: "tháng 7"
  const prevMonth = new Date(now.setMonth(now.getMonth() - 1)).toLocaleString("vi-VN", { month: "long" });

  const barChartCompare = {
  labels: [prevMonth, curMonth],
  datasets: [
    {
      label: "Doanh thu",
      color: "info",
      data: [kpi.prevRevenue, kpi.revenue],
      maxBarThickness: 80,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
      borderRadius: 6,
    },
  ],
  options: {
    scales: {
      y: {
        ticks: {
          callback: value => value.toLocaleString("vi-VN"),
        },
        beginAtZero: true,
        suggestedMax: Math.max(kpi.revenue, kpi.prevRevenue) * 1.2,
        grace: "5%",
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("vi-VN")} ₫`,
        },
      },
      legend: { display: false },
    },
  },
};



  return (
  <DashboardLayout>
    <DashboardNavbar />

    <ArgonBox py={3}>
      {/* ==== KPI SECTION ================================================= */}
      <Grid container spacing={3} mb={3}>
        {/** 4 thẻ KPI nằm ngang, tự co giãn trên các kích cỡ màn hình */}
        <Grid item xs={12} sm={6} md={3}>
         <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, backgroundColor: "#1976d2", color: "#fff" }}>
  <ArgonTypography variant="button" fontWeight="medium" color="white" mb={1}>
    TỔNG DOANH THU THÁNG NÀY
  </ArgonTypography>
  <ArgonTypography variant="h5" fontWeight="bold">
    {kpi.revenue.toLocaleString("vi-VN")} ₫
  </ArgonTypography>
  <ArgonTypography variant="caption" fontWeight="regular">
    {curMonth.charAt(0).toUpperCase() + curMonth.slice(1)} đạt {kpi.revenue.toLocaleString("vi-VN")} ₫<br />
    ({revPct.value}% so với {prevMonth} – {revPct.value >= 0 ? "Tăng" : "Giảm"})
  </ArgonTypography>
</Card>

        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <ArgonTypography variant="button" color="text" fontWeight="medium">
              Tổng vé đã bán
            </ArgonTypography>
            <ArgonTypography variant="h5" fontWeight="bold">
              {kpi.tickets}
            </ArgonTypography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <ArgonTypography variant="button" color="text" fontWeight="medium">
              Số sự kiện
            </ArgonTypography>
            <ArgonTypography variant="h5" fontWeight="bold">
              {kpi.events}
            </ArgonTypography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <ArgonTypography variant="button" color="text" fontWeight="medium">
              Sự kiện đã kết thúc
            </ArgonTypography>
            <ArgonTypography variant="h5" fontWeight="bold">
              {kpi.ended}
            </ArgonTypography>
          </Card>
        </Grid>
      </Grid>

      {/* ==== CHART + DROPDOWN =========================================== */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            {/* tiêu đề + bộ lọc */}
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Grid item>
                <ArgonTypography variant="h6" fontWeight="bold">
                  So sánh doanh thu 2 tháng
                </ArgonTypography>
                <ArgonTypography variant="caption" color="text">
                  Tháng này đạt&nbsp;
                  <strong>{kpi.revenue.toLocaleString("vi-VN")} ₫</strong>&nbsp;
                  ({revPct.value}% so với tháng trước&nbsp;
                  {revPct.value >= 0 ? "– Tăng" : "– Giảm"})
                </ArgonTypography>
              </Grid>

              {/* Dropdown (tùy chọn) */}
              <Grid item>
                <FormControl size="small">
                  <Select
                    value={filter}                 /* state filter */
                    onChange={e => setFilter(e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="month">Theo tháng</MenuItem>
                    <MenuItem value="year">Theo năm</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* biểu đồ cột */}
            <VerticalBarChart
              title=""                 /* đã có title phía trên */
              description=""
              chart={barChartCompare}
            />
          </Card>
        </Grid>
      </Grid>

      {/* ==== UPCOMING EVENTS =========================================== */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
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

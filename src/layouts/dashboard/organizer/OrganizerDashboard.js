// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EventIcon from "@mui/icons-material/Event";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DetailedStatisticsCard from "./components/DetailedStaticsCard";
import EventTable from "../organizer/components/EventTable";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import eventApi from "api/utils/eventApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function OrganizerDashboard() {
  const token = useSelector((state) => state.auth.token);
  const [events, setEvents] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const now = Date.now();

  const ongoingEventsCount = events.filter((event) => {
    const start = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const end = event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000;
    return now >= start && now <= end;
  }).length;

  const chartDataByDate = {};
  events.forEach((event) => {
    const timeStart = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const date = new Date(timeStart).toLocaleDateString("vi-VN");
    const revenue = event.revenue ?? 0;

    chartDataByDate[date] = (chartDataByDate[date] || 0) + revenue;
  });

  const sortedDates = Object.keys(chartDataByDate).sort(
    (a, b) =>
      new Date(a.split("/").reverse().join("/")) - new Date(b.split("/").reverse().join("/"))
  );
  const chartLabels = sortedDates;
  const chartValues = sortedDates.map((date) => chartDataByDate[date]);

  const gradientLineChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Doanh thu (₫)",
        data: chartValues,
        color: "success",
      },
    ],
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization();
        console.log("eve", response);
        if (response.data.status === 200) {
          const rawEvents = response.data.events;

          // ✅ Thêm dữ liệu tạm vào từng sự kiện
          const enrichedEvents = rawEvents.map((event, index) => {
            const soldTickets =
              event.showtimes?.reduce((sum, show) => sum + show.soldTickets, 0) || 0;

            const mockSoldTickets = soldTickets || Math.floor(Math.random() * 500); // 👈 dữ liệu mẫu nếu 0
            const ticketQuantity = event.ticketQuantity ?? 500; // 👈 tạm set mặc định
            const ticketPrice = event.ticketPrice ?? 100000; // 👈 giá vé tạm

            const revenue = mockSoldTickets * ticketPrice;

            return {
              ...event,
              soldTickets: mockSoldTickets,
              ticketQuantity,
              ticketPrice,
              revenue,
            };
          });

          setEvents(enrichedEvents);

          // Nếu cần tính tổng
          const totalRevenue = enrichedEvents.reduce((sum, e) => sum + e.revenue, 0);
          const totalTickets = enrichedEvents.reduce((sum, e) => sum + e.soldTickets, 0);

          setTotalRevenue(totalRevenue);
          setTotalTickets(totalTickets);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng doanh thu"
              count={totalRevenue.toLocaleString() + " ₫"}
              icon={{ color: "info", component: <MonetizationOnIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng vé đã bán"
              count={totalTickets}
              icon={{ color: "error", component: <ConfirmationNumberIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Sự kiện đang diễn ra"
              count={ongoingEventsCount}
              icon={{ color: "success", component: <EventAvailableIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng sự kiện"
              count={events.length}
              icon={{ color: "warning", component: <EventIcon fontSize="small" /> }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <GradientLineChart title="Tổng quan doanh thu" chart={gradientLineChartData} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <EventTable events={events} />
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default OrganizerDashboard;

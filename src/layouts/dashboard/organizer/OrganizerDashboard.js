// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard/index";
import SalesTable from "examples/Tables/SalesTable";
import CategoriesList from "examples/Lists/CategoriesList";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";

// Dashboard layout components
import Slider from "layouts/dashboard/components/Slider";
import categoryApi from "api/utils/categoryApi";
import eventApi from "api/utils/eventApi";

// Data
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import salesTableData from "layouts/dashboard/data/salesTableData";
import categoriesListData from "layouts/dashboard/data/categoriesListData";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function OrganizerDashboard() {
  const token = useSelector((state) => state.auth.token);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const now = Date.now();
  const oneWeekLater = now + 7 * 24 * 60 * 60 * 1000;

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const weekday = weekdayNames[date.getDay()];
    return `${hours}:${minutes}, ${weekday}, ${day} tháng ${month} ${year}`;
  };

  const getEventStatusLabel = (event) => {
    const start = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const end = event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000;
    if (now >= start && now <= end) return { label: "Đang diễn ra", color: "#2e7d32" };
    if (start > now && start <= oneWeekLater) return { label: "Sắp diễn ra", color: "#d32f2f" };
    if (start > oneWeekLater) return { label: "Chưa diễn ra", color: "#f9a825" };
    if (now > end) return { label: "Đã kết thúc", color: "#757575" };
    return { label: "Không xác định", color: "#9e9e9e" };
  };

  const renderEventRows = (eventList) =>
    eventList.map((event) => {
      const status = getEventStatusLabel(event);
      const totalSold = event.showtimes?.reduce((acc, show) => acc + show.soldTickets, 0) || 0;
      const firstStartTime = event.showtimes?.[0]?.startTime || event.timeStart;
      return {
        "Tên sự kiện": [
          event.avatar,
          <>
            <strong>{event.name}</strong>
            <div style={{ color: status.color, fontSize: "0.75rem" }}>{status.label}</div>
          </>,
        ],
        "Ngày bắt đầu": formatDateTime(firstStartTime),
        "Giá vé":
          event.ticketPrice != null ? event.ticketPrice.toLocaleString("vi-VN") + " ₫" : "Miễn phí",
        "Số lượng": `${totalSold}/${event.ticketQuantity ?? "?"}`,
      };
    });

  const upcomingEvents = events.filter((event) => {
    const start = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    return start > now && start <= oneWeekLater;
  });
  const ongoingEvents = events
    .filter((event) => {
      const start = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
      const end = event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000;
      return now >= start && now <= end;
    })
    .sort((a, b) => a.timeStart - b.timeStart);

  const ongoingEventsCount = events.filter((event) => {
    const start = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const end = event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000;
    return now >= start && now <= end;
  }).length;

  const chartDataByDate = {};
  events.forEach((event) => {
    const timeStart = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const date = new Date(timeStart).toLocaleDateString("vi-VN");
    const revenue = event.soldTickets * event.ticketPrice;
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

  const getCategoryIcon = (name) => {
    switch (name.toLowerCase()) {
      case "thể thao":
        return "sports_soccer";
      case "giải trí":
        return "movie";
      case "kịch":
        return "theater_comedy";
      case "hội thảo":
        return "groups";
      case "du lịch":
        return "travel_explore";
      case "âm nhạc":
        return "music_note";
      case "lịch sử":
        return "history_edu";
      default:
        return "category";
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization();
        if (response.data.status === 200) {
          setEvents(response.data.events);
          setTotalRevenue(response.data.totalRevenue);
          setTotalTickets(response.data.totalTickets);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      }
    };
    fetchEvents();
  }, []);

  const eventRows = renderEventRows(upcomingEvents);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng doanh thu"
              count={totalRevenue.toLocaleString() + " ₫"}
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng vé đã bán"
              count={totalTickets}
              icon={{ color: "error", component: <i className="ni ni-tag" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Sự kiện đang diễn ra"
              count={ongoingEventsCount}
              icon={{ color: "success", component: <i className="ni ni-calendar-grid-58" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng sự kiện"
              count={events.length}
              icon={{ color: "warning", component: <i className="ni ni-badge" /> }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <GradientLineChart title="Tổng quan doanh thu" chart={gradientLineChartData} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <SalesTable
              title="Sự kiện đang và sắp diễn ra"
              rows={renderEventRows([...ongoingEvents, ...upcomingEvents])}
            />
          </Grid>
          {/* <Grid item xs={12} md={4}>
            <CategoriesList
              title="Loại sự kiện"
              categories={categories.map((category) => ({
                color: "dark",
                icon: getCategoryIcon(category.name),
                name: category.name,
                description: "Danh mục sự kiện",
                route: "/",
              }))}
            />
          </Grid> */}
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrganizerDashboard;

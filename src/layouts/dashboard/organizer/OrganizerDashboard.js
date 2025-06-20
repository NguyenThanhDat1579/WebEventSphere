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
  const { size } = typography;
  const token = useSelector((state) => state.auth.token);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const eventRows = events.map((event, index) => ({
    "Tên sự kiện": [event.avatar, event.name],
    "Ngày bắt đầu": new Date(event.timeStart * 1000).toLocaleDateString("vi-VN"), // định dạng thành dd/mm/yyyy
    "Giá vé": event.ticketPrice
  ? event.ticketPrice.toLocaleString("vi-VN") + " ₫"
  : "Chưa xác định",

    "Số lượng": `${event.soldTickets}/${event.ticketQuantity}`,
  }));

  const currentTime = Math.floor(Date.now() / 1000); // thời gian hiện tại tính bằng giây

  const ongoingEventsCount = events.filter(
    (event) => currentTime >= event.timeStart && currentTime <= event.timeEnd
  ).length;

  const chartDataByDate = {};

  events.forEach((event) => {
    // Xác định nếu timeStart là giây hay mili giây
    const timeStart = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
    const date = new Date(timeStart).toLocaleDateString("vi-VN"); // Ví dụ: 29/05/2025

    const revenue = event.soldTickets * event.ticketPrice;

    if (chartDataByDate[date]) {
      chartDataByDate[date] += revenue;
    } else {
      chartDataByDate[date] = revenue;
    }
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
        color: "success", // nếu chart hỗ trợ, hoặc bỏ nếu không cần
      },
    ],
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response.data.status) {
          setCategories(response.data.data); // cập nhật state categories
        } else {
          console.error("Lấy danh mục thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy danh mục", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization(); // truyền token
        if (response.data.status === 200) {
          setEvents(response.data.events); // cập nhật danh sách sự kiện
          setTotalRevenue(response.data.totalRevenue);
          setTotalTickets(response.data.totalTickets);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      }
    };

    fetchCategories();
    fetchEvents();
  }, []);

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
          <Grid item xs={12} lg={12}>
            <GradientLineChart title="Tổng quan doanh thu" chart={gradientLineChartData} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SalesTable title="Danh sách sự kiện" rows={eventRows} />
          </Grid>
          <Grid item xs={12} md={4}>
            <CategoriesList
              title="Loại sự kiện"
              categories={categories.map((category) => ({
                color: "dark",
                icon: getCategoryIcon(category.name), // ánh xạ icon từ name
                name: category.name,
                description: "Danh mục sự kiện",
                route: "/", // thêm nếu cần
              }))}
            />
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}
export default OrganizerDashboard;

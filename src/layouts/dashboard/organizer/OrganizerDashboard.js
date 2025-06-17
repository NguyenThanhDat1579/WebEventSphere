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
  //event.ticketPrice
  const currentTime = Math.floor(Date.now() / 1000); // thời gian hiện tại tính bằng giây
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

  const upcomingEvents = events
    .filter((event) => {
      const startTime = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
      return startTime > now && startTime <= oneWeekLater;
    })
    .sort((a, b) => {
      const aTime = a.timeStart > 1e12 ? a.timeStart : a.timeStart * 1000;
      const bTime = b.timeStart > 1e12 ? b.timeStart : b.timeStart * 1000;
      return aTime - bTime;
    });

  const getEventStatusLabel = (event) => {
    // Đảm bảo timeStart và timeEnd là kiểu Date hợp lệ
    const start = new Date(event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000);
    const end = new Date(event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000);
    const now = new Date();

    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const timeUntilStart = start - now;

    if (now >= start && now <= end) {
      return { label: "Đang diễn ra", color: "#2e7d32" }; // xanh đậm
    } else if (timeUntilStart <= oneWeek && timeUntilStart > 0) {
      return { label: "Sắp diễn ra", color: "#d32f2f" }; // đỏ
    } else if (timeUntilStart > oneWeek) {
      return { label: "Chưa diễn ra", color: "#f9a825" }; // vàng
    } else if (now > end) {
      return { label: "Đã kết thúc", color: "#757575" }; // xám
    }

    // Nếu không rơi vào bất kỳ trường hợp nào
    return {
      label: "Không xác định",
      color: "#9e9e9e", // xám
    };
  };

  const eventRows = upcomingEvents
    .map((event) => {
      const status = getEventStatusLabel(event);
      if (!status) return null; // bỏ qua nếu sự kiện đã kết thúc

      return {
        "Tên sự kiện": [
          event.avatar,
          <>
            <strong>{event.name}</strong>
            <div style={{ color: status.color, fontSize: "0.75rem" }}>{status.label}</div>
          </>,
        ],
        "Ngày bắt đầu": formatDateTime(event.timeStart),
        "Giá vé":
          event.ticketPrice != null ? event.ticketPrice.toLocaleString("vi-VN") + " ₫" : "Miễn phí",
        "Số lượng": `${event.soldTickets}/${event.ticketQuantity}`,
      };
    })
    .filter(Boolean); // lọc null

  // const oneWeekInSeconds = 7 * 24 * 60 * 60;

  // const upcomingEvents = events
  //   .filter((event) => {
  //     const timeUntilStart = event.timeStart - currentTime;
  //     return timeUntilStart > 0 && timeUntilStart <= oneWeekInSeconds;
  //   })
  //   .sort((a, b) => a.timeStart - b.timeStart);

  // const eventRows = upcomingEvents.map((event) => ({
  //   "Tên sự kiện": [
  //     event.avatar,
  //     <>
  //       <strong>{event.name}</strong>
  //       <div style={{ color: "red", fontSize: "0.75rem" }}>Sắp diễn ra</div>
  //     </>,
  //   ],
  //   "Ngày bắt đầu": new Date(event.timeStart * 1000).toLocaleDateString("vi-VN"),
  //   "Giá vé":
  //     event.ticketPrice != null ? event.ticketPrice.toLocaleString("vi-VN") + " ₫" : "Miễn phí",
  //   "Số lượng": `${event.soldTickets}/${event.ticketQuantity}`,
  // }));

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

  //   const chartDataByDate = {};

  // events.forEach((event) => {
  //   const timeStart = event.timeStart > 1e12 ? event.timeStart : event.timeStart * 1000;
  //   const timeEnd = event.timeEnd > 1e12 ? event.timeEnd : event.timeEnd * 1000;

  //   const revenue = event.soldTickets * event.ticketPrice;

  //   const startDate = new Date(timeStart);
  //   const endDate = new Date(timeEnd);

  //   // Tính số ngày giữa start và end
  //   const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  //   const dailyRevenue = revenue / days;

  //   // Phân bổ doanh thu theo từng ngày
  //   for (let i = 0; i < days; i++) {
  //     const currentDate = new Date(startDate);
  //     currentDate.setDate(startDate.getDate() + i);
  //     const dateKey = currentDate.toLocaleDateString("vi-VN"); // dd/mm/yyyy

  //     if (chartDataByDate[dateKey]) {
  //       chartDataByDate[dateKey] += dailyRevenue;
  //     } else {
  //       chartDataByDate[dateKey] = dailyRevenue;
  //     }
  //   }
  // });

  // // Sắp xếp ngày tăng dần
  // const sortedDates = Object.keys(chartDataByDate).sort(
  //   (a, b) =>
  //     new Date(a.split("/").reverse().join("/")) -
  //     new Date(b.split("/").reverse().join("/"))
  // );

  // const chartLabels = sortedDates;
  // const chartValues = sortedDates.map((date) => chartDataByDate[date]);

  // const gradientLineChartData = {
  //   labels: chartLabels,
  //   datasets: [
  //     {
  //       label: "Doanh thu (₫)",
  //       data: chartValues,
  //       color: "success", // nếu chart hỗ trợ, hoặc bỏ
  //     },
  //   ],
  // };

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
          console.log("response: ", response);
          console.log("response1: ", JSON.stringify(response, null, 2));
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
            <SalesTable title="Sự kiện sắp diễn ra" rows={eventRows} />
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

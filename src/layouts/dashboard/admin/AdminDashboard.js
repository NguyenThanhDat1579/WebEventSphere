import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Card from "@mui/material/Card";

// Argon components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "../../../examples/Footer";
import DetailedStaticsCard from "../../../examples/Cards/StatisticsCards/DetailedStatisticsCard";
import SalesTable from "examples/Tables/SalesTable";
import CategoriesList from "examples/Lists/CategoriesList";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";

// Argon styles
import typography from "assets/theme/base/typography";

// Data
import gradientLineChartData from "layouts/dashboard/data/gradientLineChartData";
import salesTableData from "layouts/dashboard/data/salesTableData";
import categoriesListData from "layouts/dashboard/data/categoriesListData";

// Custom
import Slider from "layouts/dashboard/components/Slider";
import revenueApi from "api/revenue";

function AdminDashboard() {
  const { size } = typography;
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [endedEvents, setEndedEvents] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await revenueApi.getRevenue();
        const data = res.data.data;

        const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
        const totalTickets = data.reduce((acc, item) => acc + item.soldTickets, 0);
        const totalEvents = data.length;
        const endedEvents = data.filter((item) => item.status === "End").length;

        setTotalRevenue(totalRevenue);
        setTotalTickets(totalTickets);
        setTotalEvents(totalEvents);
        setEndedEvents(endedEvents);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", err);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStaticsCard
              title="Tổng doanh thu"
              count={`$${totalRevenue.toLocaleString()}`}
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
              percentage={{}}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStaticsCard
              title="Tổng vé đã bán"
              count={totalTickets}
              icon={{ color: "success", component: <i className="ni ni-tag" /> }}
              percentage={{}}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStaticsCard
              title="Số sự kiện"
              count={totalEvents}
              icon={{ color: "warning", component: <i className="ni ni-calendar-grid-58" /> }}
              percentage={{}} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStaticsCard
              title="Sự kiện đã kết thúc"
              count={endedEvents}
              icon={{ color: "error", component: <i className="ni ni-fat-remove" /> }}
              percentage={{}} />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={7}>
            <GradientLineChart
              title="Tổng quan bán vé"
              description={
                <ArgonBox display="flex" alignItems="center">
                  <ArgonBox fontSize={size.lg} color="success" mb={0.3} mr={0.5} lineHeight={0}>
                    <Icon sx={{ fontWeight: "bold" }}>arrow_upward</Icon>
                  </ArgonBox>
                  <ArgonTypography variant="button" color="text" fontWeight="medium">
                    4% tăng{" "}
                    <ArgonTypography variant="button" color="text" fontWeight="regular">
                      so với 2024
                    </ArgonTypography>
                  </ArgonTypography>
                </ArgonBox>
              }
              chart={gradientLineChartData}
            />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Slider />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SalesTable title="Sales by Country" rows={salesTableData} />
          </Grid>
          <Grid item xs={12} md={4}>
            <CategoriesList title="categories" categories={categoriesListData} />
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default AdminDashboard;

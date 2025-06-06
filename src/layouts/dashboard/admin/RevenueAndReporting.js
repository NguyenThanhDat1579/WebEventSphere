import { useEffect, useState } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard";
import Table from "examples/Tables/Table";

// Argon Dashboard 2 MUI base styles
import typography from "assets/theme/base/typography";

// API
import revenueApi from "api/revenue";

function RevenueAndReporting() {
  const { size } = typography;

  const [columns] = useState([
    { name: "name", align: "left" },
    { name: "soldTickets", align: "center" },
    { name: "revenue", align: "center" },
    { name: "status", align: "center" },
  ]);

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await revenueApi.getRevenue();
        const rawData = res.data.data;

        const data = rawData.map((event) => ({
          name: <ArgonTypography variant="button">{event.name}</ArgonTypography>,
          soldTickets: (
            <ArgonTypography variant="button" textAlign="center">
              {event.soldTickets}
            </ArgonTypography>
          ),
          revenue: (
            <ArgonTypography variant="button" textAlign="center">
              ${event.revenue.toLocaleString()}
            </ArgonTypography>
          ),
          status: (
            <ArgonTypography
              variant="button"
              color={event.status === "End" ? "error" : "success"}
              textAlign="center"
            >
              {event.status}
            </ArgonTypography>
          ),
        }));

        const total = rawData.reduce((sum, event) => sum + event.revenue, 0);

        setRows(data);
        setTotalRevenue(total);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", err);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <DetailedStatisticsCard
              title="Tổng doanh thu"
              count={`$${totalRevenue.toLocaleString()}`}
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
              percentage={{ color: "success", count: "+0%", text: "so với kỳ trước" }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonTypography variant="h5" fontWeight="bold" mb={2}>
              Báo cáo doanh thu sự kiện
            </ArgonTypography>
            <Card>
              <ArgonBox p={3}>
                <Table columns={columns} rows={rows} />
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RevenueAndReporting;

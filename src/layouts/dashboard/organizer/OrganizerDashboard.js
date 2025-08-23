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
import eventApi from "api/utils/eventApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GradientLineChart from "./components/GradientLineChart";

function OrganizerDashboard() {
  const token = useSelector((state) => state.auth.token);
  const [events, setEvents] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalRevenueByDay, setTotalRevenueByDay] = useState({});
  const [totalRevenueByMonth, setTotalRevenueByMonth] = useState({});
  const [totalRevenueByYear, setTotalRevenueByYear] = useState({});

  const now = Date.now();

    function formatCurrencyVND(amount) {
    return amount.toLocaleString("vi-VN") + " ₫";
  }

  const getCurrentMonthRevenue = (data) => {
      if (!data) return 0;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // thêm số 0 phía trước nếu < 10
      const key = `${year}-${month}`;
      return data[key] || 0; // nếu không có dữ liệu thì trả về 0
    };


  const ongoingEventsCount = events.filter((event) => {
    const start = event.timeStart;
    const end = event.timeEnd;
    return now >= start && now <= end;
  }).length;

 
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization();
        if (response.data.status === 200) {
          const rawEvents = response.data.events;
          setEvents(rawEvents)
          console.log("event", rawEvents);
          setTotalRevenue(response.data.totalRevenue);
          setTotalTickets(response.data.totalTicketsSold);
          setTotalRevenueByDay(response.data.totalRevenueByDay || {});
          setTotalRevenueByMonth(response.data.totalRevenueByMonth || {});
          setTotalRevenueByYear(response.data.totalRevenueByYear || {});
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
          <Grid item xs={12} md={6} lg={3.5}>
            <DetailedStatisticsCard
              title="Tổng doanh thu tháng này"
              count={formatCurrencyVND(getCurrentMonthRevenue(totalRevenueByMonth))}
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
          <Grid item xs={12} md={6} lg={2.5}>
            <DetailedStatisticsCard
              title="Tổng sự kiện"
              count={events.length}
              icon={{ color: "warning", component: <EventIcon fontSize="small" /> }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <GradientLineChart
              title="Thống kê doanh thu"
              description="Doanh thu theo thời gian"
              dataByDay={totalRevenueByDay}
              dataByMonth={totalRevenueByMonth}
              dataByYear={totalRevenueByYear}
            />
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

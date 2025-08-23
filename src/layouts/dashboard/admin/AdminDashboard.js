import { useEffect, useState } from "react";
import {
  Grid, Card, CardContent, CardMedia, Typography, Box, Chip,
  Button, CircularProgress,
  TableCell,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  Paper,
  Avatar,
  Pagination
} from "@mui/material";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import DetailedStatisticsCard from "../organizer/components/DetailedStaticsCard";
import revenueApi from "api/revenue";
import eventApi from "api/eventApi";
import userApi from "api/userApi";

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState(null);
  const [eventList, setEventList] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [chart, setChart] = useState(null);
  const [totalOrganizers, setTotalOrganizers] = useState(0);
  const [mergedData, setMergedData] = useState([]);
  
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true);
        const res = await revenueApi.getRevenue();
        setRevenueData(res.data);

        if (res.data?.totalRevenueByMonth) {
          const chartData = buildChartFromRevenue(res.data.totalRevenueByMonth);
          setChart(chartData);
        }
      } catch (err) {
        console.error("Fetch revenue error:", err);
      } finally {
        setLoadingRevenue(false);
      }
    };
    fetchRevenue();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await eventApi.getAllHome();
        setEventList(res.data?.data ?? []);
      } catch (err) {
        console.error("Fetch events error:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventList.length > 0 && revenueData?.eventsRevenue?.length > 0) {
      const merged = eventList.map(event => {
        const revenueInfo = revenueData.eventsRevenue.find(r => r.eventId === event._id);
        return {
          ...event,
          revenue: revenueInfo ? revenueInfo.revenueByYear : {},
          revenueByMonth: revenueInfo ? revenueInfo.revenueByMonth : {},
          revenueByDay: revenueInfo ? revenueInfo.revenueByDay : {},
          totalSold: revenueInfo ? revenueInfo.totalSold : 0,
          soldByDay: revenueInfo ? revenueInfo.soldByDay : {},
        };
      });
      setMergedData(merged);
    }
  }, [eventList, revenueData]);

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const organizers = res.data.data.filter((u) => u.role !== 3);
          setTotalOrganizers(organizers.length);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách tổ chức:", err);
      }
    })();
  }, []);

  const getPastEventsList = (events, currentTime = Date.now()) => {
    const pastShowtimes = events
      .flatMap(event =>
        (event.showtimes || []).map(show => ({ ...event, showtimeEnd: show.endTime }))
      )
      .filter(item => item.showtimeEnd < currentTime);

    if (pastShowtimes.length === 0) return [];

    const eventMap = new Map();
    pastShowtimes.forEach(ev => {
      const existing = eventMap.get(ev._id);
      if (!existing || ev.showtimeEnd > existing.showtimeEnd) {
        eventMap.set(ev._id, ev);
      }
    });

    return Array.from(eventMap.values()).sort((a, b) => b.showtimeEnd - a.showtimeEnd);
  };
 

  const excludedNames = [
  "V CONCERT RẠNG RỠ VIỆT NAM - CHẠM VÀO ĐỈNH CAO CỦA ÂM NHẠC VÀ CẢM XÚC",
  "Nhà Hát Kịch IDECAF: LƯƠNG SƠN BÁ CHÚC ANH ĐÀI ngoại truyện",
  "CON QUỶ RỐI - Bạn sợ khi xem kịch ma"
];
  const closestEvent = getPastEventsList(mergedData)
  .filter(event => !excludedNames.includes(event.name));

  const paginatedEvents = closestEvent.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const buildChartFromRevenue = (totalRevenueByMonth = {}) => {
    const months = Object.keys(totalRevenueByMonth).sort();
    return {
      labels: months.map(m => {
        const [year, month] = m.split("-");
        return `T${Number(month)}/${year}`;
      }),
      datasets: [
        { label: "Doanh thu", data: months.map(m => totalRevenueByMonth[m]) },
        {
          label: "Lợi nhuận (5%)",
          data: months.map(m => totalRevenueByMonth[m] * 0.05),
          backgroundColor: "#4CAF50",
        },
      ],
    };
  };

  const buildChartFromClosestEvents = (events = []) => {
    const monthlyRevenue = {};
    events.forEach(ev => {
      if (ev.revenueByMonth) {
        Object.entries(ev.revenueByMonth).forEach(([monthKey, value]) => {
          if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = 0;
          monthlyRevenue[monthKey] += value;
        });
      } else if (ev.revenue) {
        Object.entries(ev.revenue).forEach(([year, value]) => {
          const monthKey = `${year}-01`;
          if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = 0;
          monthlyRevenue[monthKey] += value;
        });
      }
    });

    const months = Object.keys(monthlyRevenue).sort();

    return {
      labels: months.map(m => {
        const [year, month] = m.split("-");
        return `T${Number(month)}/${year}`;
      }),
      datasets: [
        { label: "Doanh thu", data: months.map(m => monthlyRevenue[m]) },
        { label: "Lợi nhuận (5%)", data: months.map(m => monthlyRevenue[m] * 0.05), backgroundColor: "#4CAF50" },
      ],
    };
  };

   const getFinishedEvents = (events) => {
    return events.filter(event => event.timeEnd && new Date(event.timeEnd).getTime() < Date.now());
  };
  const mergedData1 = getFinishedEvents(mergedData)

  const totalRevenueClosestEvents = (mergedData1 || []).reduce((sum, evt) => {
    const revenueValue = Object.values(evt.revenue || {})[0] || 0;
    console.log("Revenue của sự kiện:", revenueValue);
    return sum + revenueValue;
  }, 0);

  const totalProfitClosestEvents = totalRevenueClosestEvents * 0.05;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng doanh thu"
              count={`${totalRevenueClosestEvents.toLocaleString("vi-VN")} ₫`}
              icon={{ color: "info", component: <MonetizationOnIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3.5}>
            <DetailedStatisticsCard
              title="Tổng lợi nhuận Admin (5%)"
              count={`${totalProfitClosestEvents.toLocaleString("vi-VN")} ₫`}
              icon={{ color: "error", component: <MonetizationOnIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={2.5}>
            <DetailedStatisticsCard
              title="Tổng sự kiện"
              count={eventList.length}
              icon={{ color: "warning", component: <EventIcon fontSize="small" /> }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <DetailedStatisticsCard
              title="Tổng số nhà tổ chức"
              count={totalOrganizers}
              icon={{ color: "success", component: <EventAvailableIcon fontSize="small" /> }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3, minHeight: 380 }}>
              {mergedData1.length > 0 && (
                <VerticalBarChart
                  title="Doanh thu theo tháng (sự kiện đã kết thúc)"
                  chart={buildChartFromClosestEvents(mergedData1)}
                  height="300px"
                />
              )}
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ minHeight: 500 }}>
              <Table size="medium" sx={{ minWidth: 700, tableLayout: "fixed" }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: "32%", fontWeight: 600, fontSize: "0.95rem" }}>Tên sự kiện</TableCell>
                    <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>Ngày kết thúc</TableCell>
                    <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>Doanh thu</TableCell>
                    <TableCell sx={{ width: "15%", fontWeight: 600, fontSize: "0.95rem" }}>Lợi nhuận (5%)</TableCell>
                    <TableCell sx={{ width: "16%", fontWeight: 600, fontSize: "0.95rem" }}>Trạng thái thanh toán</TableCell>
                  </TableRow>
                </TableBody>
                <TableBody>
                  {paginatedEvents.map((ev) => {
                    const totalRevenue = ev.revenue ? Object.values(ev.revenue).reduce((a, b) => a + b, 0) : 0;
                    const profit = totalRevenue * 0.05;
                    return (
                      <TableRow key={ev._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar src={ev.avatar} alt={ev.name} variant="rounded" sx={{ width: 100, height: 100, borderRadius: 2 }} />
                            <ArgonTypography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{ev.name}</ArgonTypography>
                          </Box>
                        </TableCell>
                        <TableCell>{ev.timeEnd ? dayjs(ev.timeEnd).format("DD/MM/YYYY") : "-"}</TableCell>
                        <TableCell>{totalRevenue.toLocaleString("vi-VN")} ₫</TableCell>
                        <TableCell>{profit.toLocaleString("vi-VN")} ₫</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            label={ev.timeEnd && ev.timeEnd < Date.now() ? "Đã thanh toán" : "Đã thanh toán"}
                            color={ev.timeEnd && ev.timeEnd < Date.now() ? "success" : "success"}
                            size="small"
                            sx={{ color: "#fff" }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
             <Box mt={2} display="flex" justifyContent="flex-end">
              <Pagination
                count={Math.ceil(closestEvent.length / rowsPerPage)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="medium"
              />
            </Box>
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}

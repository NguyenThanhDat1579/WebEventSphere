import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  MenuItem,
  Select,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import SelectMenu from "./OrganizerCreateNewEvent/components/SelectMenu";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard/index";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ArgonBox from "components/ArgonBox";
import { position } from "stylis";
import PieChart from "./OrganizerCreateNewEvent/components/PieChart";
import LineChartDualAxis from "../organizer/components/LineChartDualAxis";
import DonutChartWithCenter from "../organizer/components/DonutChartWithCenter";
import { format, eachDayOfInterval, isSameDay, fromUnixTime } from "date-fns";

import eventApi from "api/utils/eventApi";
const now = Date.now();

function OrganizerRevenue() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState([]);
  const [events, setEvents] = useState([]);
  const [gradientChart, setGradientChart] = useState({ labels: [], datasets: [] });
  function getEventRevenue(event) {
    return event?.eventTotalRevenue || 0;
  }
  function getSoldTickets(event) {
    return event?.soldTickets || 0;
  }
  function getTotalTicketsOfEvent(event) {
    return event?.totalTicketsEvent || 0;
  }

  function getEventDateLabels(event) {
    const startDate = new Date(event.timeStart);
    const endDate = new Date(event.timeEnd);

    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
      console.error("❌ Invalid interval:", { startDate, endDate });
      return [];
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map((day) => format(day, "dd/MM"));
  }

  function buildLineChartDataFromEvent(event) {
    const dateLabels = getEventDateLabels(event); // Gọi hàm đã tách riêng

    const showtimes = event.showtimes || [];
    const revenueByShowtime = event.revenueByShowtime || [];

    const revenueData = [];
    const ticketData = [];

    // Tạo danh sách đối tượng ngày tương ứng
    const days = dateLabels.map((label) => {
      const [day, month] = label.split("/").map(Number);
      const year = new Date(event.timeStart).getFullYear();
      return new Date(year, month - 1, day);
    });

    for (const day of days) {
      // Lấy các suất chiếu trong ngày đó
      const showtimeIdsInDay = showtimes
        .filter((st) => isSameDay(new Date(st.startTime), day))
        .map((st) => st._id);

      const revenueForDay = revenueByShowtime
        .filter((r) => showtimeIdsInDay.includes(r.showtimeId))
        .reduce((sum, r) => sum + (r.revenue || 0), 0);

      const ticketsForDay = revenueByShowtime
        .filter((r) => showtimeIdsInDay.includes(r.showtimeId))
        .reduce((sum, r) => sum + (r.soldTickets || 0), 0);

      revenueData.push(revenueForDay);
      ticketData.push(ticketsForDay);
    }

    return {
      labels: dateLabels,
      datasets: [
        { label: "Doanh thu (₫)", data: revenueData, color: "info" },
        { label: "Số vé đã bán", data: ticketData, color: "success" },
      ],
    };
  }

  function getShowtimeDetailsByEvent(event) {
    if (!event || !event.showtimes) return [];

    return event.showtimes.map((showtime) => {
      const revenueInfo = event.revenueByShowtime?.find((r) => r.showtimeId === showtime._id);

      const startDate = new Date(showtime.startTime);
      const endDate = new Date(showtime.endTime);

      const now = Date.now();
      let status = "Chưa diễn ra";
      if (now >= showtime.endTime) status = "Kết thúc";
      else if (now >= showtime.startTime) status = "Đang diễn ra";

      return {
        name: `Suất ${format(startDate, "dd/MM")}`,
        datetime: startDate,
        sold: revenueInfo?.soldTickets ?? 0,
        revenue: revenueInfo?.revenue ?? 0,
        status,
      };
    });
  }
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization();
        if (response.data.status === 200) {
          const originalEvents = response.data.events;
          // 🎯 Giả định bạn có thông tin cập nhật số vé mới theo showtimeId

          setEvents(originalEvents);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    setSelectedEvent(events.find((e) => e._id === selectedEventId));
    if (!selectedEvent) return;
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEvent) {
      const chartData = buildLineChartDataFromEvent(selectedEvent);
      setGradientChart(chartData);
    }
  }, [selectedEvent]);
  console.log("êvem1", JSON.stringify(selectedEvent, null, 2));

  const revenue = getEventRevenue(selectedEvent);
  const sold = getSoldTickets(selectedEvent);
  const total = getTotalTicketsOfEvent(selectedEvent);
  const ticketTableData = getShowtimeDetailsByEvent(selectedEvent);
  const ticketPrice = revenue / sold || 0; // Tránh chia cho 0
  const maxRevenue = total * ticketPrice;

  const eventOptions = events.map((e) => ({
    label: e.name,
    value: e._id,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3} sx={{ position: "relative" }}>
        <Box sx={{ backgroundColor: "#fff", p: 5, borderRadius: 5 }}>
          <Typography fontSize={20} fontWeight="bold" gutterBottom>
            Chọn sự kiện để xem doanh thu
          </Typography>
          <SelectMenu
            label=" Chọn sự kiện"
            value={selectedEventId}
            onChange={(val) => setSelectedEventId(val)}
            options={eventOptions}
          />
        </Box>
        <Grid container spacing={3} mt={0.5}>
          {/* <Grid item xs={12}>
            <Typography fontSize={20} sx={{ fontWeight: "bold", ml: 3 }} gutterBottom>
              Doanh thu
            </Typography>
          </Grid> */}
          <Grid item xs={12}>
            <Typography fontSize={16} sx={{ fontWeight: "600", ml: 3 }} gutterBottom>
              Tổng quan
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6} lg={6}>
            <Box
              sx={{
                backgroundColor: "#fff",
                p: 3,
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Bên trái: Thông tin tổng doanh thu */}
              <Box>
                <Typography fontSize={20} gutterBottom>
                  Doanh thu
                </Typography>
                <Typography fontWeight="bold" fontSize={22} gutterBottom>
                  {revenue.toLocaleString()} ₫
                </Typography>
                <Typography fontSize={18} gutterBottom>
                  Tổng: {maxRevenue.toLocaleString()} ₫
                </Typography>
              </Box>

              {/* Bên phải: DonutChart biểu diễn % đạt được */}
              <Box sx={{ width: 120, height: 120 }}>
                <DonutChartWithCenter
                  sold={revenue}
                  locked={0}
                  available={maxRevenue}
                  isCurrency={true} // ✅ nếu bạn muốn format đơn vị ₫
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 5 }}>
              <Stack direction="row" spacing={4} alignItems="center" justifyContent="space-between">
                {/* Bên trái: 3 dòng text */}
                <Box>
                  <Typography fontSize={20} gutterBottom>
                    Số vé đã bán
                  </Typography>
                  <Typography fontWeight="bold" fontSize={22} gutterBottom>
                    {sold} vé
                  </Typography>
                  <Typography fontSize={18} gutterBottom>
                    Tổng: {total} vé
                  </Typography>
                </Box>

                {/* Bên phải: Donut chart */}
                <Box sx={{ width: 120, height: 120 }}>
                  <DonutChartWithCenter sold={sold} locked={0} available={total - sold} />
                </Box>
              </Stack>
            </Box>
          </Grid>

          <Grid container spacing={3} mb={3} ml={0.5}>
            <Grid item xs={12}>
              <Box mt={4} sx={{ backgroundColor: "#fff", p: 3, borderRadius: 5 }}>
                <LineChartDualAxis
                  key={selectedEventId}
                  labels={gradientChart.labels}
                  revenueData={gradientChart.datasets?.[0]?.data || []}
                  ticketData={gradientChart.datasets?.[1]?.data || []}
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={3} ml={0.5}>
            <Grid item xs={12}>
              <Box>
                <Typography fontSize={18} sx={{ fontWeight: "600", ml: 3 }} gutterBottom>
                  Chi tiết
                </Typography>

                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="medium" sx={{ minWidth: 1000, tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 240,
                            paddingRight: 15,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Tên suất diễn
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 240,
                            paddingRight: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Ngày diễn ra
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 240,
                            paddingRight: 20,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Số vé đã bán
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 240,
                            paddingRight: 17,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Doanh thu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: 240,
                            paddingRight: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Trạng thái
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ticketTableData.map((s, idx) => (
                        <TableRow
                          key={idx}
                          sx={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}
                        >
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{format(s.datetime, "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell>{s.sold}</TableCell>
                          <TableCell>{`${s.revenue.toLocaleString()} ₫`}</TableCell>
                          <TableCell>
                            <Tooltip title={`Trạng thái: ${s.status}`}>
                              <Chip
                                label={s.status}
                                size="small"
                                color={
                                  s.status === "Kết thúc"
                                    ? "default"
                                    : s.status === "Đang diễn ra"
                                    ? "success"
                                    : "warning"
                                }
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default OrganizerRevenue;

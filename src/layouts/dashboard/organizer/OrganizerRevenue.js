import React, { useEffect, useMemo, useState } from "react";
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
import { useParams } from "react-router-dom";
import eventApi from "api/utils/eventApi";
const now = Date.now();

function OrganizerRevenue() {
  const { eventId, eventTitle } = useParams();
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [selectedEvent, setSelectedEvent] = useState([]);
  const [events, setEvents] = useState([]);
  function getEventRevenue(event) {
    return event?.eventTotalRevenue || 0;
  }
  function getSoldTickets(event) {
    return event?.soldTickets || 0;
  }
  function getTotalTicketsOfEvent(event) {
    return event?.totalTicketsEvent || 0;
  }
  function getEstimatedRevenue(event) {
    return event?.estimatedRevenue || 0;
  }

  function calculateEstimatedRevenue(event) {
  if (!event || !event.showtimes) return 0;

  return event.showtimes.reduce((total, showtime) => {
    if (event.typeBase === 'none') {
      // Dạng "none": ticketPrice * ticketQuantity
      const price = showtime.ticketPrice || 0;
      const quantity = showtime.ticketQuantity || 0;
      return total + price * quantity;
    }

    if (event.typeBase === 'seat' || event.typeBase === 'zone') {
      const sold = showtime.soldTickets || 0;
      const revenue = showtime.revenue || 0;
      const totalTickets = showtime.totalTickets || 0;

      if (sold === 0 || revenue === 0 || totalTickets === 0) return total;

      const avgPrice = revenue / sold;
      return total + avgPrice * totalTickets;
    }

    return total;
  }, 0);
}
  function calculateEstimatedRevenue(event) {
    if (!event || !event.showtimes) return 0;

    return event.showtimes.reduce((total, showtime) => {
      if (event.typeBase === 'none') {
        // Dạng "none": ticketPrice * ticketQuantity
        const price = showtime.ticketPrice || 0;
        const quantity = showtime.ticketQuantity || 0;
        return total + price * quantity;
      }

      if (event.typeBase === 'seat' || event.typeBase === 'zone') {
        const sold = showtime.soldTickets || 0;
        const revenue = showtime.revenue || 0;
        const totalTickets = showtime.totalTickets || 0;

        if (sold === 0 || revenue === 0 || totalTickets === 0) return total;

        const avgPrice = Number((revenue / sold).toFixed(2));
        return total + avgPrice * totalTickets;
      }

      return total;
    }, 0);
  }
  function getShowtimeDetailsByEvent(event) {
  if (!event || !event.showtimes) return [];

  return event.showtimes.map((showtime) => {
    const revenueInfo = event.revenueByShowtime?.find(
      (r) => r.showtimeId === showtime._id
    );

    const startDate = new Date(showtime.startTime);
    const endDate = new Date(showtime.endTime);
    const now = Date.now();

    let status = "Chưa diễn ra";
    if (now >= showtime.endTime) status = "Kết thúc";
    else if (now >= showtime.startTime) status = "Đang diễn ra";

    return {
      name: `Suất ${format(startDate, "dd/MM")}`,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      sold: showtime.soldTickets ?? revenueInfo?.soldTickets ?? 0,
      revenue: showtime.revenue ?? revenueInfo?.revenue ?? 0,
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
          const sortedEvents = originalEvents.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt); // mới nhất lên trước
          }
          if (a.createdAt) return -1;
          if (b.createdAt) return 1;
          return 0;
        });
          setEvents(sortedEvents);
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
    const idToUse = selectedEventId || eventId; // Ưu tiên selectedEventId nếu có, nếu không dùng eventId từ URL

    if (!idToUse || events.length === 0) return;

    const foundEvent = events.find((e) => e._id === idToUse);
    if (foundEvent) {
      setSelectedEvent(foundEvent);
    }
  }, [selectedEventId, eventId, events]);


  console.log("event", JSON.stringify(selectedEvent, null, 2));

  const revenue = getEventRevenue(selectedEvent);
  const sold = getSoldTickets(selectedEvent);
  const total = getTotalTicketsOfEvent(selectedEvent);
  const estimatedRevenue = getEstimatedRevenue(selectedEvent);
  const ticketTableData = getShowtimeDetailsByEvent(selectedEvent);
  console.log("ticketTableData ", ticketTableData)
  const ticketPrice = revenue / sold || 0; // Tránh chia cho 0
  const maxRevenue = calculateEstimatedRevenue(selectedEvent);
   console.log("maxRevenue ", maxRevenue)

  const eventOptions = events.map((e) => ({
    label: e.name,
    value: e._id,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3} sx={{ position: "relative" }}>
        <Box sx={{ backgroundColor: "#fff", p: 5, borderRadius: 5 }}>
          <Typography fontSize={22} fontWeight={700} gutterBottom>
            Chọn sự kiện để xem doanh thu
          </Typography>
          <SelectMenu
            label=" Chọn sự kiện"
            value={selectedEventId}
            onChange={(val) => setSelectedEventId(val)}
            options={eventOptions}
            searchable
          />
        </Box>
        <Grid container spacing={3} mt={0.5}>
          {/* <Grid item xs={12}>
            <Typography fontSize={20} sx={{ fontWeight: "bold", ml: 3 }} gutterBottom>
              Doanh thu
            </Typography>
          </Grid> */}
          <Grid item xs={12}>
            <Typography fontSize={20} fontWeight={600} sx={{ ml: 3 }} gutterBottom>
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
                position: "relative",
                overflow: "visible",
              }}
            >
              {/* Bên trái: Thông tin tổng doanh thu */}
              <Box>
                <Typography fontSize={20} fontWeight={600} gutterBottom>
                  Doanh thu
                </Typography>
                <Typography fontSize={24} fontWeight={700} gutterBottom>
                  {revenue.toLocaleString()} ₫
                </Typography>
                <Typography fontSize={18} fontWeight={500} gutterBottom>
                  Dự kiến: {estimatedRevenue.toLocaleString()} ₫
                </Typography>
              </Box>

              {/* Bên phải: DonutChart biểu diễn % đạt được */}
              <Box sx={{ width: 120, height: 120, position: "relative", zIndex: 10, overflow: "visible" }}>
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
                  <Typography fontSize={20} fontWeight={600} gutterBottom>
                    Số vé đã bán
                  </Typography>
                  <Typography fontSize={24} fontWeight={700} gutterBottom>
                    {sold} vé
                  </Typography>
                  <Typography fontSize={18} fontWeight={500} gutterBottom>
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
                <LineChartDualAxis event={selectedEvent} />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={3} mb={3} ml={0.5}>
            <Grid item xs={12}>
              <Box>
                <Typography fontSize={20} fontWeight={600} sx={{ ml: 3 }} gutterBottom>
                  Chi tiết
                </Typography>

                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="medium" sx={{ minWidth: 1000, tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "700",
                            fontSize: 16,
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
                            width: "25%",
                            paddingRight: 22,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Ngày diễn ra
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: "20%",
                            paddingRight: 9,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Số vé đã bán
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: "20%",
                            paddingRight: 17,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Doanh thu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: "20%",
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
                          <TableCell
                            sx={{
                              width: "20%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {s.name}
                          </TableCell>
                          <TableCell sx={{ width: "25%", whiteSpace: "nowrap" }}>
                            {format(new Date(s.startTime), "dd/MM/yyyy HH:mm")} -{" "}
                            {format(new Date(s.endTime), "HH:mm")}
                          </TableCell>
                          <TableCell
                            sx={{ width: "15%", whiteSpace: "nowrap", textAlign: "center" }}
                          >
                            {s.sold}
                          </TableCell>
                          <TableCell
                            sx={{ width: "20%", whiteSpace: "nowrap" }}
                          >{`${s.revenue.toLocaleString()} ₫`}</TableCell>
                          <TableCell sx={{ width: "20%", whiteSpace: "nowrap" }}>
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

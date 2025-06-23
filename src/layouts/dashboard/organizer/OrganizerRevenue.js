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
} from "@mui/material";
import { format } from "date-fns";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import SelectMenu from "./OrganizerCreateNewEvent/components/SelectMenu";
import DetailedStatisticsCard from "examples/Cards/StatisticsCards/DetailedStatisticsCard/index";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ArgonBox from "components/ArgonBox";
import { position } from "stylis";
// ✅ Dữ liệu thực tế thay cho mock
// const mockApiResponse = {
//   events: [
//     {
//       _id: "6852c70e17f8400d2e8003e2",
//       name: "2025 HYERI FANMEETING TOUR <Welcome to HYERI's STUDIO> IN HO CHI MINH CITY",
//     },
//   ],
//   eventDetails: {
//     _id: "6852c70e17f8400d2e8003e2",
//     name: "2025 HYERI FANMEETING TOUR <Welcome to HYERI's STUDIO> IN HO CHI MINH CITY",
//     showtimes: [
//       {
//         _id: "6852c70e17f8400d2e8003e4",
//         startTime: 1752310800000,
//         endTime: 1752321600000,
//         soldTickets: 0,
//       },
//     ],
//     zoneTickets: [
//       {
//         showtimeId: "6852c70e17f8400d2e8003e4",
//         name: "COURTSIDE/VIP A",
//         totalTicketCount: 99,
//         price: 3500000,
//         availableCount: 99,
//       },
//       {
//         showtimeId: "6852c70e17f8400d2e8003e4",
//         name: "VIP B / CAT 1",
//         totalTicketCount: 400,
//         price: 2500000,
//         availableCount: 400,
//       },
//       {
//         showtimeId: "6852c70e17f8400d2e8003e4",
//         name: "CAT 2 / Khu A",
//         totalTicketCount: 800,
//         price: 1500000,
//         availableCount: 800,
//       },
//       {
//         showtimeId: "6852c70e17f8400d2e8003e4",
//         name: "CAT 3 / Khu B",
//         totalTicketCount: 700,
//         price: 800000,
//         availableCount: 700,
//       },
//     ],
//   },
// };

const now = Date.now();

const mockApiResponse = {
  events: [
    {
      _id: "event123",
      name: "2025 Concert Tour - Saigon",
    },
  ],
  eventDetails: {
    _id: "event123",
    name: "2025 Concert Tour - Saigon",
    showtimes: [
      {
        _id: "show1",
        startTime: now - 3 * 60 * 60 * 1000, // 3 giờ trước
        endTime: now - 2 * 60 * 60 * 1000, // 2 giờ trước
      },
      {
        _id: "show2",
        startTime: now - 30 * 60 * 1000, // 30 phút trước
        endTime: now + 30 * 60 * 1000, // 30 phút sau
      },
      {
        _id: "show3",
        startTime: now + 2 * 60 * 60 * 1000, // 2 giờ sau
        endTime: now + 3 * 60 * 60 * 1000,
      },
    ],
    zoneTickets: [
      // Suất 1: kết thúc
      {
        showtimeId: "show1",
        name: "VIP A",
        totalTicketCount: 100,
        availableCount: 20,
        price: 3000000,
      },
      {
        showtimeId: "show1",
        name: "Standard",
        totalTicketCount: 200,
        availableCount: 50,
        price: 1500000,
      },

      // Suất 2: đang diễn ra
      {
        showtimeId: "show2",
        name: "VIP A",
        totalTicketCount: 100,
        availableCount: 90,
        price: 3000000,
      },
      {
        showtimeId: "show2",
        name: "Standard",
        totalTicketCount: 200,
        availableCount: 150,
        price: 1500000,
      },

      // Suất 3: sắp diễn ra
      {
        showtimeId: "show3",
        name: "VIP A",
        totalTicketCount: 100,
        availableCount: 100,
        price: 3000000,
      },
      {
        showtimeId: "show3",
        name: "Standard",
        totalTicketCount: 200,
        availableCount: 200,
        price: 1500000,
      },
    ],
  },
};

function OrganizerRevenue() {
  const [selectedEvent, setSelectedEvent] = useState("6852c70e17f8400d2e8003e2");
  const [events, setEvents] = useState(mockApiResponse.events);
  const [showtimes, setShowtimes] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalAttendees: 0,
  });
  const [gradientChart, setGradientChart] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const data = mockApiResponse.eventDetails;
    const { showtimes, zoneTickets } = data;

    // ✅ Tính tổng doanh thu và vé đã bán
    const totalRevenue = zoneTickets.reduce(
      (sum, t) => sum + t.price * (t.totalTicketCount - t.availableCount),
      0
    );

    const totalTicketsSold = zoneTickets.reduce(
      (sum, t) => sum + (t.totalTicketCount - t.availableCount),
      0
    );

    const totalAttendees = totalTicketsSold;

    setRevenueStats({ totalRevenue, totalTicketsSold, totalAttendees });

    // ✅ Tính doanh thu theo suất
    const showtimeData = showtimes.map((s) => {
      const revenue = zoneTickets
        .filter((t) => t.showtimeId === s._id)
        .reduce((sum, t) => sum + t.price * (t.totalTicketCount - t.availableCount), 0);

      const sold = zoneTickets
        .filter((t) => t.showtimeId === s._id)
        .reduce((sum, t) => sum + (t.totalTicketCount - t.availableCount), 0);

      return {
        name: format(new Date(s.startTime), "HH:mm"),
        datetime: s.startTime,
        sold,
        revenue,
        status: s.startTime < Date.now() ? "Kết thúc" : "Sắp diễn ra",
      };
    });

    setShowtimes(showtimeData);

    setGradientChart({
      labels: showtimeData.map((s) => format(new Date(s.datetime), "dd/MM")),
      datasets: [
        {
          label: "Doanh thu (₫)",
          data: showtimeData.map((s) => s.revenue),
          color: "success",
        },
      ],
    });

    console.log("📦 Doanh thu:", totalRevenue);
    console.log(
      "📈 GradientChart:",
      showtimeData.map((s) => s.revenue)
    );
    console.log("📊 Showtime Data:", showtimeData);
  }, [selectedEvent]);

  const eventOptions = events.map((e) => ({
    label: e.name,
    value: e._id,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3} sx={{ position: "relative" }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Chọn sự kiện để xem thống kê
        </Typography>
        <SelectMenu
          label="🗂️ Chọn sự kiện"
          value={selectedEvent}
          onChange={(val) => setSelectedEvent(val)}
          options={eventOptions}
        />
        <Grid container spacing={3} mb={3} mt={2}>
          <Grid item xs={12} md={4} lg={3}>
            <DetailedStatisticsCard
              title="🎟️ Vé đã bán"
              count={revenueStats.totalTicketsSold}
              icon={{ color: "success", component: <i className="ni ni-tag" /> }}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <DetailedStatisticsCard
              title="👥 Người tham dự"
              count={revenueStats.totalAttendees}
              icon={{ color: "warning", component: <i className="ni ni-single-02" /> }}
            />
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <DetailedStatisticsCard
              title="💰 Tổng doanh thu"
              count={revenueStats.totalRevenue.toLocaleString() + " ₫"}
              icon={{ color: "info", component: <i className="ni ni-money-coins" /> }}
            />
          </Grid>

          <Grid container spacing={3} mb={3} ml={0.5} mt={2}>
            <Grid item xs={12}>
              <GradientLineChart
                key={selectedEvent}
                title="📈 Doanh thu theo suất diễn"
                chart={gradientChart}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} mb={3} ml={0.5} mt={2}>
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                🗂️ CHI TIẾT DOANH THU THEO SUẤT
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>🎭 Tên suất diễn</TableCell>
                      <TableCell>🕒 Ngày giờ</TableCell>
                      <TableCell>🎟️ Vé bán</TableCell>
                      <TableCell>💰 Doanh thu</TableCell>
                      <TableCell>📌 Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showtimes.map((s, idx) => (
                      <TableRow
                        key={idx}
                        sx={{ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white" }}
                      >
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{format(new Date(s.datetime), "dd/MM/yyyy HH:mm")}</TableCell>
                        <TableCell>{s.sold}</TableCell>
                        <TableCell>
                          {s.revenue >= 1_000_000
                            ? `${(s.revenue / 1_000_000).toFixed(1)} triệu ₫`
                            : `${s.revenue.toLocaleString()} ₫`}
                        </TableCell>
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
      </ArgonBox>
    </DashboardLayout>
  );
}

export default OrganizerRevenue;

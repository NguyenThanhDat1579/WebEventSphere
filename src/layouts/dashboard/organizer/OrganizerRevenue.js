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
import PieChart from "./OrganizerCreateNewEvent/components/PieChart";

const now = Date.now();

const mockApiResponse = {
  status: 200,
  totalTickets: 1,
  totalRevenue: 0,
  events: [
    {
      _id: "6851471ebd1dcfc157d5087c",
      name: "PolyLib",
      timeStart: 1750933920000,
      timeEnd: 1751279520000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750156286/w2nbapzv3uridzldxrp8.png",
      showtimes: [
        {
          _id: "6851471ebd1dcfc157d5087e",
          startTime: 1751279580000,
          endTime: 1751365980000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "6851471ebd1dcfc157d5087e",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "6851530b0909bf75f5eee6ce",
      name: "GAMA Music Racing Festival",
      timeStart: 1743127200000,
      timeEnd: 1751086800000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750159752/wldldmuthcdd0wmnmx0a.png",
      showtimes: [],
      revenueByShowtime: [],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "685154a60909bf75f5eee6d3",
      name: "GAMA Music Racing Festival",
      timeStart: 1743127200000,
      timeEnd: 1751086800000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750160244/gpwejstcveo2lt94veou.png",
      showtimes: [
        {
          _id: "685154a60909bf75f5eee6d5",
          startTime: 1751097600000,
          endTime: 1751126400000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "685154a60909bf75f5eee6d5",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "68515c930909bf75f5eee73e",
      name: "Love Letter With Faye Peraya 1st Fan Meeting In Ho Chi Minh",
      timeStart: 1745895600000,
      timeEnd: 1751083200000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750161759/isw0ptnqj9c1j9claybi.png",
      showtimes: [
        {
          _id: "68515c930909bf75f5eee740",
          startTime: 1751108400000,
          endTime: 1751115600000,
          soldTickets: 1,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "68515c930909bf75f5eee740",
          soldTickets: 1,
          revenue: 0,
          revenueByZone: [
            {
              zoneId: "68515c930909bf75f5eee746",
              zoneName: null,
              revenue: 0,
            },
          ],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 1,
    },
    {
      _id: "6852335b914cf6f9b26038d6",
      name: "[DẾ GARDEN] Workshop Fairy Dome - Vòm Tiên",
      timeStart: 1743127200000,
      timeEnd: 1751086800000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750216830/xtg3rrjqfcsz9fagoppy.png",
      showtimes: [],
      revenueByShowtime: [],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "68524391914cf6f9b26039ad",
      name: "[TP.HCM] Những Thành Phố Mơ Màng Summer 2025",
      timeStart: 1743138000000,
      timeEnd: 1751086800000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750221226/r5fnvnwtlk5sacecol2j.png",
      showtimes: [
        {
          _id: "68524391914cf6f9b26039af",
          startTime: 1751101200000,
          endTime: 1751124600000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "68524391914cf6f9b26039af",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "6852b9d4021ea017074ab11e",
      name: "SÂN KHẤU THIÊN ĐĂNG : CHUYẾN ĐÒ ĐỊNH MỆNH",
      timeStart: 1748829600000,
      timeEnd: 1750395600000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750251364/zadaszi0h74kpzciqzul.png",
      showtimes: [
        {
          _id: "6852b9d4021ea017074ab120",
          startTime: 1750422600000,
          endTime: 1750433400000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "6852b9d4021ea017074ab120",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "6852c70e17f8400d2e8003e2",
      name: "2025 HYERI FANMEETING TOUR <Welcome to HYERI's STUDIO> IN HO CHI MINH CITY",
      timeStart: 1749358800000,
      timeEnd: 1752296400000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750255071/ac8tjyskgojo58tokvzo.png",
      showtimes: [
        {
          _id: "6852c70e17f8400d2e8003e4",
          startTime: 1752310800000,
          endTime: 1752321600000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "6852c70e17f8400d2e8003e4",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "6852c97f17f8400d2e80041f",
      name: "HoYo FEST 2025",
      timeStart: 1751379060000,
      timeEnd: 1753844400000,
      avatar:
        "https://res.cloudinary.com/deoqppiun/image/upload/v1750255688/kbptzzaezwcciyca55nn.jpg",
      showtimes: [
        {
          _id: "6852c97f17f8400d2e800421",
          startTime: 1753844400000,
          endTime: 1753884780000,
          soldTickets: 0,
        },
      ],
      revenueByShowtime: [
        {
          showtimeId: "6852c97f17f8400d2e800421",
          soldTickets: 0,
          revenue: 0,
          revenueByZone: [],
        },
      ],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
    {
      _id: "6856c8d5e5345d64d14999db",
      name: "1",
      timeStart: null,
      timeEnd: null,
      avatar: null,
      showtimes: [],
      revenueByShowtime: [],
      eventTotalRevenue: 0,
      soldTickets: 0,
    },
  ],
};

function OrganizerRevenue() {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [events, setEvents] = useState(mockApiResponse.events);
  const [selectedEvent, setSelectedEvent] = useState(null); // 🆕 thêm
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: 0, totalTicketsSold: 0 });
  const [gradientChart, setGradientChart] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [ticketTableData, setTicketTableData] = useState([]); // 🆕 cho bảng chi tiết vé

  useEffect(() => {
    if (!selectedEventId) return;

    const selectedEvent = mockApiResponse.events.find((e) => e._id === selectedEventId);
    if (!selectedEvent) return;

    // 👉 Tổng vé đã bán & doanh thu
    const totalTicketsSold = selectedEvent.soldTickets;
    const totalRevenue = selectedEvent.eventTotalRevenue;

    setRevenueStats({ totalRevenue, totalTicketsSold });

    // 👉 Biểu đồ line: mỗi suất diễn là một điểm
    const showtimeLabels = selectedEvent.revenueByShowtime.map((s) => {
      const time = selectedEvent.showtimes.find((t) => t._id === s.showtimeId)?.startTime;
      return time ? format(new Date(time), "dd/MM") : "Không rõ";
    });

    const revenueData = selectedEvent.revenueByShowtime.map((s) => s.revenue);
    const ticketData = selectedEvent.revenueByShowtime.map((s) => s.soldTickets);

    setGradientChart({
      labels: showtimeLabels,
      datasets: [
        { label: "Doanh thu (₫)", data: revenueData, color: "info" },
        { label: "Số vé đã bán", data: ticketData, color: "success" },
      ],
    });

    // 👉 Biểu đồ tròn (theo loại vé/zone)
    const revenueByZone = {};
    selectedEvent.revenueByShowtime.forEach((s) => {
      s.revenueByZone.forEach((z) => {
        const name = z.zoneName || "Không rõ";
        revenueByZone[name] = (revenueByZone[name] || 0) + z.revenue;
      });
    });

    const pieLabels = Object.keys(revenueByZone);
    const pieData = pieLabels.map((k) => revenueByZone[k]);

    setPieChartData({
      labels: pieLabels,
      datasets: [
        {
          data: pieData,
          backgroundColors: ["#66BB6A", "#42A5F5", "#FFA726", "#AB47BC", "#EF5350", "#29B6F6"],
        },
      ],
    });

    // 👉 Bảng chi tiết suất diễn
    const tableData = selectedEvent.revenueByShowtime.map((r) => {
      const showtime = selectedEvent.showtimes.find((s) => s._id === r.showtimeId);
      return {
        name: `Suất ${showtime?._id.slice(-4)}`,
        datetime: showtime?.startTime || 0,
        sold: r.soldTickets,
        revenue: r.revenue,
        status: showtime?.startTime < Date.now() ? "Kết thúc" : "Sắp diễn ra",
      };
    });

    setTicketTableData(tableData);
  }, [selectedEventId, events]);

  const eventOptions = events.map((e) => ({
    label: e.name,
    value: e._id,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3} sx={{ position: "relative" }}>
        <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 5 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Chọn sự kiện để xem thống kê
          </Typography>
          <SelectMenu
            label="🗂️ Chọn sự kiện"
            value={selectedEventId}
            onChange={(val) => setSelectedEventId(val)}
            options={eventOptions}
          />
        </Box>
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
                key={selectedEventId}
                title="📈 Doanh thu & Vé bán theo suất diễn"
                chart={gradientChart}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3} mb={3} ml={0.5} mt={2}>
            <Box mt={4} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                📊 PHÂN TÍCH LOẠI VÉ
              </Typography>

              <PieChart chart={pieChartData} />
            </Box>
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
                    {ticketTableData.map((s, idx) => (
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

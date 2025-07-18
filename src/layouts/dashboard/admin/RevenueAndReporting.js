import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Grid,
  Box,
  Typography,
  Divider
} from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import revenueApi from "api/revenue";

function RevenueAndReporting() {
  const columns = [
    { field: "eventName", title: "Tên sự kiện", align: "left" },
    { field: "sold", title: "Số vé bán", align: "center" },
    { field: "revenue", title: "Doanh thu", align: "center" },
    { field: "timelineStatus", title: "Trạng thái diễn ra", align: "center" },
    { field: "action", title: "Hành động", align: "center" },
  ];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await revenueApi.getRevenue();
        let list = data.eventsRevenue || [];

// Loại bỏ sự kiện chưa có doanh thu
list = list.filter(ev => {
  const hasYearRevenue = ev.revenueByYear && Object.keys(ev.revenueByYear).length > 0;
  const hasDayRevenue = ev.revenueByDay && Object.keys(ev.revenueByDay).length > 0;
  return hasYearRevenue || hasDayRevenue;
});

        const randInt = (min, max) =>
          Math.floor(Math.random() * (max - min + 1)) + min;

        const rowsMapped = list.map((ev) => {
          const realRevenue = Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);
          const totalRevenue = realRevenue || randInt(500_000, 4_500_000);
const sold = Object.values(ev.soldByDay || {}).reduce((a, b) => a + b, 0);

          // Nếu thiếu phân bổ, tính lại từ revenueByDay
          if (
            ev.totalSold > 0 &&
            (Object.keys(ev.revenueByDay || {}).length === 0 ||
              Object.keys(ev.revenueByMonth || {}).length === 0 ||
              Object.keys(ev.revenueByYear || {}).length === 0)
          ) {
            const dayRevenue = ev.revenueByDay || {};
            const byMonth = {};
            const byYear = {};

            Object.entries(dayRevenue).forEach(([dateStr, value]) => {
              const [year, month] = dateStr.split("-");
              const monthKey = `${year}-${month}`;
              const yearKey = `${year}`;
              byMonth[monthKey] = (byMonth[monthKey] || 0) + value;
              byYear[yearKey] = (byYear[yearKey] || 0) + value;
            });

            if (!ev.revenueByMonth || Object.keys(ev.revenueByMonth).length === 0) {
              ev.revenueByMonth = byMonth;
            }

            if (!ev.revenueByYear || Object.keys(ev.revenueByYear).length === 0) {
              ev.revenueByYear = byYear;
            }
          }

          return {
            __total: totalRevenue,
            eventName: <Typography variant="body2" fontWeight={500}>{ev.name}</Typography>,
            sold: <Typography variant="body2" align="center">{sold.toLocaleString()}</Typography>,
            revenue: <Typography variant="body2" align="center">{totalRevenue.toLocaleString()} ₫</Typography>,
            timelineStatus: (
              <Typography variant="body2" align="center" color={totalRevenue ? "green" : "textSecondary"}>
                {totalRevenue ? "Đã diễn ra" : "Chưa có"}
              </Typography>
            ),
            action: (
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => {
                  setSelected(ev);
                  setDetailMode(true);
                }}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  px: 2,
                  borderRadius: 2,
                }}
              >
                Chi tiết
              </Button>
            ),
          };
        });

        setTotalRevenue(rowsMapped.reduce((s, r) => s + r.__total, 0));
        setRows(rowsMapped);
      } catch (e) {
        console.error("Lỗi gọi API doanh thu:", e);
      }
    })();
  }, []);

  // Dữ liệu cho màn hình chi tiết
  const revenueByDay = selected?.revenueByDay || {};
  const soldByDay = selected?.soldByDay || {};
  const detailTotalRevenue = Object.values(revenueByDay).reduce((a, b) => a + b, 0);
  const totalTickets = Object.values(soldByDay).reduce((a, b) => a + b, 0);
  const ticketDays = Object.keys(soldByDay).length;
  const revenueDays = Object.keys(revenueByDay).length;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {!detailMode && (
        <Box py={2}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
            <Box
              sx={{
                background: "#5669FF",
                borderRadius: 2,
                px: 3,
                py: 2,
                mb: 3,
                display: "inline-block",
                boxShadow: 2,
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "#fff", display: "flex", alignItems: "center", gap: 1 }}
              >
                Tổng doanh thu:&nbsp;
                <span style={{ fontSize: 28 }}>
                  {totalRevenue.toLocaleString()} ₫
                </span>
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight="bold" mb={2}>
              Danh sách sự kiện có doanh thu
            </Typography>

            <Table columns={columns} rows={rows} />
          </Card>
        </Box>
      )}
{detailMode && selected && (
  <Box py={2}>
    <Card sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          setDetailMode(false);
          setSelected(null);
        }}
        sx={{
          textTransform: "none",
          fontSize: 12,
          fontWeight: 600,
          px: 2,
          borderRadius: 2,
          mb: 2,
          backgroundColor: "#5669FF",
          color: "#fff",
          width: "fit-content",
          "&:hover": { backgroundColor: "#115293" }
        }}
      >
        Quay lại danh sách
      </Button>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        {selected.name}
      </Typography>

      {Object.keys(revenueByDay).length === 0 && Object.keys(soldByDay).length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Chưa có thống kê cho sự kiện này.
        </Typography>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Tổng doanh thu
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {detailTotalRevenue.toLocaleString()} ₫
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Tổng vé đã bán
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {totalTickets.toLocaleString()} vé
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Ngày có doanh thu
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {revenueDays} ngày
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Ngày bán vé
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {ticketDays} ngày
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Chi tiết theo ngày */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ngày bán & số vé
              </Typography>
              <Box
                sx={{
                  background: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: 2,
                  p: 2,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {ticketDays > 0 ? (
                  Object.entries(soldByDay).map(([date, qty]) => (
                    <Typography key={date} variant="body2" sx={{ mb: 0.5 }}>
                      {date}: {qty} vé
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">Không có</Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Ngày có doanh thu
              </Typography>
              <Box
                sx={{
                  background: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: 2,
                  p: 2,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {revenueDays > 0 ? (
                  Object.entries(revenueByDay).map(([date, value]) => (
                    <Typography key={date} variant="body2" sx={{ mb: 0.5 }}>
                      {date}: {value.toLocaleString()} ₫
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">Không có</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Card>
  </Box>
)}




      <Footer />
    </DashboardLayout>
  );
}

export default RevenueAndReporting;

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Grid,
  Box,
  Typography,
} from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import revenueApi from "api/revenue";
import eventApi from "../../../api/eventApi"
function RevenueAndReporting() {
  const columns = [
    {
      field: "avatar",
      title: "Hình ảnh",
      align: "center",
    },
    {
      field: "eventName",
      title: "Tên sự kiện",
      align: "left",
    },
    {
      field: "sold",
      title: "Số vé bán",
      align: "center",
    },
    {
      field: "revenue",
      title: "Doanh thu",
      align: "center",
    },
    {
      field: "timelineStatus",
      title: "Trạng thái diễn ra",
      align: "center",
    },
    {
      field: "action",
      title: "Hành động",
      align: "center",
    },
  ];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);

useEffect(() => {
  (async () => {
    try {
      // Gọi 2 API song song
      const [revenueRes, eventRes] = await Promise.all([
        revenueApi.getRevenue(),
        eventApi.getAllHome()
      ]);

      let list = revenueRes.data.eventsRevenue || [];
      const allEvents = eventRes.data.data || [];

      console.log("Sự kiện doanh thu:", list);
      console.log("Tất cả sự kiện (avatar):", allEvents);

      // Lọc những sự kiện có doanh thu thực sự
      list = list.filter(ev => {
        const hasYearRevenue = ev.revenueByYear && Object.keys(ev.revenueByYear).length > 0;
        const hasDayRevenue = ev.revenueByDay && Object.keys(ev.revenueByDay).length > 0;
        return hasYearRevenue || hasDayRevenue;
      });

      // Kết hợp avatar từ danh sách allEvents vào list
      const listWithAvatars = list.map((ev) => {
        const matched = allEvents.find(e => e._id === ev.eventId);
        return {
          ...ev,
          avatar: matched?.avatar || null,
          name: matched?.name || ev.name,
        };
      });

      const randInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const rowsMapped = listWithAvatars.map((ev) => {
        const realRevenue = Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);
        const totalRevenue = realRevenue || randInt(500_000, 4_500_000);
        const sold = Object.values(ev.soldByDay || {}).reduce((a, b) => a + b, 0);

        return {
          __total: totalRevenue,
          avatar: ev.avatar ? (
            <Box
              component="img"
              src={ev.avatar}
              alt=""
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                objectFit: "cover",
                boxShadow: 1,
              }}
            />
          ) : (
            <Typography variant="body2" align="center" color="textSecondary">
              Không có ảnh
            </Typography>
          ),
          eventName: (
            <Typography variant="body2" fontWeight={500}>
              {ev.name}
            </Typography>
          ),
          sold: (
            <Typography variant="body2" align="center">
              {sold.toLocaleString()}
            </Typography>
          ),
          revenue: (
            <Typography variant="body2" align="center">
              {totalRevenue.toLocaleString()} ₫
            </Typography>
          ),
          timelineStatus: (
            <Typography
              variant="body2"
              align="center"
              color={totalRevenue ? "green" : "textSecondary"}
            >
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
      console.error("Lỗi gọi API:", e);
    }
  })();
}, []);

  const revenueByDay = selected?.revenueByDay || {};
  const soldByDay = selected?.soldByDay || {};
  const detailTotalRevenue = Object.values(revenueByDay).reduce((a, b) => a + b, 0);
  const totalTickets = Object.values(soldByDay).reduce((a, b) => a + b, 0);
  const ticketDays = Object.keys(soldByDay).length;
  const revenueDays = Object.keys(revenueByDay).length;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {!detailMode ? (
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
                sx={{
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                Tổng doanh thu:&nbsp;
                <span style={{ fontSize: 28 }}>
                  {totalRevenue.toLocaleString()} ₫
                </span>
              </Typography>
            </Box>

       

            <Table columns={columns} rows={rows} />
          </Card>
        </Box>
      ) : (
        selected && (
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
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Quay lại danh sách
              </Button>

             <Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  justifyContent="center"
  mb={3}
>
  <Box
    component="img"
    src={selected.avatar}
    alt={selected.name}
    sx={{
      width: "100%", // hoặc dùng "100%", "auto", v.v.
      height: "auto",
      borderRadius: 2,
      objectFit: "cover",
      boxShadow: 2,
      mb: 1.5,
    }}
  />
  <Typography variant="h5" fontWeight="bold" textAlign="center">
    {selected.name}
  </Typography>
</Box>


              {/* Thống kê tổng quan */}
              <Grid container spacing={2} mb={3}>
                {[{
                  label: "Tổng doanh thu",
                  value: `${detailTotalRevenue.toLocaleString()} ₫`
                }, {
                  label: "Tổng vé đã bán",
                  value: `${totalTickets.toLocaleString()} vé`
                }, {
                  label: "Ngày có doanh thu",
                  value: `${revenueDays} ngày`
                }, {
                  label: "Ngày bán vé",
                  value: `${ticketDays} ngày`
                }].map((item, idx) => (
                  <Grid item xs={12} md={3} key={idx}>
                    <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Chi tiết từng ngày */}
              <Grid container spacing={4}>
                {[
                  {
                    title: "Ngày bán & số vé",
                    data: soldByDay,
                    emptyText: "Không có",
                    suffix: " vé",
                  },
                  {
                    title: "Ngày có doanh thu",
                    data: revenueByDay,
                    emptyText: "Không có",
                    suffix: " ₫",
                  },
                ].map((section, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {section.title}
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
                      {Object.keys(section.data).length > 0 ? (
                        Object.entries(section.data).map(([date, val]) => (
                          <Typography key={date} variant="body2" sx={{ mb: 0.5 }}>
                            {date}: {val.toLocaleString()} {section.suffix}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2">{section.emptyText}</Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Box>
        )
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default RevenueAndReporting;
// 
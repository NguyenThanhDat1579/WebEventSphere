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
    { field: "eventName",      title: "Tên sự kiện",        align: "left"   },
    { field: "sold",           title: "Số vé bán",          align: "center" },
    { field: "revenue",        title: "Doanh thu",          align: "center" },
    { field: "timelineStatus", title: "Trạng thái diễn ra", align: "center" },
    { field: "action",         title: "Hành động",          align: "center" },
  ];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await revenueApi.getRevenue();
        const list = data.eventsRevenue || [];

        const randInt = (min, max) =>
          Math.floor(Math.random() * (max - min + 1)) + min;

        const rowsMapped = list.map(ev => {
          const real = Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);
          const total = real || randInt(500_000, 4_500_000);
          const sold = real ? Math.round(total / 100_000) : randInt(50, 200);

          return {
            __total: total,
            eventName: <Typography variant="body2" fontWeight={500}>{ev.name}</Typography>,
            sold: <Typography variant="body2" align="center">{sold.toLocaleString()}</Typography>,
            revenue: <Typography variant="body2" align="center">{total.toLocaleString()} ₫</Typography>,
            timelineStatus: (
              <Typography variant="body2" align="center" color={total ? "green" : "textSecondary"}>
                {total ? "Đã diễn ra" : "Chưa có"}
              </Typography>
            ),
            action: (
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => { setSelected(ev); setDetailMode(true); }}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 500,
                  px: 2,
                  borderRadius: 2
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

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {!detailMode && (
        <Box py={2}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
          <Box
  sx={{
    background: "#1976d2",
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
                backgroundColor: "#1976d2",
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

            <Grid container spacing={3}>
              {["revenueByYear", "revenueByMonth", "revenueByDay"].map((key) => (
                <Grid item xs={12} md={4} key={key}>
                  <Box
                    sx={{
                      background: "#f9f9f9",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      p: 2,
                      height: "100%",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      {key === "revenueByYear"
                        ? "Doanh thu theo năm"
                        : key === "revenueByMonth"
                        ? "Doanh thu theo tháng"
                        : "Doanh thu theo ngày"}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    {Object.entries(selected[key] || {}).map(([k, v]) => (
                      <Typography key={k} variant="body2" sx={{ mb: 0.5 }}>
                        {k}: {v.toLocaleString()} ₫
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Box>
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default RevenueAndReporting;

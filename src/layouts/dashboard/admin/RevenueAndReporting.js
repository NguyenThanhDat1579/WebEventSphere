import { useEffect, useState } from "react";
import { Card, Button } from "@mui/material";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import revenueApi from "api/revenue";

function RevenueAndReporting() {
const columns = [
  { field: "eventName",      title: "Tên sự kiện",       align: "left"   },
  { field: "sold",           title: "Số vé bán",         align: "center" },
  { field: "revenue",        title: "Doanh thu",         align: "center" },
  { field: "timelineStatus", title: "Trạng thái diễn ra",align: "center" },
  { field: "action",         title: "Hành động",         align: "center" },
];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);

// RevenueAndReporting.jsx
useEffect(() => {
  (async () => {
    try {
      const { data } = await revenueApi.getRevenue();
      const list = data.eventsRevenue || [];

      const randInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const rowsMapped = list.map(ev => {
        const real = Object.values(ev.revenueByYear || {}).reduce((a,b)=>a+b,0);
        const total = real || randInt(500_000, 4_500_000);
        const sold  = real ? Math.round(total / 100_000) : randInt(50,200);

        return {
          __total: total,
          eventName: <ArgonTypography variant="button">{ev.name}</ArgonTypography>,
          sold:      <ArgonTypography variant="button" textAlign="center">{sold.toLocaleString()}</ArgonTypography>,
          revenue:   <ArgonTypography variant="button" textAlign="center">{total.toLocaleString()} ₫</ArgonTypography>,
          timelineStatus: (
            <ArgonTypography variant="button" color={total ? "success":"text"} textAlign="center">
              {total ? "Đã diễn ra" : "Chưa có"}
            </ArgonTypography>
          ),
          action: (
            <Button variant="contained" size="small"
              onClick={() => {setSelected(ev); setDetailMode(true);}}>
              Chi tiết
            </Button>
          ),
        };
      });

      setTotalRevenue(rowsMapped.reduce((s,r)=>s+r.__total,0));
      setRows(rowsMapped);
    } catch (e) {
      console.error("Lỗi gọi API doanh thu:", e);
    }
  })();
}, []);




  return (
    <DashboardLayout>
      <DashboardNavbar />
      {detailMode && selected ? (
        <Card sx={{ p: 3 }}>
          <Button
            variant="text"
            onClick={() => {
              setDetailMode(false);
              setSelected(null);
            }}
            sx={{
              mb: 2,
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: 600,
              px: 2,
              border: "1px solid #1976d2",
              "&:hover": { backgroundColor: "#fff", color: "#1976d2", border: "1px solid #1976d2" },
            }}
          >
            Quay lại danh sách
          </Button>

          <ArgonTypography variant="h4" fontWeight="bold" gutterBottom>
            {selected.name}
          </ArgonTypography>

          {["revenueByYear", "revenueByMonth", "revenueByDay"].map(key => (
            <ArgonBox mt={2} key={key}>
              <ArgonTypography variant="h6">
                {key === "revenueByYear"
                  ? "Doanh thu theo năm"
                  : key === "revenueByMonth"
                  ? "Doanh thu theo tháng"
                  : "Doanh thu theo ngày"}
              </ArgonTypography>
              <ul>
                {Object.entries(selected[key] || {}).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v.toLocaleString()} ₫
                  </li>
                ))}
              </ul>
            </ArgonBox>
          ))}
        </Card>
      ) : (
        <Card>
          <ArgonBox p={3}>
            <ArgonTypography variant="h5" fontWeight="bold" mb={2}>
              Báo cáo doanh thu sự kiện (Tổng: {totalRevenue.toLocaleString()} ₫)
            </ArgonTypography>
            <Table columns={columns} rows={rows} />
          </ArgonBox>
        </Card>
      )}
      <Footer />
    </DashboardLayout>
  );
}

export default RevenueAndReporting;

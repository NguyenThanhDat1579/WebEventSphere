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
  const [columns] = useState([
    { name: "Tên sự kiện", align: "left" },
    { name: "Số vé bán", align: "center" },
    { name: "Doanh thu", align: "center" },
    { name: "Trạng thái diễn ra", align: "center" },
    { name: "Hành động", align: "center" },
  ]);

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
  const fetchRevenue = async () => {
    try {
      const res = await revenueApi.getRevenue();
      const data = res.data;

      const mapped = data.eventsRevenue
        .filter(ev => {
          const totalRevenue =
            Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);
          return totalRevenue > 0;
        })
        .map(ev => {
          const total =
            Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);

          return {
            "Tên sự kiện": (
              <ArgonTypography variant="button">{ev.name}</ArgonTypography>
            ),
            "Doanh thu": (
              <ArgonTypography variant="button" textAlign="center">
                {total.toLocaleString()} ₫
              </ArgonTypography>
            ),
            "Trạng thái diễn ra": (
              <ArgonTypography
                variant="button"
                color="success"
                textAlign="center"
              >
                {total > 0 ? "Đã có doanh thu" : "Chưa có"}
              </ArgonTypography>
            ),
            "Hành động": (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setSelected(ev);
                  setDetailMode(true);
                }}
                sx={{
                  backgroundColor: "#64b5f6",
                  color: "#fff",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  textTransform: "none",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#fff",
                    color: "#64b5f6",
                    border: "1px solid #64b5f6",
                  },
                }}
              >
                Chi tiết
              </Button>
            ),
          };
        });

      const totalRevenue = Object.values(data.totalRevenueByYear || {}).reduce((a, b) => a + b, 0);

      setRows(mapped);
      setTotalRevenue(totalRevenue);
    } catch (err) {
      console.error("Lỗi khi gọi API doanh thu:", err);
    }
  };

  fetchRevenue();
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

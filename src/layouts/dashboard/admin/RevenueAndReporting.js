import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

// Components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Mock data
const mockEvents = [
  {
    name: "Hội chợ Công nghệ 2025",
    soldTickets: 120,
    ticketPrice: 100000,
    status: "Đã duyệt",
    timeStart: "2025-06-20T08:00:00Z",
    timeEnd: "2025-06-22T17:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },

  {
    name: "Lễ hội Ẩm thực Việt",
    soldTickets: 80,
    ticketPrice: 150000,
    status: "Đã duyệt",
    timeStart: "2025-06-15T10:00:00Z",
    timeEnd: "2025-06-16T18:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Workshop Lập trình Web",
    soldTickets: 100,
    ticketPrice: 200000,
    status: "Đã duyệt",
    timeStart: "2025-06-23T08:00:00Z",
    timeEnd: "2025-06-23T17:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Hội thảo Đổi mới Sáng tạo",
    soldTickets: 90,
    ticketPrice: 120000,
    status: "Đã duyệt",
    timeStart: "2025-06-18T09:00:00Z",
    timeEnd: "2025-06-19T17:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Chương trình Ca nhạc Giao mùa",
    soldTickets: 200,
    ticketPrice: 180000,
    status: "Đã duyệt",
    timeStart: "2025-06-10T19:00:00Z",
    timeEnd: "2025-06-10T22:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Ngày hội Việc làm 2025",
    soldTickets: 60,
    ticketPrice: 100,
    status: "Đã duyệt",
    timeStart: "2025-06-05T08:00:00Z",
    timeEnd: "2025-06-05T15:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Triển lãm Nội thất Hiện đại",
    soldTickets: 150,
    ticketPrice: 120000,
    status: "Đã duyệt",
    timeStart: "2025-06-01T10:00:00Z",
    timeEnd: "2025-06-02T18:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
  {
    name: "Khóa học Thiền & Yoga",
    soldTickets: 45,
    ticketPrice: 250000,
    status: "Đã duyệt",
    timeStart: "2025-06-22T07:00:00Z",
    timeEnd: "2025-06-23T12:00:00Z",
    avatar: "https://res.cloudinary.com/dqjmnfvs1/image/upload/v1749732393/163a5bb4ca28688762920970ff950111_uihqml.png",
    description: "Hội chợ công nghệ lớn nhất năm, quy tụ các công ty hàng đầu trong lĩnh vực AI, IoT, Robotics..."
  },
];


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
  const [selected, setSelected] = useState(null);
  const [detailMode, setDetailMode] = useState(false);
  useEffect(() => {
    const now = Date.now();
    const filtered = mockEvents.filter((ev) => {
      if (ev.status !== "Đã duyệt") return false;
      const now = Date.now();
      const start = new Date(ev.timeStart).getTime();
      const end = new Date(ev.timeEnd).getTime();
      return now >= start;
    });


    const mapped = filtered.map((ev) => {
      const revenue = ev.soldTickets * ev.ticketPrice;
      const statusColor =
        Date.now() > new Date(ev.timeEnd).getTime() ? "error" : "success";

      return {
        "Tên sự kiện": (
          <ArgonTypography variant="button">{ev.name}</ArgonTypography>
        ),
        "Số vé bán": (
          <ArgonTypography variant="button" textAlign="center">
            {ev.soldTickets}
          </ArgonTypography>
        ),
        "Doanh thu": (
          <ArgonTypography variant="button" textAlign="center">
            {revenue.toLocaleString()} ₫
          </ArgonTypography>
        ),
        "Trạng thái diễn ra": (
          <ArgonTypography
            variant="button"
            color={statusColor}
            textAlign="center"
          >
            {Date.now() > new Date(ev.timeEnd).getTime()
              ? "Đã diễn ra"
              : "Đang diễn ra"}
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


    const total = filtered.reduce(
      (sum, ev) => sum + ev.soldTickets * ev.ticketPrice,
      0
    );

    setRows(mapped);
    setTotalRevenue(total);
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {detailMode ? (
        <Card sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDetailMode(false);
              setSelected(null);
            }}
            variant="text"
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.85rem",
              borderRadius: "8px",
              textTransform: "none",
              boxSizing: "border-box",
              border: "1px solid #1976d2",
              marginBottom: 2,
              px: 2,
              "&:hover": {
                backgroundColor: "#fff",
                color: "#1976d2",
                border: "1px solid #1976d2",
              },
              alignSelf: "flex-start",
            }}
          >
            Quay lại danh sách
          </Button>

          <img
            src={selected.avatar}
            alt={selected.name}
            style={{
              width: "100%",
              height: 300,
              objectFit: "cover",
              borderRadius: 12,
              marginBottom: 16,
            }}
          />

          <ArgonTypography variant="h4" fontWeight="bold" gutterBottom>
            {selected.name}
          </ArgonTypography>
          <ArgonTypography variant="body1" mt={3}>
            <strong>Mô tả:</strong>
          </ArgonTypography>
          <ArgonBox
            mt={1}
            sx={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <ArgonTypography variant="body2">
              {selected.description}
            </ArgonTypography>
          </ArgonBox>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ArgonTypography variant="body1">
                <strong>Giá vé:</strong> {selected.ticketPrice.toLocaleString()} ₫
              </ArgonTypography>
              <ArgonTypography variant="body1">
                <strong>Số vé bán:</strong> {selected.soldTickets}
              </ArgonTypography>
              <ArgonTypography variant="body1">
                <strong>Doanh thu:</strong>{" "}
                {(selected.ticketPrice * selected.soldTickets).toLocaleString()} ₫
              </ArgonTypography>
            </Grid>
            <Grid item xs={12} md={6}>
              <ArgonTypography variant="body1">
                <strong>Bắt đầu:</strong>{" "}
                {new Date(selected.timeStart).toLocaleString()}
              </ArgonTypography>
              <ArgonTypography variant="body1">
                <strong>Kết thúc:</strong>{" "}
                {new Date(selected.timeEnd).toLocaleString()}
              </ArgonTypography>
              <ArgonTypography variant="body1">
                <strong>Trạng thái:</strong> {selected.status}
              </ArgonTypography>
            </Grid>
          </Grid>
        </Card>
      ) : (
        <Card>
          <ArgonBox p={3}>
            <ArgonTypography variant="h5" fontWeight="bold" mb={2}>
              Báo cáo doanh thu sự kiện
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

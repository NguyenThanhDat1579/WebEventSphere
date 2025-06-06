import { useState } from "react";
import SearchFilterBar from "./components/SearchFilterBar";
import MyEventTable from "./components/MyEventTable";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import { format } from "date-fns";

// Dữ liệu thực từ API (giả lập tĩnh)
const eventList = [
  {
    id: "68216e4f1b8c90b1dce49399",
    name: "J97 - Dách Và Những Vì Tinh Tú",
    timeStart: "2025-06-11T19:18:00.000Z",
    timeEnd: "2025-06-21T19:18:00.000Z",
    avatar:
      "https://res.cloudinary.com/ddkqz5udn/image/upload/v1747021151/n6m0ac5r5aygbl84emtd.jpg",
    ticketPrice: 970000,
    ticketQuantity: 20,
    soldTickets: 0,
  },
  {
    id: "68216e691b8c90b1dce4939b",
    name: "J97 - Dách Và Những Vì Tinh Tú 2",
    timeStart: "2025-06-11T19:18:00.000Z",
    timeEnd: "2025-06-21T19:18:00.000Z",
    avatar:
      "https://res.cloudinary.com/ddkqz5udn/image/upload/v1747021151/n6m0ac5r5aygbl84emtd.jpg",
    ticketPrice: 970000,
    ticketQuantity: 20,
    soldTickets: 0,
  },
  {
    id: "68216e4f1b8c90b1dce49399",
    name: "J97 - Dách Và Những Vì Tinh Tú",
    timeStart: "2025-06-11T19:18:00.000Z",
    timeEnd: "2025-06-21T19:18:00.000Z",
    avatar:
      "https://res.cloudinary.com/ddkqz5udn/image/upload/v1747021151/n6m0ac5r5aygbl84emtd.jpg",
    ticketPrice: 970000,
    ticketQuantity: 20,
    soldTickets: 0,
  },
  {
    id: "68216e691b8c90b1dce4939b",
    name: "J97 - Dách Và Những Vì Tinh Tú 2",
    timeStart: "2025-06-11T19:18:00.000Z",
    timeEnd: "2025-06-21T19:18:00.000Z",
    avatar:
      "https://res.cloudinary.com/ddkqz5udn/image/upload/v1747021151/n6m0ac5r5aygbl84emtd.jpg",
    ticketPrice: 970000,
    ticketQuantity: 20,
    soldTickets: 0,
  },
];

// Chuyển đổi thành dữ liệu cần hiển thị

const transformedEvents = eventList.map((event) => {
  const parsePrice = (priceStr) => {
    const str = (priceStr ?? "").toString();
    return parseInt(str.replace(/[.,VND\s]/g, ""), 10) || 0;
  };

  const timeStart = new Date(event.timeStart);
  const timeEnd = new Date(event.timeEnd);
  const ticketPrice = parsePrice(event.ticketPrice);
  const soldTickets = event.soldTickets || 0;
  const totalTickets = event.ticketQuantity || 0; // đúng trường từ API

  return {
    id: event.id,
    title: event.name,
    date: timeStart, // Date object
    location: "Đang cập nhật", // vì dữ liệu gốc không có location
    soldTickets,
    totalTickets,
    ticketPrice,
    revenue: ticketPrice * soldTickets,
    status: timeEnd < new Date() ? "Ended" : "Published",
  };
});

function OrganizerMyEvent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const handleSearch = (value) => setSearch(value);
  const handleStatusFilter = (value) => setStatusFilter(value);
  const handleDateRange = (range) => setDateRange(range);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SearchFilterBar
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onDateRange={handleDateRange}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            {transformedEvents.length === 0 ? (
              <ArgonTypography variant="body2" color="text" mt={2}>
                Không có sự kiện nào phù hợp với bộ lọc.
              </ArgonTypography>
            ) : (
              <MyEventTable events={transformedEvents} />
            )}
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrganizerMyEvent;

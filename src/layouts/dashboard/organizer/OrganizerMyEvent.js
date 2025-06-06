import { useEffect, useState } from "react";
import SearchFilterBar from "./components/SearchFilterBar";
import MyEventTable from "./components/MyEventTable";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import eventApi from "api/utils/eventApi";

// Hàm chuyển đổi dữ liệu
const transformEvents = (events) =>
  events.map((event) => {
    // Xử lý timestamp có thể là giây hoặc millisec
    // Nếu timestamp lớn hơn 10^12 thì có thể là millisec, còn lại là giây
    const convertTimestamp = (ts) => (ts > 1e12 ? new Date(ts) : new Date(ts / 1000)); // có thể set để hiển thị thời gian phù hợp

    const timeStart = convertTimestamp(event.timeStart);
    const timeEnd = convertTimestamp(event.timeEnd);

    const ticketPrice = parseInt(event.ticketPrice, 10) || 0;
    const soldTickets = event.soldTickets || 0;
    const totalTickets = event.ticketQuantity || 0;

    return {
      id: event._id, // sửa lại lấy đúng _id
      title: event.name,
      avatar: event.avatar,
      timeStart,
      timeEnd,
      location: "Đang cập nhật", // location giả định
      soldTickets,
      totalTickets,
      ticketPrice,
      revenue: ticketPrice * soldTickets,
      status: timeEnd < new Date() ? "Ended" : "Published",
    };
  });

function OrganizerMyEvent() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventApi.getEventOfOrganization(); // truyền token
        if (response.data.status === 200) {
          setEvents(response.data.events); // cập nhật danh sách sự kiện
          setTotalRevenue(response.data.totalRevenue);
          setTotalTickets(response.data.totalTickets);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      }
    };

    fetchEvents();
  }, []);

  const transformedEvents = transformEvents(events);

  const filteredEvents = transformedEvents.filter((event) => {
    const nameMatch = event.title.toLowerCase().includes(search.toLowerCase());

    const now = new Date();
    let statusMatch = true;
    if (statusFilter === "ongoing") {
      // ongoing là hiện tại nằm trong khoảng timeStart đến timeEnd
      statusMatch = event.timeStart <= now && now <= event.timeEnd;
    } else if (statusFilter === "upcoming") {
      // sắp diễn ra: bắt đầu sau hiện tại
      statusMatch = event.timeStart > now;
    } else if (statusFilter === "ended") {
      // đã kết thúc: thời gian kết thúc trước hiện tại
      statusMatch = event.timeEnd < now;
    }
    if (statusFilter === "ongoing") {
      // ongoing là hiện tại nằm trong khoảng timeStart đến timeEnd
      statusMatch = event.timeStart <= now && now <= event.timeEnd;
    } else if (statusFilter === "upcoming") {
      // sắp diễn ra: bắt đầu sau hiện tại
      statusMatch = event.timeStart > now;
    } else if (statusFilter === "ended") {
      // đã kết thúc: thời gian kết thúc trước hiện tại
      statusMatch = event.timeEnd < now;
    }
    if (statusFilter === "ongoing") {
      // ongoing là hiện tại nằm trong khoảng timeStart đến timeEnd
      statusMatch = event.timeStart <= now && now <= event.timeEnd;
    } else if (statusFilter === "upcoming") {
      // sắp diễn ra: bắt đầu sau hiện tại
      statusMatch = event.timeStart > now;
    } else if (statusFilter === "ended") {
      // đã kết thúc: thời gian kết thúc trước hiện tại
      statusMatch = event.timeEnd < now;
    }

    let dateMatch = true;
    if (dateRange.from && event.timeStart < dateRange.from) dateMatch = false;
    if (dateRange.to && event.timeStart > dateRange.to) dateMatch = false;

    return nameMatch && statusMatch && dateMatch;
  });

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
            {filteredEvents.length === 0 ? (
              <ArgonTypography variant="body2" color="text" mt={2}>
                Không có sự kiện nào phù hợp với bộ lọc.
              </ArgonTypography>
            ) : (
              <MyEventTable events={filteredEvents} />
            )}
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrganizerMyEvent;

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
import EventDetail from "./components/EventDetail";
import CircularProgress from "@mui/material/CircularProgress";

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true); // bắt đầu loading
        const response = await eventApi.getEventOfOrganization();
        if (response.data.status === 200) {
          setEvents(response.data.events);
          setTotalRevenue(response.data.totalRevenue);
          setTotalTickets(response.data.totalTickets);
        } else {
          console.error("Lấy sự kiện thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy sự kiện", error);
      } finally {
        setIsLoading(false); // kết thúc loading dù thành công hay thất bại
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

  const handleViewDetail = (eventId) => {
    setSelectedEvent(eventId); // chỉ lưu ID
    setIsDetailView(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={1} sx={{ position: "relative" }}>
        {isDetailView && selectedEvent ? (
          <EventDetail eventId={selectedEvent} onClose={() => setIsDetailView(false)} />
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SearchFilterBar
                  onSearch={handleSearch}
                  onStatusFilter={handleStatusFilter}
                  onDateRange={handleDateRange}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                {isLoading ? (
                  <ArgonBox display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                  </ArgonBox>
                ) : filteredEvents.length === 0 ? (
                  <ArgonTypography variant="body2" color="text" mt={2}>
                    Không có sự kiện nào phù hợp với bộ lọc.
                  </ArgonTypography>
                ) : (
                  <MyEventTable events={filteredEvents} onViewDetail={handleViewDetail} />
                )}
              </Grid>
            </Grid>
          </>
        )}
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default OrganizerMyEvent;

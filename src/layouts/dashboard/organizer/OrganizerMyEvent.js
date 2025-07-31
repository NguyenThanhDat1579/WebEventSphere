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

     const timeStartMs = timeStart.getTime();
    const timeEndMs = timeEnd.getTime();
    const now = Date.now();

    // ✅ Đồng bộ trạng thái theo thời gian
    let status = "Upcoming";
    if (timeStartMs <= now && now <= timeEndMs) {
      status = "Ongoing";
    } else if (timeEndMs < now) {
      status = "Ended";
    }



    return {
      id: event._id, // giữ nguyên
      title: event.name,
      avatar: event.avatar,
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      location: event.location, // giả định
      showtimes: event.showtimes ?? [], // ✅ thêm showtimes đầy đủ

      // Tổng số vé và vé đã bán toàn sự kiện
      soldTickets: event.soldTickets ?? 0,
      totalTickets: event.totalTicketsEvent ?? 0,

      // Doanh thu tổng từ backend (từ revenueByShowtime hoặc eventTotalRevenue)
      revenue: event.eventTotalRevenue ?? 0,

      // Bạn có thể tính giá vé trung bình nếu muốn:
      ticketPrice:
        event.soldTickets && event.eventTotalRevenue
          ? event.eventTotalRevenue / event.soldTickets
          : 0,
      status, // Trạng thái sự kiện
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


  useEffect(() => {
    fetchEvents();
  }, []);

  const transformedEvents = transformEvents(events);

  const filteredEvents = transformedEvents.filter((event) => {
    const keyword = typeof search === "string" ? search.toLowerCase() : "";
    const title = typeof event.title === "string" ? event.title.toLowerCase() : "";

    const nameMatch = title.includes(keyword);

    const now = Date.now(); // dùng timestamp cho khớp với event.timeStart
    let statusMatch = true;

    if (statusFilter === "ongoing") {
      // sự kiện đang diễn ra (bán vé hoặc đang hoạt động)
      statusMatch = event.timeStart <= now && now <= event.timeEnd;
    } else if (statusFilter === "upcoming") {
      // sắp tới (chưa bắt đầu)
      statusMatch = event.timeStart > now;
    } else if (statusFilter === "ended") {
      // đã kết thúc (hết thời gian tổ chức)
      statusMatch = event.timeEnd < now;
    }

    let dateMatch = true;
    if (dateRange.from && event.timeStart < dateRange.from.getTime()) dateMatch = false;
    if (dateRange.to && event.timeStart > dateRange.to.getTime()) dateMatch = false;

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
                  onResetData={fetchEvents}
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
    </DashboardLayout>
  );
}

export default OrganizerMyEvent;

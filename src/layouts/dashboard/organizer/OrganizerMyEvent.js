import { useEffect, useState } from "react";
import SearchFilterBar from "./components/SearchFilterBar";
import MyEventTable from "./components/MyEventTable";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Grid from "@mui/material/Grid";
import eventApi from "api/utils/eventApi";
import EventDetail from "./components/EventDetail";
import CircularProgress from "@mui/material/CircularProgress";

// Hàm chuyển đổi dữ liệu
const transformEvents = (events) =>
  events.map((event) => {
    const convertTimestamp = (ts) => (ts > 1e12 ? new Date(ts) : new Date(ts / 1000));

    const timeStart = convertTimestamp(event.timeStart);
    const timeEnd = convertTimestamp(event.timeEnd);

    const timeStartMs = timeStart.getTime();
    const timeEndMs = timeEnd.getTime();
    const now = Date.now();

    let status = "Upcoming";
    if (timeStartMs <= now && now <= timeEndMs) {
      status = "Ongoing";
    } else if (timeEndMs < now) {
      status = "Ended";
    }

    return {
      id: event._id,
      title: event.name,
      avatar: event.avatar,
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      location: event.location,
      showtimes: event.showtimes ?? [],
      soldTickets: event.soldTickets ?? 0,
      totalTickets: event.totalTicketsEvent ?? 0,
      revenue: event.eventTotalRevenue ?? 0,
      status,
      createdAt: event.createdAt ?? null,
      approvalStatus: event.approvalStatus ?? null,
      approvalReason: event.approvalReason ?? "Kiểm tra lại",
    };
  });

function OrganizerMyEvent() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState("");
  const [timeStatusFilter, setTimeStatusFilter] = useState("");

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventApi.getEventOfOrganization();
      if (response.data.status === 200) {
        setEvents(response.data.events);
      } else {
        console.error("Lấy sự kiện thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API lấy sự kiện", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const transformedEvents = transformEvents(events);

  const filteredEvents = transformedEvents
    .filter((event) => {
      const keyword = typeof search === "string" ? search.toLowerCase() : "";
      const title = typeof event.title === "string" ? event.title.toLowerCase() : "";
      const nameMatch = title.includes(keyword);

      const now = Date.now();
      let timeMatch = true;
      if (timeStatusFilter === "ongoing") {
        timeMatch = event.timeStart <= now && now <= event.timeEnd;
      } else if (timeStatusFilter === "upcoming") {
        timeMatch = event.timeStart > now;
      } else if (timeStatusFilter === "ended") {
        timeMatch = event.timeEnd < now;
      }

      let approvalMatch = true;
      if (approvalStatusFilter) {
        approvalMatch = event.approvalStatus === approvalStatusFilter;
      }

      let dateMatch = true;
      if (dateRange.from && event.timeStart < dateRange.from.getTime()) dateMatch = false;
      if (dateRange.to && event.timeStart > dateRange.to.getTime()) dateMatch = false;

      return nameMatch && timeMatch && approvalMatch && dateMatch;
    })
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a.createdAt) return -1;
      if (b.createdAt) return 1;
      return 0;
    });

  const handleSearch = (value) => setSearch(value);
  const handleTimeStatusFilter = (value) => setTimeStatusFilter(value);
  const handleDateRange = (range) => setDateRange(range);
  const handleViewDetail = (eventId) => {
    setSelectedEvent(eventId);
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
                  onApprovalStatusFilter={setApprovalStatusFilter}
                  onTimeStatusFilter={handleTimeStatusFilter}
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

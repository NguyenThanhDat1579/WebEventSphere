import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import SelectMenu from "./OrganizerCreateNewEvent/components/SelectMenu";
import eventApi from "../../../api/utils/eventApi";
import ArgonBox from "components/ArgonBox";
import ArgonButton from "components/ArgonButton";

function OrganizerTicketsAndAttendees() {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [organizationEvents, setOrganizationEvents] = useState([]);
  const [showtimeOptions, setShowtimeOptions] = useState([]); // lấy từ tickets API

 // 1. Lấy danh sách sự kiện mà tổ chức đang sở hữu
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          const res = await eventApi.getEventOfOrganization();
          setOrganizationEvents(res.data?.events || []);
        } catch (error) {
          console.error("❌ Lỗi lấy danh sách sự kiện của tổ chức:", error);
        }
      };

      fetchEvents();
    }, []);


// 2. Khi chọn sự kiện, gọi API lấy vé + danh sách suất diễn (zoneTicketId)
useEffect(() => {
  const fetchTickets = async () => {
    if (!selectedEvent) {
      setShowtimeOptions([]);
      return;
    }

    try {
      const res = await eventApi.getAllTicketsByEvent(selectedEvent);
      const tickets = res.data?.data?.tickets || [];
     const groupBy = (array, keyGetter) => {
      const map = new Map();
      array.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
      return map;
    };

    const formatTime = (date) =>
      `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    const formatDate = (date) =>
      `${date.getDate().toString().padStart(2, "0")}/${
        (date.getMonth() + 1).toString().padStart(2, "0")
      }/${date.getFullYear()}`;

    const grouped = groupBy(tickets, (t) => t.name);

    const formattedShowtimes = Array.from(grouped.entries()).map(([name, items]) => {
      const times = items.map((t) => ({
        start: new Date(t.startTime),
        end: new Date(t.endTime),
        value: t.zoneTicketId || t.ticketId || t._id,
      }));

      // Dùng thời gian sớm nhất và trễ nhất
      const earliestStart = new Date(Math.min(...times.map((t) => t.start.getTime())));
      const latestEnd = new Date(Math.max(...times.map((t) => t.end.getTime())));

      return {
        label: `${formatTime(earliestStart)} - ${formatTime(latestEnd)} ${formatDate(earliestStart)} - ${name}`,
        value: times[0].value, // chọn 1 value đại diện (hoặc cần xử lý nhiều value nếu dùng)
      };
    });

    setShowtimeOptions(formattedShowtimes);

    } catch (error) {
      console.error("Lỗi khi lấy danh sách suất diễn:", error);
      setShowtimeOptions([]);
    }
  };

  fetchTickets();
}, [selectedEvent]);

// 3. Khi chọn cả sự kiện và suất diễn, lọc người dùng đã mua vé theo zone
useEffect(() => {
  const fetchAttendees = async () => {
    if (!selectedEvent || !selectedShowtime) {
      setAttendees([]);
      return;
    }

    try {
      const res = await eventApi.getAllTicketsByEvent(selectedEvent);
      const soldTickets = res.data?.data?.soldTickets || [];

      const filtered = soldTickets.filter(
        (ticket) => ticket.zoneTicketId === selectedShowtime
      );

      const mapped = filtered.map((item) => ({
        id: item.ticketId,
        name: item.userName,
        email: item.userName,
        ticketType: item.zoneName,
        status:
          item.status === "issued"
            ? "not-used"
            : item.status === "used"
            ? "checked-in"
            : "cancelled",
      }));

      setAttendees(mapped);
    } catch (error) {
      console.error("Lỗi lấy danh sách người tham dự:", error);
      setAttendees([]);
    }
  };

  fetchAttendees();
}, [selectedEvent, selectedShowtime]);

  // Check-in một người
  const handleCheckIn = (id) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "checked-in" } : a))
    );
  };

  // Hủy vé một người
  const handleCancel = (id) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
    );
  };

  // Làm mới bộ lọc
  const handleResetFilters = () => {
    setTicketFilter("");
    setStatusFilter("");
    setSearchTerm("");
  };

  // Lọc người tham dự theo từ khoá, loại vé, trạng thái
  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTicket =
      ticketFilter === "" || attendee.ticketType.toLowerCase() === ticketFilter;
    const matchesStatus =
      statusFilter === "" || attendee.status === statusFilter;
    return matchesSearch && matchesTicket && matchesStatus;
  });

  return (
    <DashboardLayout>
      <Box sx={{ position: "relative"}}>
    
        {/* Chọn sự kiện và suất diễn */}
        <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chọn sự kiện & suất chiếu
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box sx={{ minWidth: 1000 }}>
          <SelectMenu
            label="Chọn sự kiện"
            value={selectedEvent}
            searchable
            onChange={(val) => {
              setSelectedEvent(val);
              setSelectedShowtime("");
              setAttendees([]);
            }}
            options={organizationEvents.map((event) => ({
          label: event.name,
          value: event._id,
        }))}
           />
        </Box>

        <Box sx={{ minWidth: 500 }}>
          <SelectMenu
            label="Chọn suất diễn"
            value={selectedShowtime}
            onChange={(val) => setSelectedShowtime(val)}
           options={showtimeOptions}
          />
        </Box>
      </Box>
    </Paper>

        {/* Bộ lọc tìm kiếm và làm mới */}
        <Paper elevation={2} sx={{ mb: 5, p: 2 }}>
          <Typography variant="h6" mb={2}>
             Danh sách người tham dự
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              placeholder="Tìm kiếm tên / email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Box sx={{ minWidth: 150 }}>
              <SelectMenu
                label="Trạng thái"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "✅ Đã check-in", value: "checked-in" },
                  { label: "❌ Chưa sử dụng", value: "not-used" },
                  { label: "🚫 Hủy", value: "cancelled" },
                ]}
              />
            </Box>
             <ArgonBox mb={1}>
               <ArgonButton
                  color="info"
                  size="small"
                  variant="contained"
                  onClick={handleResetFilters}
                >
                   Làm mới
                </ArgonButton>
             </ArgonBox>
               
          </Box>

          {/* Bảng danh sách người tham dự */}
          <TableContainer>
            <Table>
      
                <TableRow>
                  <TableCell sx={{ width: "25%",fontWeight: 600, fontSize: "0.95rem"}}>Tên khách</TableCell>
                  <TableCell sx={{ width: "25%",fontWeight: 600, fontSize: "0.95rem" }}>Email</TableCell>
                  <TableCell sx={{ width: "15%",fontWeight: 600, fontSize: "0.95rem" }}>Loại vé</TableCell>
                  <TableCell sx={{ width: "15%",fontWeight: 600, fontSize: "0.95rem" }}>Trạng thái</TableCell>
                  <TableCell sx={{ width: "20%",fontWeight: 600, fontSize: "0.95rem" }}>Hành động</TableCell>
                </TableRow>

              <TableBody>
                {filteredAttendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Không có người tham dự</TableCell>
                  </TableRow>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell>{attendee.name}</TableCell>
                      <TableCell>{attendee.email}</TableCell>
                      <TableCell>{attendee.ticketType}</TableCell>
                      <TableCell>
                        {attendee.status === "checked-in"
                          ? "✅ Đã check-in"
                          : attendee.status === "not-used"
                          ? "❌ Chưa sử dụng"
                          : "🚫 Hủy"}
                      </TableCell>
                      <TableCell>
                        {attendee.status === "not-used" && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleCheckIn(attendee.id)}
                          >
                            Check-in
                          </Button>
                        )}
                        {attendee.status !== "cancelled" && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancel(attendee.id)}
                            sx={{ ml: 1 }}
                          >
                            Hủy
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          
        </Paper>

        <Footer />
      </Box>
    </DashboardLayout>
  );
}

export default OrganizerTicketsAndAttendees;

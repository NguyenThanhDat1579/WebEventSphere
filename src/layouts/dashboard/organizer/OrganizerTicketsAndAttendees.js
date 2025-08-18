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
  Chip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import SelectMenu from "./OrganizerCreateNewEvent/components/SelectMenu";
import eventApi from "../../../api/utils/eventApi";
import ArgonBox from "components/ArgonBox";
import ArgonButton from "components/ArgonButton";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function OrganizerTicketsAndAttendees() {
  const [organizationEvents, setOrganizationEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetail, setEventDetail] = useState({});
  const [selectedShowtime, setSelectedShowtime] = useState("");
  const [attendees, setAttendees] = useState([]);

  const [localAttendees, setLocalAttendees] = useState(attendees);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAttendees = localAttendees.filter((attendee) => {
  const lowerSearch = searchTerm.toLowerCase();
  const matchesSearch =
    (attendee.userName ?? "").toLowerCase().includes(lowerSearch) ||
    (attendee.ticketId ?? "").toLowerCase().includes(lowerSearch);

  const matchesStatus =
    statusFilter === "all" || attendee.status === statusFilter;

  return matchesSearch && matchesStatus;
});

function formatEventTime(timeStart, timeEnd) {
  if (!timeStart || !timeEnd) return "Suất chiếu";

  const start = new Date(timeStart);
  const end = new Date(timeEnd);

  const pad = (n) => (n < 10 ? "0" + n : n);

  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  const date = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;

  return `${startTime} - ${endTime} ${date}`;
}


console.log("✅ Danh sách đã lọc:", filteredAttendees);


  const handleLocalCheckIn = (index) => {
      setLocalAttendees((prev) =>
        prev.map((attendee, i) =>
          i === index ? { ...attendee, status: "used" } : attendee
        )
      );
    };

  const handleLocalCancel = (index) => {
      setLocalAttendees((prev) => {
        const updated = [...prev];
        const current = updated[index];

        if (current.status === "canceled") {
          current.status = "issued"; // Bỏ hủy
        } else {
          current.status = "canceled"; // Hủy
        }

        return updated;
      });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `${day}/${month}/${year} - ${time}`;
      };



  // Lấy danh sách sự kiện của tổ chức
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

  // Gọi danh sách vé theo sự kiện
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!selectedEvent) {
        setAttendees([]);
        return;
      }

      try {
        const res = await eventApi.getAllTicketsByEvent(selectedEvent);
        const event = organizationEvents.find(e => e._id === selectedEvent);
        console.log("danh sách vé", res.data);
       setEventDetail({
        ...event,          // dữ liệu cơ bản từ organizationEvents
        ...res.data.data,  // dữ liệu chi tiết từ API
      });
      } catch (error) {
        console.error("❌ Lỗi lấy danh sách vé của sự kiện:", error);
      }
    };

    fetchAttendees();
  }, [selectedEvent]);


  useEffect(() => {
  if (!eventDetail?.soldTickets) {
    setAttendees([]);
    return;
  }


  if (selectedShowtime) {
    const filtered = eventDetail.soldTickets.filter(
      (ticket) => ticket.showtimeId === selectedShowtime
    );

    setAttendees(filtered);
  } else {
    setAttendees(eventDetail.soldTickets);
  }
}, [selectedShowtime, eventDetail]);



  useEffect(() => {
  setLocalAttendees(attendees);
}, [attendees]);



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box sx={{ position: "relative"}}>
    
        {/* Chọn sự kiện và suất diễn */}
        <Paper elevation={2} sx={{ mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Chọn sự kiện
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
      </Box>
    </Paper>

        {/* Bộ lọc tìm kiếm và làm mới */}
        <Paper elevation={2} sx={{ mb: 5, p: 2 }}>
          <Typography variant="h6" mb={2}>
             Danh sách người tham dự
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField
              placeholder="Tìm kiếm email / mã vé"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}

              sx={{ minWidth: 300 }}
            />
              {/* <Box sx={{ minWidth: 300 }}>
            <SelectMenu
              label="Chọn suất diễn"
              value={selectedShowtime}
              onChange={(val) => setSelectedShowtime(val)}
              options={ eventDetail?.tickets?.map((ticket) => ({
                label: ticket.name,
                value: ticket.showtimeId,
              }))}
            />
            </Box> */}
            <Box sx={{ minWidth: 180 }}>
              <SelectMenu
                label="Trạng thái"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Đã check-in", value: "used" },
                  { label: "Chưa sử dụng", value: "issued" },
                  { label: "Đã huỷ", value: "canceled" },
                ]}
              />
            </Box>
            {eventDetail?.showtimes && eventDetail.showtimes.length > 1 && (
              <Box sx={{ minWidth: 300 }}>
                <SelectMenu
                  label="Chọn suất chiếu"
                  value={selectedShowtime}
                  onChange={(value) => setSelectedShowtime(value)}
                  options={eventDetail.showtimes.map((st, index) => ({
                    value: st.id || st._id,   // dùng id chính xác từ API
                    label: `Suất ${index + 1} - ${formatEventTime(st.startTime, st.endTime)}`                  
                  }))}
                />
              </Box>
            )}
             <ArgonBox mb={1}>
               <ArgonButton
                  color="info"
                  size="small"
                  variant="contained"
                   onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSelectedShowtime("")
                  }}
                >
                   Làm mới
                </ArgonButton>
             </ArgonBox>
               
          </Box>

          {/* Bảng danh sách người tham dự */}
           <TableContainer>
            <Table>
              <TableRow>
                 <TableCell sx={{ width: "5%", fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ width: "15%", fontWeight: 600 }}>
                  Mã vé
                </TableCell>
                <TableCell sx={{ width: "25%", fontWeight: 600 }}>
                  Email
                </TableCell>
                <TableCell sx={{ width: "15%", fontWeight: 600 }}>
                  Trạng thái
                </TableCell>
                {/* <TableCell sx={{ width: "20%", fontWeight: 600 }}>
                  Hành động
                </TableCell> */}
               {filteredAttendees.some(a => a.zoneName && a.zoneName !== "Sơ đồ ghế") && (
                  <TableCell sx={{ width: "15%", fontWeight: 600 }}>Loại vé</TableCell>
                )}
                <TableCell sx={{ width: "20%", fontWeight: 600 }}>
                  Ngày phát hành
                </TableCell>
              </TableRow>
              <TableBody>
               {filteredAttendees.map((attendee, index) => (
                  <TableRow key={attendee.id}>
                    <TableCell>{index + 1}</TableCell>
                      <TableCell>{attendee.ticketId}</TableCell>
                    <TableCell>{attendee.userName}</TableCell>
                    <TableCell>
                     {attendee.status === "used" ? (
                        <Chip
                          label="Đã check-in"
                          color="success"
                          icon={<CheckIcon />}
                          sx={{ color: '#fff' , p: 1}}
                        />
                      ) : attendee.status === "issued" ? (
                        <Chip
                          label="Chưa sử dụng"
                          color="warning"
                          icon={<AccessTimeIcon />}
                          sx={{ color: '#fff', p: 1 }}
                        />
                      ) : (
                        <Chip
                          label="Đã hủy"
                          color="error"
                          icon={<CancelIcon />}
                           sx={{ color: '#fff', p: 1 }}
                        />
                      )}
                    </TableCell>
                     {attendee.zoneName && attendee.zoneName !== "Sơ đồ ghế" && (
                        <TableCell>{attendee.zoneName}</TableCell>
                      )}
                      {/* <TableCell>
                      {attendee.status === "issued" && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleLocalCheckIn(index)}
                        >
                          Check-in
                        </Button>
                      )}
                      {attendee.status !== "used" && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleLocalCancel(index)}
                          sx={{ ml: 1 }}
                        >
                           {attendee.status === "canceled" ? "Bỏ hủy" : "Hủy"}
                        </Button>
                      )}
                    </TableCell> */}
                    <TableCell>{formatDate(attendee.issuedAt)}</TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

export default OrganizerTicketsAndAttendees;

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Grid,
  Box,
  Typography,
  TextField,
  TableCell,
  TableBody,
  TableRow,
  Table,
  TableContainer,
  TableHead,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  ListItemAvatar,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import revenueApi from "api/revenue";
import eventApi from "../../../api/eventApi";
import userApi from "api/userApi";
import Table1 from "examples/Tables/Table";

function RevenueAndReporting() {
  const columns = [
    { field: "avatar", title: "Hình ảnh", align: "center" },
    { field: "eventName", title: "Tên sự kiện", align: "left" },
    { field: "timeEnd", title: "Ngày kết thúc", align: "center" },
    { field: "sold", title: "Số vé bán", align: "center" },
    { field: "revenue", title: "Doanh thu", align: "center" },
    { field: "profit", title: "Phí nền tảng", align: "center" },
    { field: "status", title: "Trạng thái", align: "center" },
    { field: "action", title: "Hành động", align: "center" },
  ];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPlatformFee, setTotalPlatformFee] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [searchOrganizer, setSearchOrganizer] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [eventsRevenue, setEventsRevenue] = useState([]);
  const [openRowId, setOpenRowId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  // Function to fetch organizers
  const fetchOrganizers = async () => {
    try {
      const res = await userApi.getAll();
      const organizerAccounts = res.data.data.filter((user) => user.role === 2);
      setOrganizers(organizerAccounts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà tổ chức:", error);
    }
  };

  // Đồng bộ: Hàm lọc thống nhất, giống AdminDashboard
  const getFinishedEvents = (events, currentTime = Date.now()) => {
    return events
      .filter(event => event.timeEnd && new Date(event.timeEnd).getTime() < currentTime) // Kiểm tra timeEnd
      .map((event) => {
        const pastShowtimes = (event.showtimes || []).filter(
          (show) => new Date(show.endTime).getTime() < currentTime
        );
        if (pastShowtimes.length === 0) return null;
        const lastShowtime = pastShowtimes.reduce((latest, show) =>
          new Date(show.endTime).getTime() > new Date(latest.endTime).getTime() ? show : latest
        );
        return {
          ...event,
          showtimeEnd: new Date(lastShowtime.endTime).getTime(),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.showtimeEnd - a.showtimeEnd);
  };

  // Đồng bộ: Hàm tính tổng doanh thu thống nhất
  const calculateTotalRevenue = (event) => {
  if (event.revenueByMonth && Object.keys(event.revenueByMonth).length > 0) {
    return Object.values(event.revenueByMonth).reduce((a, b) => a + b, 0);
  } else if (event.revenueByDay && Object.keys(event.revenueByDay).length > 0) {
    return Object.values(event.revenueByDay).reduce((a, b) => a + b, 0);
  } else if (event.revenueByYear && Object.keys(event.revenueByYear).length > 0) {
    return Object.values(event.revenueByYear).reduce((a, b) => a + b, 0);
  }
  return 0;
  };


  // Function to merge event and revenue data
  const mergeEventAndRevenueData = (allEvents, revenueList) => {
    const excludedNames = [ // Đồng bộ: Kết hợp danh sách excluded từ cả hai component
      "V CONCERT RẠNG RỠ VIỆT NAM - CHẠM VÀO ĐỈNH CAO CỦA ÂM NHẠC VÀ CẢM XÚC",
      "Nhà Hát Kịch IDECAF: LƯƠNG SƠN BÁ CHÚC ANH ĐÀI ngoại truyện",
      "CON QUỶ RỐI - Bạn sợ khi xem kịch ma",
      "Đêm Nhạc Ái Phương - Về Nhà",
      "test",
      "SỰ kiện chưa bắt đầu",
      "abc1",
      "câ"
    ];

    // Merge allEvents with revenueList
    const mergedEvents = allEvents.map((event) => {
      const revenueInfo = revenueList.find((r) => String(r.eventId) === String(event._id)); // Đồng bộ: Ép kiểu String
      return {
        ...event,
        avatar: event.avatar,
        name: event.name,
        revenueByYear: revenueInfo?.revenueByYear || {},
        revenueByMonth: revenueInfo?.revenueByMonth || {},
        revenueByDay: revenueInfo?.revenueByDay || {},
        totalSold: revenueInfo?.totalSold || 0,
        soldByDay: revenueInfo?.soldByDay || {},
      };
    });

    // Filter for finished events and exclude specific names
    const finishedEvents = getFinishedEvents(mergedEvents).filter(
      (event) => !excludedNames.includes(event.name)
    );

    return finishedEvents;
  };


  // Function to filter revenue events
  const filterRevenueEvents = (revenueList) => {
    return revenueList.filter((ev) => {
      const hasYearRevenue = ev.revenueByYear && Object.keys(ev.revenueByYear).length > 0;
      const hasDayRevenue = ev.revenueByDay && Object.keys(ev.revenueByDay).length > 0;
      return hasYearRevenue || hasDayRevenue;
    });
  };

  const organizerOfSelected = selected
  ? organizers.find(org => {
      const eventUserId = typeof selected.userId === "object" ? selected.userId._id : selected.userId;
      return org._id === eventUserId;
    })
  : null;


  // Function to add avatars to revenue list
  const addAvatarsToRevenueList = (revenueList, allEvents) => {
    return revenueList.map((ev) => {
      const matched = allEvents.find((e) => {
        const eventId = String(ev.eventId).trim();
        const eId = String(e._id).trim();
        return eventId === eId;
      });
      return {
        ...ev,
        avatar: matched?.avatar || null,
        name: matched?.name || ev.name,
      };
    });
  };

  // Function to map rows for the table
  const mapRows = (finishedEvents) => {
    const rowsMapped = finishedEvents.map((ev) => {
      const totalRevenue = calculateTotalRevenue(ev); // Đồng bộ: Sử dụng hàm mới
      const sold = Object.values(ev.soldByDay || {}).reduce((a, b) => a + b, 0);
      const profit = totalRevenue * 0.05;
      return {
        __total: totalRevenue,
        avatar: ev.avatar ? (
          <Box
            component="img"
            src={ev.avatar}
            alt=""
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              objectFit: "cover",
              boxShadow: 1,
            }}
          />
        ) : (
          <Typography variant="body2" align="center" color="textSecondary">
            Không có ảnh
          </Typography>
        ),
        eventName: (
          <Typography variant="body2" fontWeight={500}>
            {ev.name}
          </Typography>
        ),
        timeEnd: (
          <Typography variant="body2" align="center">
            {new Date(ev.showtimeEnd).toLocaleDateString("vi-VN")}
          </Typography>
        ),
        sold: (
          <Typography variant="body2" align="center">
            {sold.toLocaleString()}
          </Typography>
        ),
        revenue: (
          <Typography variant="body2" align="center">
            {totalRevenue.toLocaleString()} ₫
          </Typography>
        ),
        profit: (
          <Typography variant="body2" align="center" color="primary">
            {profit.toLocaleString("vi-VN")} ₫
          </Typography>
        ),
        status: (
          <Chip
            label={ev.isPayment ? "Đã thanh toán" : "Chưa thanh toán"}
            color={ev.isPayment ? "success" : "warning"}
            size="small"
            sx={{ color: "#fff" }}
          />
        ),
        action: (
          <Button
            size="small"
            variant="contained"
            color="info"
            onClick={() => {
              setSelected(ev);
              setDetailMode(true);
            }}
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 500,
              px: 2,
              borderRadius: 2,
            }}
          >
            Chi tiết
          </Button>
        ),
      };
    });

    return rowsMapped;
  };

  // Fetch data and process it
  const fetchAndProcessData = async () => {
    try {
      setLoading(true);
      const [revenueRes, eventRes] = await Promise.all([
        revenueApi.getRevenue(),
        eventApi.getAll(),
      ]);

      const revenueList = revenueRes.data.eventsRevenue || [];
      let allEvents = Array.isArray(eventRes.data) 
      ? eventRes.data 
      : eventRes.data.data || [];

      allEvents = allEvents.map((event) => ({
        ...event,
        isPayment: event.isPayment || true, // mặc định tất cả event chưa thanh toán
      }));


      const finishedEvents = mergeEventAndRevenueData(allEvents, revenueList);


      const filteredRevenueList = filterRevenueEvents(revenueList);
      const listWithAvatars = addAvatarsToRevenueList(filteredRevenueList, allEvents);

      setEventsRevenue(listWithAvatars);
      setAllEvents(allEvents);


      const rowsMapped = mapRows(finishedEvents);
      const totalRev = rowsMapped.reduce((s, r) => s + r.__total, 0);
      setTotalRevenue(totalRev);
      setTotalPlatformFee(totalRev * 0.05);
      setRows(rowsMapped);
      setLoading(false);
    } catch (e) {
      console.error("Lỗi gọi API:", e);
    } finally {
      setLoading(false); // tắt loading
    }
  };

  // Effect for fetching organizers
  useEffect(() => {
    fetchOrganizers();
  }, []);

  // Effect for fetching and processing event/revenue data
  useEffect(() => {
    fetchAndProcessData();
  }, []);

  // Process organizers with events
  const organizersWithEvents = organizers.map((org) => {
    // Lấy tất cả sự kiện thuộc organizer
    const organizerEvents = allEvents.filter((event) => {
      const eventUserId =
        typeof event.userId === "object" ? event.userId._id : event.userId;
      return eventUserId === org._id;
    });

    // Lọc sự kiện đã kết thúc theo showtime cuối cùng
    const finishedEvents = getFinishedEvents(organizerEvents).map((event) => {
      const revenueData = eventsRevenue.find((rev) => rev.eventId === event._id);
      return {
        ...event,
        revenueByDay: revenueData?.revenueByDay || {},
        revenueByMonth: revenueData?.revenueByMonth || {},
        revenueByYear: revenueData?.revenueByYear || {},
        totalSold: revenueData?.totalSold || 0,
        soldByDay: revenueData?.soldByDay || {},

      };
    });

    return {
      _id: org._id,
      email: org.email,
      username: org.username,
      picUrl: org.picUrl,
      role: org.role,
      ticketsHave: org.ticketsHave,
      phoneNumber: org.phoneNumber,
      events: finishedEvents, // giờ đồng bộ với tab "Doanh thu sự kiện"
    };
  });


  // Lọc theo input search
  const filteredOrganizers = organizersWithEvents.filter((org) => {
    const name = org.username?.toLowerCase?.() || "";
    const email = org.email?.toLowerCase?.() || "";
    return (
      name.includes(searchOrganizer.toLowerCase()) ||
      email.includes(searchOrganizer.toLowerCase())
    );
  });


  const handleOrganizerSearchChange = (e) => {
    setSearchOrganizer(e.target.value);
  };

  const revenueByDay = selected?.revenueByDay || {};
  const soldByDay = selected?.soldByDay || {};
  const detailTotalRevenue = Object.values(revenueByDay).reduce((a, b) => a + b, 0);
  const totalTickets = Object.values(soldByDay).reduce((a, b) => a + b, 0);
  const ticketDays = Object.keys(soldByDay).length;
  const revenueDays = Object.keys(revenueByDay).length;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredRows = rows.filter((r) => {
    const name = r.eventName?.props?.children?.toLowerCase?.() || "";
    return name.includes(search.toLowerCase());
  });



  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={2}>
        <Card sx={{ borderRadius: 3, p: 3 }}>
          {loading ? (
            <Box
              sx={{
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={50} color="primary" />
            </Box>
             ) : (
              <>
            <Box
            sx={{
              background: "#5669FF",
              borderRadius: 2,
              px: 3,
              py: 2,
              mb: 3,
              display: "inline-block",
              boxShadow: 2,
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
                Tổng doanh thu:&nbsp;
                <span style={{ fontSize: 24 }}>{totalRevenue.toLocaleString("vi-VN")} ₫</span>
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
                Tổng phí nền tảng:&nbsp;
                <span style={{ fontSize: 24 }}>{totalPlatformFee.toLocaleString("vi-VN")} ₫</span>
              </Typography>
            </Box>
          </Box>

          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab
              label="Doanh thu sự kiện"
              sx={{
                fontWeight: tabIndex === 0 ? "bold" : "normal",
                fontSize: 16,
                textTransform: "none",
                color: tabIndex === 0 ? "#5669FF" : "inherit",
              }}
            />
            <Tab
              label="Doanh thu nhà tổ chức"
              sx={{
                fontWeight: tabIndex === 1 ? "bold" : "normal",
                fontSize: 16,
                textTransform: "none",
                color: tabIndex === 1 ? "#5669FF" : "inherit",
              }}
            />
          </Tabs>

          {tabIndex === 0 && (!detailMode ? (
            <Box>
              <Card sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
                <Box sx={{ width: 300, mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      placeholder="Nhập tên sự kiện"
                      size="small"
                      value={search}
                      onChange={handleSearchChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Box>
                <Table1 columns={columns} rows={filteredRows} />
              </Card>
            </Box>
          ) : (
            selected && (
              <Box py={2}>
                <Card sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
                 <Box display="flex" justifyContent="space-between" mb={2}>
                  {/* Nút Quay lại danh sách bên trái */}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      setDetailMode(false);
                      setSelected(null);
                    }}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      px: 2,
                      borderRadius: 2,
                      backgroundColor: "#5669FF",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#115293" },
                    }}
                  >
                    Quay lại danh sách
                  </Button>

                  {/* Nút Thanh toán bên phải */}
                {!selected.isPayment && (
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        backgroundColor: "#28a745", // màu xanh lá cây
                        color: "#fff",              // chữ trắng
                        "&:hover": { backgroundColor: "#218838" }, // màu hover tối hơn
                      }}
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `https://api.eventsphere.io.vn/api/events/confirmPayment/${selected._id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                            }
                          );
                          if (!res.ok) throw new Error("Thanh toán thất bại");
                          setSelected((prev) => ({ ...prev, isPayment: true }));
                          setRows((prevRows) =>
                            prevRows.map((r) =>
                              r.eventName.props.children === selected.name
                                ? {
                                    ...r,
                                    status: (
                                      <Chip
                                        label="Đã thanh toán"
                                        color="success"
                                        size="small"
                                        sx={{ color: "#fff" }}
                                      />
                                    ),
                                  }
                                : r
                            )
                          );
                          alert("Thanh toán thành công!");
                        } catch (error) {
                          console.error(error);
                          alert("Có lỗi khi thanh toán");
                        }
                      }}
                    >
                      Thanh toán
                    </Button>
                  )}
                </Box>

                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={3}>
                    <Box
                      component="img"
                      src={selected.avatar}
                      alt={selected.name}
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 2,
                        objectFit: "cover",
                        boxShadow: 2,
                        mb: 1.5,
                      }}
                    />
                    <Typography variant="h5" fontWeight="bold" textAlign="center">
                      {selected.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} mb={3}>
                    {[
                      { label: "Tổng doanh thu", value: `${detailTotalRevenue.toLocaleString()} ₫` },
                      { label: "Tổng vé đã bán", value: `${totalTickets.toLocaleString()} vé` },
                      { label: "Ngày có doanh thu", value: `${revenueDays} ngày` },
                      { label: "Ngày bán vé", value: `${ticketDays} ngày` },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={3} key={idx}>
                        <Box sx={{ p: 2, background: "#f1f1f1", borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {item.label}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={4}>
                    {[
                      { title: "Ngày bán & số vé", data: soldByDay, emptyText: "Không có", suffix: " vé" },
                      { title: "Ngày có doanh thu", data: revenueByDay, emptyText: "Không có", suffix: " ₫" },
                    ].map((section, i) => (
                      <Grid item xs={12} md={6} key={i}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {section.title}
                        </Typography>
                        <Box
                          sx={{
                            background: "#fafafa",
                            border: "1px solid #eee",
                            borderRadius: 2,
                            p: 2,
                            maxHeight: 300,
                            overflow: "auto",
                          }}
                        >
                          {Object.keys(section.data).length > 0 ? (
                            Object.entries(section.data).map(([date, val]) => (
                              <Typography key={date} variant="body2" sx={{ mb: 0.5 }}>
                                {date}: {val.toLocaleString()} {section.suffix}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2">{section.emptyText}</Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                <Box display="flex" justifyContent="space-between" mb={2} mt={2} gap={2}>
                {/* Box trái: Thông tin nhà tổ chức */}
                <Box flex={1} display="flex" gap={2} mr={2}>
                  <Box
                    sx={{
                      background: "#fafafa",
                      border: "1px solid #eee",
                      borderRadius: 2,
                      p: 2,
                      width: "100%",
                    }}
                  >
                    <Avatar  sx={{ width: 80, height: 80 }} src={organizerOfSelected?.picUrl} alt={organizerOfSelected?.username} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {organizerOfSelected?.username || "Không rõ"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {organizerOfSelected?.email || ""}
                    </Typography>
                  </Box>
                </Box>

                {/* Box phải: Thông tin ngân hàng */}
                <Box
                  flex={1}
                  sx={{
                    background: "#fafafa",
                    border: "1px solid #eee",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600} gutterBottom color="text.primary">
                  Thông tin ngân hàng
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Chủ tài khoản: {organizerOfSelected?.bankAccountHolder || ""}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Số tài khoản: {organizerOfSelected?.bankAccountNumber || ""}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Tên ngân hàng: {organizerOfSelected?.bankName || ""}
                </Typography>
                </Box>
              </Box>


                </Card>
              </Box>
            )
          ))}

          {tabIndex === 1 && (
            <Box sx={{ position: "relative", boxShadow: 4, borderRadius: 3 }}>
              <Box m={3} sx={{ width: "30%" }}>
                <TextField
                  placeholder="Nhập tên hoặc email"
                  size="small"
                  value={searchOrganizer}
                  onChange={handleOrganizerSearchChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, p: 2 }}>
                <Table>
                  <TableRow>
                    <TableCell width={"10%"}><strong>Avatar</strong></TableCell>
                    <TableCell width={"20%"}><strong>Nhà tổ chức</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Tổng doanh thu</strong></TableCell>
                    <TableCell><strong>Phí nền tảng</strong></TableCell>
                    <TableCell><strong>Tổng sự kiện</strong></TableCell>
                  </TableRow>
                  <TableBody>
                    {filteredOrganizers.map((org) => {
                      const totalRevenue = org.events.reduce((sum, event) => {
                        return sum + calculateTotalRevenue(event); // Đồng bộ: Sử dụng hàm mới
                      }, 0);
                      const totalTickets = org.events.reduce(
                        (sum, event) => sum + (event.totalSold || 0),
                        0
                      );
                      const isOpen = openRowId === org._id;

                      return (
                        <React.Fragment key={org._id}>
                          <TableRow
                            hover
                            onClick={() => setOpenRowId(isOpen ? null : org._id)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell><Avatar src={org.picUrl} alt={org.username} /></TableCell>
                            <TableCell><Typography fontWeight={600}>{org.username}</Typography></TableCell>
                            <TableCell>{org.email}</TableCell>
                            <TableCell>{totalRevenue.toLocaleString("vi-VN")} ₫</TableCell>
                            <TableCell>{(totalRevenue * 0.05).toLocaleString("vi-VN")} ₫</TableCell>
                            <TableCell>
                              <Typography fontSize={13}>{org.events.length} sự kiện</Typography>
                              <Typography color="primary" fontSize={16}>
                                {isOpen ? "Đóng" : "Xem chi tiết"}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={6} sx={{ py: 0 }}>
                              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <Box sx={{ pl: 4, py: 2 }}>
                                  {org.events.length > 0 ? (
                                    <List dense>
                                      {org.events.map((event) => {
                                        const totalRevenue = calculateTotalRevenue(event); // Đồng bộ: Sử dụng hàm mới

                                        return (
                                          <ListItem
                                            key={event._id || event.eventId}
                                            sx={{
                                              mb: 1.5,
                                              p: 2,
                                              borderRadius: 2,
                                              backgroundColor: "#f9f9ff",
                                              boxShadow: 1,
                                              "&:hover": {
                                                backgroundColor: "#eef0ff",
                                                cursor: "pointer",
                                              },
                                            }}
                                          >
                                            <ListItemAvatar>
                                              <Avatar
                                                src={event.avatar || ""}
                                                alt={event.name}
                                                variant="rounded"
                                                sx={{
                                                  width: 100,
                                                  height: 60,
                                                  borderRadius: 2,
                                                  mr: 2,
                                                }}
                                              />
                                            </ListItemAvatar>
                                            <Grid container spacing={1} alignItems="center">
                                              <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" fontWeight={600} noWrap>
                                                  {event.name}
                                                </Typography>
                                              </Grid>
                                              <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                  Tổng doanh thu:{" "}
                                                  <Typography component="span" variant="body2" fontWeight={500} color="text.primary">
                                                    {totalRevenue.toLocaleString("vi-VN")} ₫
                                                  </Typography>
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                  Tổng vé đã bán:{" "}
                                                  <Typography component="span" variant="caption" fontWeight={500} color="text.primary">
                                                    {event.totalSold || 0} vé
                                                  </Typography>
                                                </Typography>
                                              </Grid>
                                            </Grid>
                                          </ListItem>
                                        );
                                      })}
                                    </List>
                                  ) : (
                                    <Typography color="text.secondary">Không có sự kiện</Typography>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
             )}
            </>
          )}
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default RevenueAndReporting;
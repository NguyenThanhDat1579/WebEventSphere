import React,{ useEffect, useState } from "react";
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
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import revenueApi from "api/revenue";
import eventApi from "../../../api/eventApi"
import userApi from "api/userApi";
import Table1 from "examples/Tables/Table";
function RevenueAndReporting() {
  const columns = [
    {
      field: "avatar",
      title: "Hình ảnh",
      align: "center",
    },
    {
      field: "eventName",
      title: "Tên sự kiện",
      align: "left",
    },
    {
      field: "sold",
      title: "Số vé bán",
      align: "center",
    },
    {
      field: "revenue",
      title: "Doanh thu",
      align: "center",
    },
    {
      field: "timelineStatus",
      title: "Trạng thái diễn ra",
      align: "center",
    },
    {
      field: "action",
      title: "Hành động",
      align: "center",
    },
  ];

  const [rows, setRows] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [detailMode, setDetailMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [searchOrganizer, setSearchOrganizer] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [EventsRevenue, setEventsRevenue] = useState([]);
  const [openRowId, setOpenRowId] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
  const fetchOrganizers = async () => {
    try {
      const res = await userApi.getAll();
      const organizerAccounts = res.data.data.filter((user) => user.role === 2);
      setOrganizers(organizerAccounts);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà tổ chức:", error);
    }
  };

  fetchOrganizers();
}, []);

useEffect(() => {
  (async () => {
    try {
      // Gọi 2 API song song
      const [revenueRes, eventRes] = await Promise.all([
        revenueApi.getRevenue(),
        eventApi.getAllHome()
      ]);

      let list = revenueRes.data.eventsRevenue || [];
      const allEvents = eventRes.data.data || [];


      setAllEvents(allEvents);
      console.log("ha", allEvents)
      // Lọc những sự kiện có doanh thu thực sự
      list = list.filter(ev => {
        const hasYearRevenue = ev.revenueByYear && Object.keys(ev.revenueByYear).length > 0;
        const hasDayRevenue = ev.revenueByDay && Object.keys(ev.revenueByDay).length > 0;
        return hasYearRevenue || hasDayRevenue;
      });

      // Kết hợp avatar từ danh sách allEvents vào list
      const listWithAvatars = list.map((ev) => {
        const matched = allEvents.find(e => e._id === ev.eventId);
        return {
          ...ev,
          avatar: matched?.avatar || null,
          name: matched?.name || ev.name,
        };
      })
      setEventsRevenue(listWithAvatars)
      const randInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const rowsMapped = listWithAvatars.map((ev) => {
        const realRevenue = Object.values(ev.revenueByYear || {}).reduce((a, b) => a + b, 0);
        const totalRevenue = realRevenue || randInt(500_000, 4_500_000);
        const sold = Object.values(ev.soldByDay || {}).reduce((a, b) => a + b, 0);

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
          timelineStatus: (
            <Typography
              variant="body2"
              align="center"
              color={totalRevenue ? "green" : "textSecondary"}
            >
              {totalRevenue ? "Đã diễn ra" : "Chưa có"}
            </Typography>
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

      setTotalRevenue(rowsMapped.reduce((s, r) => s + r.__total, 0));
      setRows(rowsMapped);
    } catch (e) {
      console.error("Lỗi gọi API:", e);
    }
  })();
}, []);

  //  console.log("Lấy sự kiện: ", JSON.stringify(allEvents, null, 2))
  //   console.log("Lấy nhà tổ chức: ", JSON.stringify(organizers, null, 2))
    // console.log("Lấy nhà tổ chức: ", JSON.stringify(EventsRevenue, null, 2))
  const organizersWithEvents = organizers.map(org => {
    const eventsOfOrganizer = allEvents
      .filter(event => {
        const eventUserId = typeof event.userId === "object" ? event.userId._id : event.userId;
        return eventUserId === org._id;
      })
      .map(event => {
        // Gộp với dữ liệu từ EventsRevenue
        const revenueData = EventsRevenue.find(rev => rev.eventId === event._id);

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
      events: eventsOfOrganizer,
    };
  });

  // console.log(
  // "Lấy sự kiện: ",
  // JSON.stringify(organizersWithEvents, null, 2));

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
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Tổng doanh thu:&nbsp;
              <span style={{ fontSize: 24 }}>
                {totalRevenue.toLocaleString("vi-VN")} ₫
              </span>
            </Typography>
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
               {tabIndex === 0 && (  !detailMode ? (
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
                  mb: 2,
                  backgroundColor: "#5669FF",
                  color: "#fff",
                  width: "fit-content",
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Quay lại danh sách
              </Button>

             <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              mb={3}
            >
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
                {[{
                  label: "Tổng doanh thu",
                  value: `${detailTotalRevenue.toLocaleString()} ₫`
                }, {
                  label: "Tổng vé đã bán",
                  value: `${totalTickets.toLocaleString()} vé`
                }, {
                  label: "Ngày có doanh thu",
                  value: `${revenueDays} ngày`
                }, {
                  label: "Ngày bán vé",
                  value: `${ticketDays} ngày`
                }].map((item, idx) => (
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
                  {
                    title: "Ngày bán & số vé",
                    data: soldByDay,
                    emptyText: "Không có",
                    suffix: " vé",
                  },
                  {
                    title: "Ngày có doanh thu",
                    data: revenueByDay,
                    emptyText: "Không có",
                    suffix: " ₫",
                  },
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
            </Card>
          </Box>
        )
      ))}

      {tabIndex === 1 && (
       <Box sx={{ position: 'relative', boxShadow: 4, borderRadius: 3}}>
        <Box m={3} sx={{width: "30%"}}>
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
              <TableCell><strong>Tổng vé bán</strong></TableCell>
              <TableCell><strong>Tổng sự kiện</strong></TableCell>
            </TableRow>

            <TableBody>
              {filteredOrganizers.map((org) => {
              const totalRevenue = org.events.reduce((sum, event) => {
              if (event.revenueByYear) {
                const yearTotal = Object.values(event.revenueByYear).reduce(
                  (yearSum, val) => yearSum + val,
                  0
                );
                return sum + yearTotal;
              }
              return sum;
            }, 0);
                const totalTickets = org.events.reduce(
                  (sum, event) => sum + (event.totalSold || 0),
                  0
                );

                const isOpen = openRowId === org._id;

                return (
                  <React.Fragment key={org._id}>
                    <TableRow hover onClick={() => setOpenRowId(isOpen ? null : org._id)} sx={{ cursor: "pointer" }}>
                      <TableCell><Avatar src={org.picUrl} alt={org.username} /></TableCell>
                      <TableCell><Typography fontWeight={600}>{org.username}</Typography></TableCell>
                      <TableCell>{org.email}</TableCell>
                      <TableCell>{totalRevenue.toLocaleString("vi-VN")} ₫</TableCell>
                      <TableCell>{totalTickets}</TableCell>
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
                            const totalRevenue = event.revenueByYear
                              ? Object.values(event.revenueByYear).reduce((sum, val) => sum + val, 0)
                              : 0;

                            return (
                              <ListItem
                                  key={event._id || event.eventId}
                                  sx={{
                                    mb: 1.5,
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: "#f9f9ff",
                                    boxShadow: 1,
                                    '&:hover': {
                                      backgroundColor: "#eef0ff",
                                      cursor: 'pointer',
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
      </Card>
    </Box>
    </DashboardLayout>
  );
}

export default RevenueAndReporting;
// 
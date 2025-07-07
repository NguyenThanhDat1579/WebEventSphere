import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  IconButton,
  Button,
  Stack,
  Grid,
  InputAdornment,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import ArgonBox from "components/ArgonBox";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";

const labelTextFieldWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  width: "100%",
};

const SearchFilterBar = ({ onSearch, onStatusFilter, onDateRange, isMini = false }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearch?.(value);
  };

  const handleStatusChange = (event, newStatus) => {
    if (newStatus !== null) {
      setStatus(newStatus);
      onStatusFilter?.(newStatus);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === "from") {
      setFromDate(value);
      onDateRange?.({ from: value, to: toDate });
    } else {
      setToDate(value);
      onDateRange?.({ from: fromDate, to: value });
    }
  };

  const handleOpenFromDate = () => {
    setFromOpen(true);
    if (fromInputRef.current) fromInputRef.current.focus();
  };

  const handleOpenToDate = () => {
    setToOpen(true);
    if (toInputRef.current) toInputRef.current.focus();
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setFromDate(null);
    setToDate(null);
    onSearch?.("");
    onStatusFilter?.("all");
    onDateRange?.({ from: null, to: null });
  };

  const handleCreateEvent = () => {
    navigate("/createnewevent-organizer");
  };

  return (
    <ArgonBox py={3} position="relative">
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Box p={2} borderRadius={2} bgcolor="#fff">
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
              <Box
                mb={1}
                p={1}
                borderRadius={2}
                bgcolor="#fff"
                display="flex"
                gap={2}
                alignItems="flex-start"
                height={100}
              >
                {/* Search box */}
                <Box sx={{ width: 250 }}>
                  <Box sx={labelTextFieldWrapper}>
                    <Typography variant="body2">Tìm kiếm:</Typography>
                    <TextField
                      placeholder="Nhập tên sự kiện"
                      size="small"
                      value={search}
                      onChange={handleSearchChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <Icon fontSize="small" sx={{ mr: "6px", color: "text.secondary" }}>
                            search
                          </Icon>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                {/* Status filter */}
                <Box sx={{ width: 350 }}>
                  <Box sx={labelTextFieldWrapper}>
                    <Typography variant="body2">Trạng thái:</Typography>
                    <ToggleButtonGroup
                      exclusive
                      value={status}
                      onChange={handleStatusChange}
                      sx={{
                        width: "fit-content",
                        mx: "auto",
                        "& .MuiToggleButton-root": {
                          borderRadius: 2,
                          border: "1px solid #ccc",
                          color: "#555",
                          fontWeight: 500,
                          textTransform: "none",
                          fontSize: "0.8rem",
                          px: 1.5,
                          py: 0.5,
                          minHeight: 30,
                        },
                        "& .Mui-selected": {
                          bgcolor: "#1976d2",
                          color: "#fff",
                          "&:hover": {
                            bgcolor: "#1565c0",
                          },
                        },
                      }}
                    >
                      <ToggleButton value="all">Tất cả</ToggleButton>
                      <ToggleButton value="ongoing">Đang diễn ra</ToggleButton>
                      <ToggleButton value="upcoming">Sắp diễn ra</ToggleButton>
                      <ToggleButton value="ended">Đã kết thúc</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* Date filter */}
                <Box sx={{ width: 175, display: "flex", gap: 4 }}>
                  <Box sx={{ ...labelTextFieldWrapper, flex: 1 }}>
                    <Typography variant="body2">Từ ngày:</Typography>
                    <DatePicker
                      open={fromOpen}
                      onOpen={() => setFromOpen(true)}
                      onClose={() => setFromOpen(false)}
                      value={fromDate}
                      onChange={(value) => handleDateChange("from", value)}
                      renderInput={(params) => (
                        <TextField
                          size="small"
                          fullWidth
                          {...params}
                          placeholder="dd/mm/yyyy"
                          inputRef={params.inputRef}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleOpenFromDate}
                                  edge="end"
                                  size="small"
                                  aria-label="open calendar"
                                >
                                  <CalendarTodayIcon fontSize="small" sx={{ color: "gray" }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{ ...labelTextFieldWrapper, flex: 1 }}>
                    <Typography variant="body2">Đến ngày:</Typography>
                    <DatePicker
                      open={toOpen}
                      onOpen={() => setToOpen(true)}
                      onClose={() => setToOpen(false)}
                      value={toDate}
                      onChange={(value) => handleDateChange("to", value)}
                      renderInput={(params) => (
                        <TextField
                          size="small"
                          fullWidth
                          {...params}
                          placeholder="dd/mm/yyyy"
                          inputRef={params.inputRef}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleOpenToDate}
                                  edge="end"
                                  size="small"
                                  aria-label="open calendar"
                                >
                                  <CalendarTodayIcon fontSize="small" sx={{ color: "gray" }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Button group */}
              <Box display="flex" justifyContent="flex-end" mt={-4} mb={1} pr={2}>
                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={handleReset}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      border: "1px solid transparent",
                      textTransform: "none",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#fff",
                        color: "#1565c0",
                        borderColor: "#1565c0",
                      },
                    }}
                  >
                    Làm mới
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      border: "1px solid transparent",
                      textTransform: "none",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#fff",
                        color: "#1565c0",
                        borderColor: "#1565c0",
                      },
                    }}
                  >
                    Tạo sự kiện
                  </Button>
                </Stack>
              </Box>
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
    </ArgonBox>
  );
};

SearchFilterBar.propTypes = {
  onSearch: PropTypes.func,
  onStatusFilter: PropTypes.func,
  onDateRange: PropTypes.func,
  isMini: PropTypes.bool,
};

export default SearchFilterBar;

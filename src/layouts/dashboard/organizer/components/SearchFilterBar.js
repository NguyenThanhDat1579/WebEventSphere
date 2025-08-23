import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Icon,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import viLocale from "date-fns/locale/vi";
import ArgonBox from "components/ArgonBox";
import ArgonButton from "components/ArgonButton";
import SelectMenu from "../OrganizerCreateNewEvent/components/SelectMenu";
import { useNavigate } from "react-router-dom";

const labelTextFieldWrapper = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  width: "100%",
};

const SearchFilterBar = ({
  onSearch,
  onDateRange,
  onResetData,
  onApprovalStatusFilter,
  onTimeStatusFilter,
  isMini = false,
}) => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [timeStatus, setTimeStatus] = useState("");

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearch?.(value);
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

  const handleReset = () => {
    setSearch("");
    setFromDate(null);
    setToDate(null);
    setApprovalStatus("");
    setTimeStatus("");
    onSearch?.("");
    onDateRange?.({ from: null, to: null });
    onApprovalStatusFilter?.("");
    onTimeStatusFilter?.("");
    onResetData?.();
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
              <Grid container spacing={2} mb={2}>
                {/* Tìm kiếm */}
                <Grid item xs={12} md={4}>
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
                </Grid>

                {/* Trạng thái duyệt */}
                <Grid item xs={12} md={4}>
                  <Box sx={labelTextFieldWrapper}>
                    <Typography variant="body2">Trạng thái duyệt:</Typography>
                    <SelectMenu
                      label="Trạng thái duyệt"
                      value={approvalStatus}
                      onChange={(val) => {
                        setApprovalStatus(val);
                        onApprovalStatusFilter?.(val);
                      }}
                      options={[
                        { label: "Tất cả", value: "" },
                        { label: "Đã duyệt", value: "approved" },
                        { label: "Chờ duyệt", value: "pending" },
                        { label: "Từ chối", value: "rejected" },
                        { label: "Tạm hoãn", value: "postponed" },
                      ]}
                    />
                  </Box>
                </Grid>

                {/* Trạng thái thời gian */}
                <Grid item xs={12} md={4}>
                  <Box sx={labelTextFieldWrapper}>
                    <Typography variant="body2">Trạng thái thời gian:</Typography>
                    <SelectMenu
                      label="Trạng thái thời gian"
                      value={timeStatus}
                      onChange={(val) => {
                        setTimeStatus(val);
                        onTimeStatusFilter?.(val);
                      }}
                      options={[
                        { label: "Tất cả", value: "all" },
                        { label: "Đang diễn ra", value: "ongoing" },
                        { label: "Sắp diễn ra", value: "upcoming" },
                        { label: "Đã kết thúc", value: "ended" },
                      ]}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Buttons */}
              <Grid container spacing={2} alignItems="flex-end">
                 <Grid item xs={12} md={9}></Grid>
                <Grid item>
                  <ArgonButton
                    color="info"
                    size="small"
                    onClick={handleReset}
                    variant="contained"
                    sx={{ py: 1.4 }}
                  >
                    Làm mới
                  </ArgonButton>
                </Grid>

                <Grid item>
                  <ArgonButton
                    color="info"
                    size="small"
                    variant="contained"
                    onClick={handleCreateEvent}
                    sx={{ py: 1.4 }}
                  >
                    Tạo sự kiện
                  </ArgonButton>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
    </ArgonBox>
  );
};

SearchFilterBar.propTypes = {
  onSearch: PropTypes.func,
  onDateRange: PropTypes.func,
  onResetData: PropTypes.func,
  onApprovalStatusFilter: PropTypes.func,
  onTimeStatusFilter: PropTypes.func,
  isMini: PropTypes.bool,
};

export default SearchFilterBar;

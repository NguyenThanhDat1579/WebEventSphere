import React from "react";
import PropTypes from "prop-types";
import { Box, TextField, InputAdornment } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // ✅ Bổ sung
dayjs.locale("vi"); // ✅ Đặt locale

const CustomDateTimePicker = ({ label, value, onChange, placeholder, error, helperText, name }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box sx={{ width: "100%", maxWidth: "100%" }}>
        <DateTimePicker
          ampm={false} // 24h
          label={label || "Chọn ngày giờ"}
          value={value ? dayjs(value) : null}
          onChange={onChange}
          inputFormat="DD/MM/YYYY HH:mm"
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              name={name}
              placeholder={placeholder || "DD/MM/YYYY HH:mm"}
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>
    </LocalizationProvider>
  );
};

CustomDateTimePicker.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  name: PropTypes.string,
};

CustomDateTimePicker.defaultProps = {
  label: "",
  placeholder: "",
  error: false,
  helperText: "",
  name: "",
};

export default CustomDateTimePicker;

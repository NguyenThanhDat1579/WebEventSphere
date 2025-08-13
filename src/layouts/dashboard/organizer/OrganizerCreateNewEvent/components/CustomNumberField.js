import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const CustomNumberField = ({
  label,
  value,
  onChange,
  placeholder,
  maxWidth = "80ch",
  error = false,
  helperText = "",
  sx = {},
  inputSx = {},
  min = 0,
  max = 10,
  ...rest
}) => {
  const isStringValue = typeof value === "string" || typeof value === "number";

  const handleInputChange = (e) => {
    let inputVal = e.target.value;

    // Chỉ cho phép số
    if (!/^\d*$/.test(inputVal)) return;

    // Giới hạn giá trị
    if (inputVal !== "" && (Number(inputVal) < min || Number(inputVal) > max)) return;

    onChange(e);
  };

  return (
    <Box sx={{ width: "100%", maxWidth, position: "relative", ...sx }}>
      {label && (
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
      )}

      <Box
        component="input"
        type="number"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        min={min}
        max={max}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 14px",
          border: error ? "1px solid red" : "1px solid rgba(0,0,0,0.23)",
          borderRadius: 2,
          fontSize: "1rem",
          fontFamily: "Roboto, sans-serif",
          "&:focus": {
            outline: "none",
            borderColor: error ? "red" : "#1976d2",
          },
          ...inputSx,
        }}
        {...rest}
      />

      {/* Error text */}
      {error && helperText && (
        <Typography
          variant="caption"
          sx={{ color: "red", mt: 0.5, ml: "4px", display: "block" }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

CustomNumberField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  inputSx: PropTypes.object,
  min: PropTypes.number,
  max: PropTypes.number,
};

CustomNumberField.defaultProps = {
  label: "",
  placeholder: "",
  maxWidth: "80ch",
  error: false,
  helperText: "",
  sx: {},
  inputSx: {},
  min: 0,
  max: 10,
};

export default CustomNumberField;

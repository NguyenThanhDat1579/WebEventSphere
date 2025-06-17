import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const CustomTextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  maxWidth = "80ch",
  error = false,
  helperText = "",
  sx = {},
  inputSx = {},
  ...rest
}) => {
  return (
    <Box sx={{ width: "100%", maxWidth, position: "relative", ...sx }}>
      {label && (
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
      )}

      {/* Input field */}
      <Box
        component="input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...(maxLength ? { maxLength } : {})}
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

      {/* Max length count */}
      {maxLength !== undefined && (
        <Typography
          sx={{
            position: "absolute",
            bottom: helperText ? 28 : 9, // tránh đè nếu có helperText
            right: 8,
            fontSize: 12,
            color: "gray",
            pointerEvents: "none",
            userSelect: "none",
            padding: "0 4px",
          }}
        >
          {value.length} / {maxLength}
        </Typography>
      )}

      {/* Lỗi hiển thị dưới input */}
      {error && helperText && (
        <Typography variant="caption" sx={{ color: "red", mt: 0.5, ml: "4px", display: "block" }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

CustomTextField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  maxLength: PropTypes.number,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  inputSx: PropTypes.object,
};

CustomTextField.defaultProps = {
  label: "",
  placeholder: "",
  type: "text",
  maxWidth: "80ch",
  error: false,
  helperText: "",
  sx: {},
  inputSx: {},
};

export default CustomTextField;

import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const CustomTextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text", // ✅ Mặc định là text, có thể truyền datetime-local
  maxLength,
  maxWidth = "80ch",
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
          border: "1px solid rgba(0,0,0,0.23)",
          borderRadius: 2,
          fontSize: "1rem",
          fontFamily: "Roboto, sans-serif",
          "&:focus": {
            outline: "none",
            borderColor: "#1976d2",
          },
          ...inputSx,
        }}
        {...rest}
      />

      {maxLength !== undefined && (
        <Typography
          sx={{
            position: "absolute",
            bottom: 9,
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
    </Box>
  );
};

CustomTextField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string, // ✅ mới thêm
  maxLength: PropTypes.number,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object,
  inputSx: PropTypes.object,
};

CustomTextField.defaultProps = {
  label: "",
  placeholder: "",
  type: "text", // ✅ mặc định là text
  maxWidth: "80ch",
  sx: {},
  inputSx: {},
};

export default CustomTextField;

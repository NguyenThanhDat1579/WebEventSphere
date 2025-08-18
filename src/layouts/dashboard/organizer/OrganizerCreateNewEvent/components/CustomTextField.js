import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, TextField } from "@mui/material";

const formatMoney = (value) => {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const unformatMoney = (value) => {
  return value.replace(/\./g, "");
};

const CustomTextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  minLength,
  maxWidth = "80ch",
  error = false,
  helperText = "",
  sx = {},
  inputSx = {},
  select = false,
  children,
  pop,
  ...rest
}) => {
  const isStringValue = typeof value === "string" || typeof value === "number";

  const handleInputChange = (e) => {
    let inputVal = e.target.value;
    if (pop === "money") {
      const raw = unformatMoney(inputVal).replace(/\D/g, ""); // remove all non-digits
      onChange({ target: { value: raw } }); // pass raw number back
    } else {
      onChange(e);
    }
  };

  const displayValue = pop === "money" && isStringValue ? formatMoney(value) : value;

  return (
    <Box sx={{ width: "100%", maxWidth, position: "relative", ...sx }}>
      {label && (
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
      )}

      {select ? (
        <TextField
          fullWidth
          select
          value={value}
          onChange={onChange}
          error={error}
          helperText={helperText}
          sx={{
            "& .MuiInputBase-root": {
              borderRadius: 2,
              fontSize: "1.1rem",        
              padding: "12px 16px",      
              minHeight: "52px",
              fontFamily: "Roboto, sans-serif",
              ...inputSx,
            },
          }}
          {...rest}
        >
          {children}
        </TextField>
      ) : (
        <Box
          component="input"
          type={pop === "money" ? "text" : type}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          {...(maxLength ? { maxLength } : {})}
          {...(minLength ? { minLength } : {})}
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
      )}

      {/* Max length count */}
      {maxLength !== undefined && isStringValue && !select && (
        <Typography
          sx={{
            position: "absolute",
            bottom: helperText ? 28 : 9,
            right: 8,
            top: 8.5,
            fontSize: 12,
            color: "gray",
            pointerEvents: "none",
            userSelect: "none",
            padding: "0 4px",
          }}
        >
          {unformatMoney(value.toString()).length} / {maxLength}
        </Typography>
      )}

      {/* Error text */}
      {error && helperText && (
        <Typography fontSize={13} sx={{ color: "red", mt: 0.5, ml: "4px", display: "block" }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

CustomTextField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  inputSx: PropTypes.object,
  select: PropTypes.bool,
  children: PropTypes.node,
  pop: PropTypes.oneOf(["money"]),
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
  select: false,
  children: null,
  pop: undefined,
};

export default CustomTextField;

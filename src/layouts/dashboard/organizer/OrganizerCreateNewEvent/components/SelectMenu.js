import React, { useState, useRef } from "react";
import { Box, Typography, Popper, Paper, MenuList, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const SelectMenu = ({ label = "Chọn", value, onChange, options = [] }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <>
      <Box
        ref={anchorRef}
        onClick={handleToggle}
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1.8,
          p: 0.6,
          pl: 1.4,
          width: "100%",
          cursor: "pointer",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // 👈 label bên trái, icon bên phải
        }}
      >
        <Typography
          variant="body2"
          color={value ? "textPrimary" : "textSecondary"}
          noWrap
          sx={{ flexGrow: 1 }}
        >
          {value ? options.find((o) => o.value === value)?.label : label}
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </Box>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1600 }}
      >
        <Paper
          elevation={3}
          sx={{
            width: anchorRef.current?.offsetWidth || "auto", // ✅ Set width same as Box
          }}
        >
          <MenuList
            dense
            disablePadding
            sx={{
              maxHeight: 48 * 6,
              overflowY: "auto",
            }}
          >
            {options.length === 0 ? (
              <MenuItem disabled>Không có dữ liệu</MenuItem>
            ) : (
              options.map((item) => (
                <MenuItem key={item.value} onClick={() => handleSelect(item.value)}>
                  {item.label}
                </MenuItem>
              ))
            )}
          </MenuList>
        </Paper>
      </Popper>
    </>
  );
};

export default SelectMenu;
SelectMenu.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};

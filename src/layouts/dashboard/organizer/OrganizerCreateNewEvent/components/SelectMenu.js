import React, { useState, useRef } from "react";
import { Box, Typography, Popper, Paper, MenuList, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const SelectMenu = ({
  label = "Chọn",
  value,
  onChange,
  options = [],
  error = false,
  helperText = "",
  searchable = false, // ✅ thêm prop để bật tìm kiếm
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ state tìm kiếm
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSearchTerm(""); // ✅ reset ô tìm kiếm khi đóng
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearchTerm("");
  };

  // ✅ Lọc danh sách theo từ khóa tìm kiếm (nếu có)
  const filteredOptions = options.filter((o) =>
    o.label?.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <>
      <Box
        ref={anchorRef}
        onClick={handleToggle}
        sx={{
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: 1.8,
          p: 0.6,
          pl: 1.4,
          width: "100%",
          cursor: "pointer",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "&:hover": {
            borderColor: error ? "red" : "#888",
          },
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

      {/* Hiển thị helperText nếu có lỗi */}
      {error && helperText && (
        <Typography variant="caption" color="error" sx={{ mt: "4px", ml: "4px", display: "block" }}>
          {helperText}
        </Typography>
      )}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1600 }}
      >
        <Paper
          elevation={3}
          sx={{
            width: anchorRef.current?.offsetWidth || "auto",
          }}
        >
          {searchable && (
            <Box sx={{ px: 1, py: 0.5 }}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "0.875rem",
                }}
              />
            </Box>
          )}

          <MenuList
            dense
            disablePadding
            sx={{
              maxHeight: 48 * 6,
              overflowY: "auto",
            }}
          >
            {filteredOptions.length === 0 ? (
              <MenuItem disabled>Không có kết quả</MenuItem>
            ) : (
              filteredOptions.map((item) => (
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
  error: PropTypes.bool,
  helperText: PropTypes.string,
  searchable: PropTypes.bool, // ✅ prop mới
};

export default SelectMenu;

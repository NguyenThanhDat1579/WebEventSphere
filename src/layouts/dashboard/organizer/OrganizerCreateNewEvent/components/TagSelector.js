import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Popper,
  Paper,
  MenuList,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import PropTypes from "prop-types";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const TagSelector = ({
  label = "Chọn tag",
  value = [],
  onChange,
  options = [],
  error = false,
  helperText = "",
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const anchorRef = useRef(null);

  const togglePopup = () => {
    setOpen((prev) => !prev);
    if (open) setSearchTerm("");
  };

  const handleSelect = (val) => {
    const isSelected = value.includes(val);
    const updated = isSelected ? value.filter((v) => v !== val) : [...value, val];
    onChange(updated);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);

  return (
    <>
      {/* Box hiển thị đã chọn và mở popup */}
      <Box
        ref={anchorRef}
        onClick={togglePopup}
        sx={{
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: 1.8,
          p: 0.6,
          pl: 1.4,
          width: "100%",
          cursor: "pointer",
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
          noWrap
          color={selectedLabels.length ? "textPrimary" : "textSecondary"}
          sx={{ flexGrow: 1 }}
        >
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : label}
        </Typography>
        <KeyboardArrowDownIcon fontSize="small" />
      </Box>

      {/* Lỗi */}
      {error && helperText && (
        <Typography variant="caption" color="error" sx={{ mt: "4px", ml: "4px", display: "block" }}>
          {helperText}
        </Typography>
      )}

      {/* Popup với checkbox và tìm kiếm */}
      <ClickAwayListener
        onClickAway={(event) => {
          if (anchorRef.current?.contains(event.target)) return;
          setOpen(false);
        }}
      >
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1600 }}
        >
          <Paper
            elevation={3}
            sx={{
              width: anchorRef.current?.offsetWidth || 200,
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

            <MenuList dense disablePadding sx={{ maxHeight: 48 * 6, overflowY: "auto" }}>
              {filteredOptions.length === 0 ? (
                <MenuItem disabled>Không có kết quả</MenuItem>
              ) : (
                filteredOptions.map((item) => (
                  <MenuItem key={item.value} onClick={() => handleSelect(item.value)} dense>
                    <Checkbox
                      checked={value.includes(item.value)}
                      edge="start"
                      size="small"
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={item.label} />
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Paper>
        </Popper>
      </ClickAwayListener>
    </>
  );
};

TagSelector.propTypes = {
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  searchable: PropTypes.bool,
};

export default TagSelector;

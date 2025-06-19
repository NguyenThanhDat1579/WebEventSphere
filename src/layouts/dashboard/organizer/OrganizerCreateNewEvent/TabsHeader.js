import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import PropTypes from "prop-types";
const tabLabels = ["Thông tin sự kiện", "Thời gian & Loại vé"];
//  "Cài đặt", "Thông tin thanh toán"
export default function TabsHeader({ tabIndex, setTabIndex }) {
  const handleTabChange = (_, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#fff", px: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ minHeight: "48px" }}
      >
        {tabLabels.map((label, index) => (
          <Tab
            key={index}
            label={label}
            sx={{
              minHeight: "48px",
              fontWeight: tabIndex === index ? "bold" : "normal",
              color: tabIndex === index ? "primary.main" : "text.secondary",
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
TabsHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  setTabIndex: PropTypes.func.isRequired,
};

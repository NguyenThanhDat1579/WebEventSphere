import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import PropTypes from "prop-types";

const tabLabels = ["Thông tin sự kiện", "Thời gian & Loại vé"];

export default function TabsHeader({ tabIndex, onChangeTab, canProceed }) {
  const handleTabClick = (e, newIndex) => {
    if (tabIndex === 0 && newIndex === 1 && !canProceed) {
      e.preventDefault(); // chặn chuyển tab nếu chưa được validate
      return;
    }
    onChangeTab(newIndex);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#fff", px: 2 }}>
      <Tabs value={tabIndex} onChange={handleTabClick} variant="fullWidth">
        {tabLabels.map((label, index) => {
          const isDisabled = tabIndex === 0 && index === 1 && !canProceed;
          return (
            <Tab
              key={index}
              label={label}
              disabled={isDisabled}
              sx={{
                minHeight: "48px",
                fontWeight: tabIndex === index ? "bold" : "normal",
                color: tabIndex === index ? "primary.main" : "text.secondary",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}

TabsHeader.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  onChangeTab: PropTypes.func.isRequired,
  canProceed: PropTypes.bool.isRequired,
};

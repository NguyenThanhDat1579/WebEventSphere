import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import TabInfoEvent from "../OrganizerCreateNewEvent/components/tabs/TabInfoEvent";
export default function EventTabContent({ tabIndex }) {
  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <TabInfoEvent />;
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thời gian & Loại vé
            </Typography>
            <Typography>Chọn ngày tổ chức, thời gian bắt đầu và cấu hình các loại vé.</Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Cài đặt
            </Typography>
            <Typography>Tùy chỉnh quyền truy cập, ẩn hiện sự kiện và thông tin bổ sung.</Typography>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thanh toán
            </Typography>
            <Typography>Nhập thông tin tài khoản nhận tiền hoặc cấu hình thanh toán.</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return <Box mt={2}>{renderTabContent()}</Box>;
}

EventTabContent.propTypes = {
  tabIndex: PropTypes.number.isRequired,
};

import React from "react";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import TabInfoEvent from "../OrganizerCreateNewEvent/components/tabs/TabInfoEvent";
import TabScheduleAndTickets from "./components/tabs/TabScheduleAndTickets";
export default function EventTabContent({ tabIndex, setTabIndex }) {
  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <TabInfoEvent setTabIndex={setTabIndex} />;
      case 1:
        return <TabScheduleAndTickets />;
      // case 2:
      //   return (
      //     <Box>
      //       <Typography variant="h6" gutterBottom>
      //         Cài đặt
      //       </Typography>
      //       <Typography>Tùy chỉnh quyền truy cập, ẩn hiện sự kiện và thông tin bổ sung.</Typography>
      //     </Box>
      //   );
      // case 3:
      //   return (
      //     <Box>
      //       <Typography variant="h6" gutterBottom>
      //         Thanh toán
      //       </Typography>
      //       <Typography>Nhập thông tin tài khoản nhận tiền hoặc cấu hình thanh toán.</Typography>
      //     </Box>
      //   );
      default:
        return null;
    }
  };

  return <Box mt={2}>{renderTabContent()}</Box>;
}

EventTabContent.propTypes = {
  tabIndex: PropTypes.number.isRequired,
  setTabIndex: PropTypes.func.isRequired,
};

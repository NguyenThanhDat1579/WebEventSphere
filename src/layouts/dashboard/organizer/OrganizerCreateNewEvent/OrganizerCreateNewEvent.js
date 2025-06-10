import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArgonBox from "components/ArgonBox";

import TabsHeader from "./TabsHeader";
import EventTabContent from "./EventTabContent";

export default function OrganizerCreateNewEvent() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                p: 3,
                position: "relative", // quan trọng để chứa con absolute
                minHeight: 300, // chiều cao cố định hoặc tối thiểu để dễ quan sát
              }}
            >
              <TabsHeader tabIndex={tabIndex} setTabIndex={setTabIndex} />
              <EventTabContent tabIndex={tabIndex} />
            </Paper>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

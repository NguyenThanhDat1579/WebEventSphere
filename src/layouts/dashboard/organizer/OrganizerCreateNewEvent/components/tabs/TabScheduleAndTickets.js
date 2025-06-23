// components/tabs/TabScheduleAndTickets.js
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import ScheduleSection from "../ScheduleSection";

export default function TabScheduleAndTickets() {
  const [performances, setPerformances] = useState([]);
  const [tickets, setTickets] = useState([]);

  const handleAddPerformance = (performance) => {
    setPerformances([...performances, performance]);
  };

  const handleUpdatePerformance = (index, updated) => {
    const newList = [...performances];
    newList[index] = updated;
    setPerformances(newList);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thời gian & Loại vé
      </Typography>

      <ScheduleSection
        performances={performances}
        onAdd={handleAddPerformance}
        onUpdate={handleUpdatePerformance}
      />
    </Box>
  );
}

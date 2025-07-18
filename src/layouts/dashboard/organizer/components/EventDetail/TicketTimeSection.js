import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import PropTypes from "prop-types";
import CustomTextField from "../../OrganizerCreateNewEvent/components/CustomTextField";


const formatVietnameseDateTimeInput = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

const TicketTimeSection = ({ isEditing, formData, setFormData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: new Date(value).getTime(),
    }));
  };

  return (
    <Box mt={3}>
      <Typography fontSize={16} fontWeight={600} gutterBottom>
        Thời gian bán vé:
      </Typography>

      {isEditing ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography  fontSize={14} fontWeight={600}>Bắt đầu bán vé:</Typography>
            <CustomTextField
              type="datetime-local"
              name="timeStart"
              value={formData.timeStart ? new Date(formData.timeStart).toISOString().slice(0, 16) : ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography  fontSize={14} fontWeight={600}>Kết thúc bán vé:</Typography>
            <CustomTextField
              type="datetime-local"
              name="timeEnd"
              value={formData.timeEnd ? new Date(formData.timeEnd).toISOString().slice(0, 16) : ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
          }}
        >
          <Typography fontSize={15} fontWeight={500} >
            Bắt đầu: {formatVietnameseDateTimeInput(formData.timeStart)}
          </Typography>
          <Typography fontSize={15} fontWeight={500} >
            Kết thúc: {formatVietnameseDateTimeInput(formData.timeEnd)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

TicketTimeSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default TicketTimeSection;

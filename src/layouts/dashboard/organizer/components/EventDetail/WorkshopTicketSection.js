import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextField from "../../OrganizerCreateNewEvent/components/CustomTextField";
import PropTypes from "prop-types";

const WorkshopTicketSection = ({ formData, setFormData, isEditing }) => {
  const [isEditingWorkshop, setIsEditingWorkshop] = useState(false);
  const [error, setError] = useState({});
  const [localPrice, setLocalPrice] = useState("");
  const [localQuantity, setLocalQuantity] = useState("");

  // Đồng bộ giá trị từ formData vào local state mỗi khi mở chỉnh sửa
  useEffect(() => {
    if (isEditingWorkshop) {
      setLocalPrice(formData?.showtimes[0]?.ticketPrice || "");
      setLocalQuantity(formData?.showtimes[0]?.ticketQuantity || "");  
    }
  }, [isEditingWorkshop, formData.ticketPrice, formData.ticketQuantity]);

  const handleSave = () => {
    const newError = {};
    if (!localPrice) newError.ticketPrice = "Giá vé không được để trống";
    if (!localQuantity) newError.ticketQuantity = "Số lượng vé không được để trống";

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    const price = Number(localPrice);
    const quantity = Number(localQuantity);

    const updatedShowtimes = formData.showtimes.map((s) => ({
      ...s,
      ticketPrice: price,
      ticketQuantity: quantity,
    }));

    setFormData((prev) => ({
      ...prev,
      ticketPrice: price,
      ticketQuantity: quantity,
      showtimes: updatedShowtimes,
    }));

    setIsEditingWorkshop(false);
  };

  const handleFieldChange = (key, value) => {
    if (key === "ticketPrice") setLocalPrice(value);
    if (key === "ticketQuantity") setLocalQuantity(value);
    setError((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <Box mt={4}>
      <Typography fontSize={18} fontWeight={600} gutterBottom>
        Thông tin vé Workshop
      </Typography>

      {!isEditingWorkshop ? (
        <Box mt={2} display="flex" gap={2} alignItems="center">
          <Typography
            fontSize={16}
            sx={{
              backgroundColor: "#f8f9fa",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: "1px solid #ccc",
              width: "fit-content",
            }}
          >
            Giá vé: {formData?.showtimes[0]?.ticketPrice?.toLocaleString("vi-VN") || "0"} ₫
          </Typography>

          <Typography
            fontSize={16}
            sx={{
              backgroundColor: "#f8f9fa",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: "1px solid #ccc",
              width: "fit-content",
            }}
          >
            Số lượng vé: {formData?.showtimes[0]?.ticketQuantity || "0"} vé
          </Typography>

          {isEditing && (
            <IconButton  onClick={() => {                    
                      setIsEditingWorkshop(true);
                    }}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
      ) : isEditing ? (
            <Box mt={2} display="flex" gap={2} alignItems="center">
              <CustomTextField
                label="Giá vé"
                pop="money"
                type="number"
                value={localPrice}
                onChange={(e) => handleFieldChange("ticketPrice", e.target.value)}
                error={Boolean(error.ticketPrice)}
                helperText={error.ticketPrice}
              />

              <CustomTextField
                label="Số lượng vé"
                type="number"
                value={localQuantity}
                onChange={(e) => handleFieldChange("ticketQuantity", e.target.value)}
                error={Boolean(error.ticketQuantity)}
                helperText={error.ticketQuantity}
              />

              <IconButton onClick={handleSave} sx={{ mt: 4 }} >
                <CheckIcon  color="success" />
              </IconButton>
            </Box>
          ) : null }
    </Box>
  );
};

WorkshopTicketSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.shape({
    ticketPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ticketQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    showtimes: PropTypes.arrayOf(
      PropTypes.shape({
        startTime: PropTypes.number,
        endTime: PropTypes.number,
        ticketPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ticketQuantity: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      })
    ),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default WorkshopTicketSection;

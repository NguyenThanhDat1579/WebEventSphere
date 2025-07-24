import React from "react";
import { Box, Grid, Typography, TextField } from "@mui/material";
import PropTypes from "prop-types";
import TinyMCEEditor from "../../OrganizerCreateNewEvent/components/TinyMCEEditor";
import CustomTextField from "../../OrganizerCreateNewEvent/components/CustomTextField";


const GeneralInfoSection = ({
  isEditing,
  formData,
  setFormData,
  isReadOnly = false,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Grid container spacing={2} mt={2}>
      {/* Tên sự kiện */}
      <Grid item xs={12} md={6}>
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Tên sự kiện:
        </Typography>
        {isEditing ? (
          <CustomTextField
            fullWidth
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Nhập tên sự kiện"
          />
        ) : (
          <Typography fontSize={16} fontWeight={400}>{formData.name}</Typography>
        )}
      </Grid>

      {/* Địa điểm */}
      <Grid item xs={12} md={6}>
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Địa điểm tổ chức:
        </Typography>
        {isEditing ? (
          <CustomTextField
            fullWidth
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="Nhập địa điểm"
          />
        ) : (
          <Typography fontSize={16} fontWeight={400}>{formData.location}</Typography>
        )}
      </Grid>

      {/* Mô tả */}
      <Grid item xs={12}>
        <Typography fontSize={16} fontWeight={600} mb={1}>
          Mô tả sự kiện:
        </Typography>

        {isEditing ? (
          <TinyMCEEditor
            value={formData.description || ""}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, description: value }))
            }
            ready={true}
          />
        ) : (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 5,
              mt: 1,
            }}
            dangerouslySetInnerHTML={{
              __html: formData.description || "<em>Không có mô tả</em>",
            }}
          />
        )}
      </Grid>
    </Grid>
  );
};

GeneralInfoSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
};

export default GeneralInfoSection;

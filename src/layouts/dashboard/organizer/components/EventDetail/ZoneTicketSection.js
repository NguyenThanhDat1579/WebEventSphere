import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import CustomTextField from "../../OrganizerCreateNewEvent/components/CustomTextField";

const ZoneTicketSection = ({ formData, setFormData, isEditing }) => {
  const [originalZones, setOriginalZones] = useState({});

  const handleZoneChange = (index, field, value) => {
    const updatedZoneTickets = [...formData.zoneTickets];
    updatedZoneTickets[index][field] = value;
    setFormData((prevData) => ({
      ...prevData,
      zoneTickets: updatedZoneTickets,
    }));
  };

  const startZoneEdit = (index) => {
    const updatedZoneTickets = [...formData.zoneTickets];
    updatedZoneTickets[index].isEditing = true;
    setFormData((prevData) => ({
      ...prevData,
      zoneTickets: updatedZoneTickets,
    }));
  };

  const toggleZoneEdit = (index) => {
    const updatedZoneTickets = [...formData.zoneTickets];
    updatedZoneTickets[index].isEditing = false;
    setFormData((prevData) => ({
      ...prevData,
      zoneTickets: updatedZoneTickets,
    }));
  };

  const removeZone = (index) => {
    const updatedZoneTickets = [...formData.zoneTickets];
    updatedZoneTickets.splice(index, 1);
    setFormData((prevData) => ({
      ...prevData,
      zoneTickets: updatedZoneTickets,
    }));
  };

  const addZone = () => {
    const newZone = {
      name: "",
      price: 0,
      totalTicketCount: 0,
      isEditing: true,
    };
    setFormData((prevData) => ({
      ...prevData,
      zoneTickets: [...prevData.zoneTickets, newZone],
    }));
  };

  const uniqueZones = formData.zoneTickets.filter(
  (zone, index, self) =>
    index === self.findIndex((z) => z.name.trim().toLowerCase() === zone.name.trim().toLowerCase())
);


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Thông tin khu vực
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

     <Grid container spacing={2}>
        {uniqueZones.map((zone, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Paper sx={{ p: 2, mb: 2, border: '1px solid #ccc', }}>
              <Grid container spacing={2} alignItems="center">
                {isEditing && zone.isEditing ? (
                  <>                 
                    <Grid item xs={12}>
                      <CustomTextField
                        label="Tên khu vực"
                        fullWidth
                        value={zone.name}
                        onChange={(e) =>
                          handleZoneChange(index, "name", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        label="Giá vé (₫)"
                        type="number"
                        pop="money"
                        fullWidth
                        value={zone.price}
                        onChange={(e) =>
                          handleZoneChange(index, "price", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CustomTextField
                        label="Số lượng vé"
                        type="number"
                        fullWidth
                        value={zone.totalTicketCount}
                        onChange={(e) =>
                          handleZoneChange(index, "totalTicketCount", e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton
                          onClick={() => {
                            toggleZoneEdit(index);
                            setOriginalZones((prev) => {
                              const copy = { ...prev };
                              delete copy[index];
                              return copy;
                            });
                          }}
                          size="small"
                        >
                          <CheckIcon fontSize="small" color="success" />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            const original = originalZones[index];
                            if (original) {
                              const updatedZones = [...formData.zoneTickets];
                              updatedZones[index] = {
                                ...original,
                                isEditing: false,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                zoneTickets: updatedZones,
                              }));
                            } else {
                              removeZone(index); // nếu là zone mới tạo thì hủy sẽ xóa
                            }
                          }}
                          size="small"
                        >
                          <CloseIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} >
                      <Grid container alignItems="center" justifyContent="space-between" >
                        <Grid item>
                          <Typography fontSize="16px" fontWeight={600}>
                            Tên khu vực:{" "}
                            <span style={{ fontWeight: 400 }}>{zone.name}</span>
                          </Typography>
                        </Grid>

                        {isEditing && (
                          <Grid item>
                            <Box display="flex" alignItems="center">
                              <IconButton
                                onClick={() => {
                                  setOriginalZones((prev) => ({
                                    ...prev,
                                    [index]: { ...zone },
                                  }));
                                  startZoneEdit(index);
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => removeZone(index)}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>


                    <Grid item xs={12}>
                      <Typography fontSize="16px" fontWeight={600}>
                        Giá vé:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {zone.price.toLocaleString()} ₫
                        </span>
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography fontSize="16px" fontWeight={600}>
                        Số lượng vé:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {zone.totalTicketCount}
                        </span>
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {isEditing && (
          <Button onClick={addZone} 
          variant="outlined"
          sx={{
            mt: 2,
            backgroundColor: "#5669FF",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#5669FF",
              borderColor: "#5669FF",
            },
          }}>
          + Thêm khu vực
        </Button>     
        )}
      
    </Box>
  );
};

ZoneTicketSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
   isEditing: PropTypes.bool.isRequired,
};

export default ZoneTicketSection;

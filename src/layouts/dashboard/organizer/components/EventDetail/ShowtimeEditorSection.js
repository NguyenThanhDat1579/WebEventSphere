// ShowtimeEditorSection.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import CustomTextField from "../../OrganizerCreateNewEvent/components/CustomTextField";

const formatInputDateTime = (timestamp) => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};


const formatVietnameseShowtime = (start, end) => {
  const startDate = new Date(start).toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
  });
  const endDate = new Date(end).toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
  });
  const date = new Date(start).toLocaleDateString("vi-VN");
  return `${startDate} - ${endDate} ${date}`;
};

const ShowtimeEditorSection = ({ isEditing, formData, setFormData }) => {
   const [showtimeErrors, setShowtimeErrors] = useState({});

     const validateShowtimeTimes = (index, start, end) => {
    if (!start || !end) {
      setShowtimeErrors((prev) => ({ ...prev, [index]: "" }));
      return;
    }

    const showStart = new Date(start);
    const showEnd = new Date(end);
    const saleEnd = new Date(formData.timeEnd); // Thời gian kết thúc bán vé

    if (showEnd <= showStart) {
      setShowtimeErrors((prev) => ({
        ...prev,
        [index]: "Kết thúc suất diễn phải lớn hơn bắt đầu.",
      }));
    } else if (showStart < saleEnd) {
      setShowtimeErrors((prev) => ({
        ...prev,
        [index]: "Suất diễn phải bắt đầu sau khi kết thúc bán vé.",
      }));
    } else {
      setShowtimeErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };



  const handleUpdate = (index, field, value) => {
    const updated = [...formData.showtimes];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, showtimes: updated }));

    if (field === "startTime" || field === "endTime") {
      const startVal =
        field === "startTime" ? value : updated[index].startTime;
      const endVal =
        field === "endTime" ? value : updated[index].endTime;
      validateShowtimeTimes(index, startVal, endVal);
    }
  };

    const handleSaveEdit = (index) => {
    if (showtimeErrors[index]) return; // Nếu còn lỗi, không lưu
    const updated = [...formData.showtimes];
    updated[index].isEditing = false;
    setFormData((prev) => ({ ...prev, showtimes: updated }));
  };


    const handleDelete = (index) => {
    const updated = formData.showtimes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, showtimes: updated }));
    setShowtimeErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

 
  const handleStartEdit = (index) => {
    const updated = [...formData.showtimes];
    updated[index].isEditing = true;
    setFormData((prev) => ({ ...prev, showtimes: updated }));
  };

  const handleAddShowtime = () => {
    const now = new Date().getTime();
    const newShowtime = {
      startTime: now,
      endTime: now + 2 * 60 * 60 * 1000,
      isEditing: true,
    };

    if (formData.typeBase === "none") {
      newShowtime.ticketPrice = 0;
      newShowtime.ticketQuantity = 0;
    }

    setFormData((prev) => ({
      ...prev,
      showtimes: [...prev.showtimes, newShowtime],
    }));
  };

  return (
    <Box mt={3}>
      <Typography fontSize={16} fontWeight={600} gutterBottom>
        Danh sách suất diễn:
      </Typography>

      <Grid container spacing={2}>
          {formData.showtimes.length === 0 && (
            <Grid item xs={12}>
              <Typography ml={1} fontSize={15} fontWeight={500} sx={{color: "red"}}>
                  * Vui lòng thêm ít nhất một suất diễn.
              </Typography>
            </Grid>
          )}



        {formData.showtimes.map((showtime, index) => {
          const isShowtimeEditing = showtime.isEditing;

          return (
            <Grid item xs={12} key={index}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {!isShowtimeEditing ? (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography fontSize={15}>
                      Suất #{index + 1}:{" "}
                      <b>
                        {formatVietnameseShowtime(
                          showtime.startTime,
                          showtime.endTime
                        )}
                      </b>
                    </Typography>

                    {isEditing && (
                      <Box>
                        <IconButton onClick={() => handleStartEdit(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(index)}>
                          <DeleteIcon color="error"  />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    display="flex"
                    gap={2}
                    flexWrap="wrap"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                     <CustomTextField
                      label="Thời gian bắt đầu"
                      type="datetime-local"
                      value={formatInputDateTime(showtime.startTime)}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          "startTime",
                          new Date(e.target.value).getTime()
                        )
                      }
                      error={!!showtimeErrors[index]}
                      helperText={showtimeErrors[index]}
                    />
                    <CustomTextField
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      value={formatInputDateTime(showtime.endTime)}
                      onChange={(e) =>
                        handleUpdate(
                          index,
                          "endTime",
                          new Date(e.target.value).getTime()
                        )
                      }
                      error={!!showtimeErrors[index]}
                      helperText={showtimeErrors[index]}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton onClick={() => handleSaveEdit(index)}>
                       <CheckIcon fontSize="small" color="success" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(index)}>
                        <CloseIcon  fontSize="small" color="error"/>
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {isEditing && (
        <Box mt={2}>
          <Button
            variant="outlined"
            onClick={handleAddShowtime}
              sx={{
                mt: 2,
                backgroundColor: "#5669FF",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#5669FF",
                  borderColor: "#5669FF",
                },
            }}
          >
            + Thêm suất diễn
          </Button>
        </Box>
      )}
    </Box>
  );
};

ShowtimeEditorSection.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  formData: PropTypes.shape({
    showtimes: PropTypes.arrayOf(
      PropTypes.shape({
        startTime: PropTypes.number.isRequired,
        endTime: PropTypes.number.isRequired,
        ticketPrice: PropTypes.number,
        ticketQuantity: PropTypes.number,
        isEditing: PropTypes.bool,
      })
    ),
    typeBase: PropTypes.string.isRequired,
    timeStart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timeEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ShowtimeEditorSection;

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Paper,
} from "@mui/material";
import eventApi from "api/eventApi";
import CustomTextField from "../OrganizerCreateNewEvent/components/CustomTextField";
import TinyMCEEditor from "../OrganizerCreateNewEvent/components/TinyMCEEditor";

const EventDetail = ({ eventId, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const hasChanged = JSON.stringify(initialFormData) !== JSON.stringify(formData);
    setIsChanged(hasChanged);
  }, [initialFormData, formData]);

  const formatDateInput = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16);
  };

  const convertToTimestamp = (datetime) => {
    return Math.floor(new Date(datetime).getTime() / 1000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventApi.getDetail(eventId);
        const data = res.data.data;

        const formattedData = {
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          timeStart: formatDateInput(data.timeStart),
          timeEnd: formatDateInput(data.timeEnd),
          ticketPrice: data.ticketPrice || 0,
          ticketQuantity: data.ticketQuantity || 0,
          avatar: data.avatar || "",
          banner: data.banner || "",
          images: data.images || [],
          tags: data.tags || [],
          soldTickets: data.soldTickets || 0,
        };

        setFormData(formattedData); // dữ liệu gốc
        setInitialFormData(formattedData); // dữ liệu form (editable)
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        alert("Lỗi khi tải dữ liệu sự kiện.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    setInitialFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.target.value = "";
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", "event_upload");
    formDataUpload.append("cloud_name", "deoqppiun");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      const imageUrl = data.secure_url;

      setFormData((prev) => {
        switch (type) {
          case "avatar":
            return { ...prev, avatar: imageUrl };
          case "banner":
            return { ...prev, banner: imageUrl };
          case "gallery":
            return {
              ...prev,
              images: Array.isArray(prev.images) ? [...prev.images, imageUrl] : [imageUrl],
            };
          default:
            return prev;
        }
      });
    } catch (err) {
      console.error("Lỗi upload ảnh lên Cloudinary:", err);
    }
  };

  const handleUpdate = async () => {
    const payload = {
      ...initialFormData,
      timeStart: convertToTimestamp(initialFormData.timeStart),
      timeEnd: convertToTimestamp(initialFormData.timeEnd),
    };

    setIsSaving(true);
    setTimeout(() => {
      console.log("Đã lưu:", payload);
      alert("Đã lưu thay đổi!");
      setIsSaving(false);
      setIsEditing(false);
      setFormData(initialFormData); // ✅ cập nhật lại dữ liệu gốc
    }, 1000);
  };

  if (isLoading) {
    return (
      <Box py={5} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Chi tiết sự kiện: {initialFormData.name}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Ảnh đại diện Sự kiện</Typography>
              {isEditing && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => document.getElementById("avatar-upload").click()}
                    sx={{
                      backgroundColor: "#1976D2",
                      color: "#fff",
                      border: "1px solid #1976D2",
                      "&:hover": {
                        backgroundColor: "#fff",
                        color: "#1976D2",
                      },
                    }}
                  >
                    Thay đổi
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    hidden
                    onChange={(e) => handleImageUpload(e, "avatar")}
                  />
                </>
              )}
            </Box>

            {initialFormData.avatar && (
              <img
                src={initialFormData.avatar}
                alt="Avatar"
                style={{ width: 200, borderRadius: 8, marginTop: 10 }}
              />
            )}
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Banner Sự kiện</Typography>
              {isEditing && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => document.getElementById("banner-upload").click()}
                    sx={{
                      backgroundColor: "#1976D2",
                      color: "#fff",
                      border: "1px solid #1976D2",
                      "&:hover": {
                        backgroundColor: "#fff",
                        color: "#1976D2",
                      },
                    }}
                  >
                    Thay đổi
                  </Button>
                  <input
                    id="banner-upload"
                    type="file"
                    hidden
                    onChange={(e) => handleImageUpload(e, "banner")}
                  />
                </>
              )}
            </Box>

            {initialFormData.banner && (
              <img
                src={initialFormData.banner}
                alt="Banner"
                style={{ width: 200, borderRadius: 8, marginTop: 10 }}
              />
            )}
          </Grid>
        </Grid>

        {initialFormData.images?.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Hình ảnh liên quan:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {initialFormData.images.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: 160,
                    height: 100,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #ccc",
                  }}
                >
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isEditing && (
                    <Box
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }))
                      }
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </Box>
                  )}
                </Box>
              ))}
              {isEditing && (
                <>
                  <Box
                    onClick={() => document.getElementById("gallery-upload").click()}
                    sx={{
                      width: 160,
                      height: 100,
                      borderRadius: 2,
                      border: "2px dashed #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#777",
                    }}
                  >
                    + Thêm ảnh
                  </Box>
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e, "gallery")}
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {/* Other form fields like name, location, etc. here */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label="Tên sự kiện"
              name="name"
              value={initialFormData.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              fullWidth
              label="Địa điểm"
              name="location"
              value={initialFormData.location}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Mô tả
            </Typography>
            <TinyMCEEditor
              value={initialFormData.description}
              onChange={(value) => setInitialFormData((prev) => ({ ...prev, description: value }))}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              type="datetime-local"
              label="Thời gian bắt đầu"
              name="timeStart"
              value={initialFormData.timeStart}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              type="datetime-local"
              label="Thời gian kết thúc"
              name="timeEnd"
              value={initialFormData.timeEnd}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              label="Giá vé (VND)"
              name="ticketPrice"
              type="number"
              value={initialFormData.ticketPrice}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              label="Số lượng vé"
              name="ticketQuantity"
              type="number"
              value={initialFormData.ticketQuantity}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Đã bán: {initialFormData.soldTickets || 0} vé
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">Tags:</Typography>
            {isEditing ? (
              <>
                <TextField
                  fullWidth
                  placeholder="Nhập tag và nhấn Enter"
                  onKeyDown={handleAddTag}
                  margin="normal"
                />
                <Box>
                  {initialFormData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box>
                {initialFormData.tags.map((tag, index) => (
                  <Chip key={index} label={tag} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            sx={{
              backgroundColor: "#fff",
              color: "#1976D2",
              border: "1px solid #1976D2",
              "&:hover": {
                backgroundColor: "#1976D2",
                color: "#fff",
              },
            }}
          >
            ← Quay lại
          </Button>
          {!isEditing ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
              sx={{
                backgroundColor: "#1976D2",
                color: "#fff",
                border: "1px solid #1976D2",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#1976D2",
                },
              }}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setInitialFormData(formData);
                  setIsEditing(false);
                }}
                sx={{
                  backgroundColor: "#fff",
                  color: "#1976D2",
                  border: "1px solid #1976D2",
                  "&:hover": {
                    backgroundColor: "#1976D2",
                    color: "#fff",
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdate}
                disabled={!isChanged || isSaving}
                sx={{
                  backgroundColor: "#1976D2",
                  color: "#fff",
                  border: "1px solid rgb(233,236,239)",
                  "&:hover": {
                    backgroundColor: "#fff",
                    color: "#1976D2",
                    borderColor: "#1976D2",
                  },
                }}
              >
                {isSaving ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

EventDetail.propTypes = {
  eventId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventDetail;

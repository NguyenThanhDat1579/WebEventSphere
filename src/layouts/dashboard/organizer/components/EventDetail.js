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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
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

  const formatVietnameseDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
          avatar: data.avatar || "",
          banner: data.banner || "",
          images: data.images || [],
          tags: data.tags || [],
          typeBase: data.typeBase || "zone",
          soldTickets: data.showtimes?.[0]?.soldTickets || 0,
          ticketPrice: data.ticketPrice || 0, // cho 'zone'
          ticketQuantity: data.ticketQuantity || 0, // cho 'zone'
          zoneTickets: data.zoneTickets || [], // dùng nếu cần
          zones: data.zones || [], // ✅ THÊM DÒNG NÀY
          showtimes: data.showtimes || [],
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

  const handleImageUpload1 = async (e, type) => {
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

  const handleUploadImagesOnly = async () => {
    try {
      const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "your_upload_preset"); // Cloudinary preset

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          formData
        );
        return response.data.secure_url; // trả về link ảnh
      };

      let avatarUrl = formData.avatar;
      let bannerUrl = formData.banner;

      // Chỉ upload nếu có ảnh tạm
      if (formData.avatarFile) {
        avatarUrl = await uploadToCloudinary(formData.avatarFile);
      }

      if (formData.bannerFile) {
        bannerUrl = await uploadToCloudinary(formData.bannerFile);
      }

      // Trả về link ảnh đã upload (chưa cần gọi API lưu)
      const result = {
        avatar: avatarUrl,
        banner: bannerUrl,
      };

      console.log("✅ Ảnh đã upload:", result);
      return result;
    } catch (error) {
      console.error("❌ Upload ảnh thất bại:", error);
      return null;
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newPreviews],
    }));
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [`${type}File`]: file,
    }));
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
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{
            backgroundColor: "#fff",
            marginBottom: 3,
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
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontSize={20} fontWeight={700}>
              {isEditing ? "Chỉnh sửa sự kiện" : "Chi tiết sự kiện"}
            </Typography>

            {(() => {
              const now = new Date();
              const start = new Date(initialFormData.timeStart);
              const end = new Date(initialFormData.timeEnd);

              let label = "";
              let color = "default";

              if (now < start) {
                label = "Chưa mở bán";
                color = "warning";
              } else if (now > end) {
                label = "Đã kết thúc";
                color = "error";
              } else {
                label = "Đang mở bán";
                color = "success";
              }

              return (
                <Chip
                  label={label}
                  color={color}
                  sx={{
                    fontWeight: "bold",
                    fontSize: 14,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    color: "#fff",
                  }}
                />
              );
            })()}
          </Box>
          <Typography fontSize={18} fontWeight={600}>
            {!isEditing ? formData.name : ""}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" mb={1}>
              Ảnh đại diện sự kiện:
            </Typography>
            <img
              src={
                isEditing && formData.avatarFile
                  ? URL.createObjectURL(formData.avatarFile)
                  : formData.avatar
              }
              alt="Avatar"
              style={{ width: 200, borderRadius: 8 }}
            />
            {isEditing && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("avatar-upload").click()}
                  sx={{ mt: 6 }}
                >
                  📤 Tải ảnh mới
                </Button>
                <input
                  type="file"
                  hidden
                  id="avatar-upload"
                  onChange={(e) => handleImageSelect(e, "avatar")}
                />
              </>
            )}
            {isEditing && (
              <Box mt={2}>
                <Typography variant="h6" mb={1}>
                  Tên sự kiện:
                </Typography>
                <CustomTextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên sự kiện"
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" mb={1}>
              Banner sự kiện:
            </Typography>
            <img
              src={
                isEditing && formData.bannerFile
                  ? URL.createObjectURL(formData.bannerFile)
                  : formData.banner
              }
              alt="Banner"
              style={{ width: 200, borderRadius: 8 }}
            />
            {isEditing && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("banner-upload").click()}
                  sx={{ mt: 6 }}
                >
                  📤 Tải ảnh mới
                </Button>
                <input
                  type="file"
                  hidden
                  id="banner-upload"
                  onChange={(e) => handleImageSelect(e, "banner")}
                />
              </>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} mt={2}>
          <Typography fontSize={18} fontWeight={600} gutterBottom>
            Địa điểm sự kiện:
          </Typography>

          {isEditing ? (
            <CustomTextField
              fullWidth
              placeholder="Nhập địa điểm tổ chức sự kiện"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          ) : (
            <Typography
              fontSize={16}
              fontWeight={400}
              sx={{
                backgroundColor: "#f8f9fa",
                px: 2,
                py: 1,
                borderRadius: 1,
                border: "1px solid #ccc",
                width: "fit-content",
              }}
            >
              {formData.location || "Chưa có thông tin địa điểm"}
            </Typography>
          )}
        </Grid>

        <Box mt={3}>
          <Typography variant="h6" mb={1}>
            Mô tả:
          </Typography>
          {isEditing ? (
            <TinyMCEEditor value={formData.description} onChange={() => {}} />
          ) : (
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                backgroundColor: "#f9f9f9",
              }}
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
          )}
        </Box>

        {initialFormData.tags?.length > 0 && (
          <Box mt={3}>
            <Typography fontSize={18} fontWeight={600} gutterBottom>
              Thẻ sự kiện:
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                border: "1px solid #ddd",
                borderRadius: 2,
                p: 2,
                backgroundColor: "#fafafa",
              }}
            >
              {initialFormData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#fff",
                    backgroundColor: "#1976D2",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box mt={3}>
          <Typography fontSize={18} fontWeight={700} gutterBottom>
            Thời gian bán vé:
          </Typography>

          {isEditing ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">🕒 Bắt đầu bán vé:</Typography>
                <CustomTextField
                  type="datetime-local"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">🕒 Kết thúc bán vé:</Typography>
                <CustomTextField
                  type="datetime-local"
                  name="timeEnd"
                  value={formData.timeEnd}
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
                backgroundColor: "#fafafa",
              }}
            >
              <Typography fontSize={16} fontWeight={600} color="text.secondary">
                Bắt đầu: {formatVietnameseDateTime(initialFormData.timeStart)}
              </Typography>
              <Typography fontSize={16} fontWeight={600} color="text.secondary">
                Kết thúc: {formatVietnameseDateTime(initialFormData.timeEnd)}
              </Typography>
            </Box>
          )}
        </Box>

        {(isEditing ? formData.images : initialFormData.images)?.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              🖼 Hình ảnh liên quan:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {(isEditing ? formData.images : initialFormData.images).map((img, index) => {
                const url = typeof img === "string" ? img : img.preview;

                return (
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
                      alt={`image-${index}`}
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
                );
              })}

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
                    + 📤 Thêm ảnh
                  </Box>
                  <input
                    id="gallery-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                </>
              )}
            </Box>
          </Box>
        )}

        {initialFormData.typeBase === "zone" && (
          <Box mt={3}>
            <Typography fontSize={18} fontWeight={600} gutterBottom>
              Danh sách khu vực:
            </Typography>

            {(isEditing ? formData.zoneTickets : initialFormData.zoneTickets)?.length > 0 ? (
              <Grid container spacing={2}>
                {(isEditing ? formData.zoneTickets : initialFormData.zoneTickets).map(
                  (zone, index) => {
                    // Chỉ khi isEditing=true và zone.isEditing=true thì hiện input
                    const isZoneEditing = isEditing && zone.isEditing;

                    return (
                      <Grid item xs={12} md={6} key={zone._id || index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: "#fafafa",
                            position: "relative",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            {!isZoneEditing ? (
                              <>
                                <Typography fontWeight={600}>{zone.name}</Typography>
                                {isEditing && (
                                  <Box>
                                    <IconButton
                                      onClick={() => {
                                        // Bật chế độ chỉnh sửa cho zone này
                                        const updated = [...formData.zoneTickets];
                                        updated[index].isEditing = true;
                                        setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => {
                                        const updated = formData.zoneTickets.filter(
                                          (_, i) => i !== index
                                        );
                                        setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                )}
                              </>
                            ) : (
                              <Box display="flex" justifyContent="space-between" width="100%">
                                <CustomTextField
                                  label="Tên khu vực"
                                  value={zone.name}
                                  onChange={(e) => {
                                    const updated = [...formData.zoneTickets];
                                    updated[index].name = e.target.value;
                                    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                  }}
                                  sx={{ flexGrow: 1, mr: 1 }}
                                />
                                <IconButton
                                  onClick={() => {
                                    // Huỷ chỉnh sửa (trả về dữ liệu cũ hoặc xóa isEditing)
                                    const updated = [...formData.zoneTickets];
                                    updated[index].isEditing = false;
                                    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                  }}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Box>
                            )}
                          </Box>

                          <Box>
                            {isZoneEditing ? (
                              <>
                                <CustomTextField
                                  label="Giá vé"
                                  type="number"
                                  value={zone.price}
                                  onChange={(e) => {
                                    const updated = [...formData.zoneTickets];
                                    updated[index].price = Number(e.target.value);
                                    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                  }}
                                  sx={{ mb: 1 }}
                                />
                                <CustomTextField
                                  label="Tổng số vé"
                                  type="number"
                                  value={zone.totalTicketCount}
                                  onChange={(e) => {
                                    const updated = [...formData.zoneTickets];
                                    updated[index].totalTicketCount = Number(e.target.value);
                                    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                  }}
                                />
                              </>
                            ) : (
                              <>
                                <Typography fontSize={15}>
                                  Giá vé: {zone.price.toLocaleString()} ₫
                                </Typography>
                                <Typography fontSize={15}>
                                  Tổng số vé: {zone.totalTicketCount} vé
                                </Typography>
                                <Typography fontSize={15}>
                                  Số vé còn lại: {zone.availableCount} vé
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  }
                )}
              </Grid>
            ) : (
              <Typography color="text.secondary">Không có thông tin khu vực.</Typography>
            )}

            {isEditing && (
              <Box mt={2}>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      zoneTickets: [
                        ...(prev.zoneTickets || []),
                        {
                          name: "",
                          price: 0,
                          totalTicketCount: 0,
                          availableCount: 0,
                          isEditing: true,
                        },
                      ],
                    }))
                  }
                >
                  + Thêm khu vực
                </Button>
              </Box>
            )}
          </Box>
        )}
        {initialFormData.typeBase === "seat" && (
          <Box mt={3}>
            <Typography fontSize={18} fontWeight={600} gutterBottom>
              Danh sách khu vực ghế ngồi:
            </Typography>

            {(initialFormData.zones || [])
              .filter((zone) => zone.layout?.seats?.length > 0)
              .map((zone) => {
                const { rows, cols, seats } = zone.layout;
                const seatMap = Array.from({ length: rows }, () => Array(cols).fill(null));

                seats.forEach((seat) => {
                  const rowIndex = seat.row - 1;
                  const colIndex = seat.col - 1;
                  if (rowIndex < rows && colIndex < cols) {
                    seatMap[rowIndex][colIndex] = seat;
                  }
                });

                return (
                  <Box
                    key={zone._id}
                    component={Paper}
                    variant="outlined"
                    sx={{ p: 2, mb: 3, borderRadius: 2 }}
                  >
                    <Typography fontWeight={600} sx={{ mb: 1 }}>
                      Khu vực: {zone.name}
                    </Typography>
                    <Typography fontSize={15} sx={{ mb: 1 }}>
                      Tổng ghế: {seats.length} | Còn lại: {zone.availableCount}
                    </Typography>

                    <Box
                      sx={{ display: "grid", gridTemplateColumns: `repeat(${cols}, auto)`, gap: 1 }}
                    >
                      {seatMap.flatMap((row, rowIndex) =>
                        row.map((seat, colIndex) => (
                          <Box
                            key={`seat-${rowIndex}-${colIndex}`}
                            sx={{
                              px: 1.2,
                              py: 0.5,
                              minWidth: 40,
                              textAlign: "center",
                              fontSize: 13,
                              borderRadius: 1,
                              backgroundColor:
                                seat?.status === "booked"
                                  ? "#ffcdd2"
                                  : seat?.status === "available"
                                  ? "#c8e6c9"
                                  : "#eeeeee",
                              border: "1px solid #ccc",
                            }}
                          >
                            {seat?.label || ""}
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        )}

        {initialFormData.showtimes?.length > 0 && (
          <Box mt={3}>
            <Typography fontSize={18} fontWeight={600} gutterBottom>
              Danh sách suất diễn:
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              {initialFormData.showtimes.map((showtime, index) => {
                const startTime = formatVietnameseDateTime(showtime.startTime);
                const endTime = formatVietnameseDateTime(showtime.endTime);

                return (
                  <Box
                    key={showtime._id}
                    sx={{
                      backgroundColor: "#f0f4ff",
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: "5px solid #1976d2",
                      mb: 1.5,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Suất #{index + 1}:{" "}
                    <span style={{ fontWeight: 500 }}>
                      {startTime} → {endTime}
                    </span>
                  </Box>
                );
              })}
            </Paper>
          </Box>
        )}

        <Box mt={4} display="flex" justifyContent="flex-end">
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
                  setInitialFormData(initialFormData);
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

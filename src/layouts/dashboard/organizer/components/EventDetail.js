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
  Dialog,
} from "@mui/material";
import eventApi from "../../../../../src/api/eventApi"; // nếu không dùng alias

import CustomTextField from "../OrganizerCreateNewEvent/components/CustomTextField";
import TinyMCEEditor from "../OrganizerCreateNewEvent/components/TinyMCEEditor";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import TagSelector from "../OrganizerCreateNewEvent/components/TagSelector";
import axiosInstance from "../../../../api/axiosInstance";

const EventDetail = ({ eventId, onClose }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});
  const [isChanged, setIsChanged] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const response = await axiosInstance.get("/tags/suggest");
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải tag:", error);
      }
    };

    fetchAllTags();
  }, []);

  useEffect(() => {
    const hasChanged = JSON.stringify(initialFormData) !== JSON.stringify(formData);
    setIsChanged(hasChanged);
  }, [initialFormData, formData]);

  const formatDateInput = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16);
  };

  const convertISOToMillis = (datetimeStr) => {
    if (!datetimeStr) return null;
    const time = new Date(datetimeStr).getTime();
    return isNaN(time) ? null : time;
  };

  function formatInputDateTime(timestamp) {
    const date = new Date(timestamp);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }

  const formatVietnameseDateTimeInput = (timestamp) => {
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

  function formatVietnameseShowtime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const getWeekdayName = (day) =>
      ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day];

    const pad = (n) => n.toString().padStart(2, "0");

    const startHour = pad(start.getHours());
    const startMinute = pad(start.getMinutes());
    const endHour = pad(end.getHours());
    const endMinute = pad(end.getMinutes());

    const weekday = getWeekdayName(start.getDay());
    const day = start.getDate();
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    return `lúc ${startHour}:${startMinute} → ${endHour}:${endMinute} ${weekday}, ${day} tháng ${month}, ${year}`;
  }
  function formatVietnameseShowtime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const getWeekdayName = (day) =>
      ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day];

    const pad = (n) => n.toString().padStart(2, "0");

    const startHour = pad(start.getHours());
    const startMinute = pad(start.getMinutes());
    const endHour = pad(end.getHours());
    const endMinute = pad(end.getMinutes());

    const weekday = getWeekdayName(start.getDay());
    const day = start.getDate();
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    return `lúc ${startHour}:${startMinute} → ${endHour}:${endMinute} ${weekday}, ${day} tháng ${month}, ${year}`;
  }
  function formatVietnameseShowtime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const getWeekdayName = (day) =>
      ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"][day];

    const pad = (n) => n.toString().padStart(2, "0");

    const startHour = pad(start.getHours());
    const startMinute = pad(start.getMinutes());
    const endHour = pad(end.getHours());
    const endMinute = pad(end.getMinutes());

    const weekday = getWeekdayName(start.getDay());
    const day = start.getDate();
    const month = start.getMonth() + 1;
    const year = start.getFullYear();

    return `lúc ${startHour}:${startMinute} → ${endHour}:${endMinute} ${weekday}, ${day} tháng ${month}, ${year}`;
  }

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
          typeBase: data.typeBase,
          soldTickets: data.showtimes?.[0]?.soldTickets || 0,
          ticketPrice: data.ticketPrice || 0, // cho 'zone'
          ticketQuantity: data.ticketQuantity || 0, // cho 'zone'
          zoneTickets: data.zoneTickets || [], // dùng nếu cần
          zones: data.zones || [], // ✅ THÊM DÒNG NÀY
          showtimes: (data.showtimes || []).map((s) => {
            const base = {
              _id: s._id,
              eventId: s.eventId,
              startTime: s.startTime,
              endTime: s.endTime,
              soldTickets: s.soldTickets || 0,
            };

            // Nếu là typeBase = 'none' thì bổ sung ticketPrice & ticketQuantity
            if (data.typeBase === "none") {
              base.ticketPrice = data.showtimes?.[0]?.ticketPrice ?? 0;
              base.ticketQuantity = data.showtimes?.[0]?.ticketQuantity ?? 0;
            }

            return base;
          }),
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

  useEffect(() => {
    const safeFormImages = Array.isArray(formData.images) ? formData.images : [];
    const safeInitialImages = Array.isArray(initialFormData.images) ? initialFormData.images : [];

    const formImageUrls = safeFormImages.map((img) =>
      typeof img === "string" ? img : img.preview
    );

    const isAvatarChanged = formData.avatarFile instanceof File;
    const isBannerChanged = formData.bannerFile instanceof File;
    const isImagesChanged = JSON.stringify(formImageUrls) !== JSON.stringify(safeInitialImages);

    const isNameChanged = formData.name !== initialFormData.name;
    const isTimeStartChanged = formData.timeStart !== initialFormData.timeStart;
    const isTimeEndChanged = formData.timeEnd !== initialFormData.timeEnd;
    const isLocationChanged = formData.location !== initialFormData.location;
    const isZonesChanged =
      JSON.stringify(formData.zoneTickets) !== JSON.stringify(initialFormData.zoneTickets);

    const currentShowtimes = formData.showtimes || [];
    const initialShowtimes = initialFormData.showtimes || [];

    const isShowtimesChanged =
      currentShowtimes.length !== initialShowtimes.length ||
      currentShowtimes.some((s, i) => {
        const init = initialShowtimes[i];
        return !init || s.startTime !== init.startTime || s.endTime !== init.endTime;
      });

    const isTagsChanged = JSON.stringify(formData.tags) !== JSON.stringify(initialFormData.tags);

    setIsChanged(
      isAvatarChanged ||
        isBannerChanged ||
        isImagesChanged ||
        isNameChanged ||
        isTimeStartChanged ||
        isTimeEndChanged ||
        isLocationChanged ||
        isZonesChanged ||
        isShowtimesChanged ||
        isTagsChanged
    );
  }, [formData, initialFormData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newPreviews], // ✅ Fix ở đây
    }));

    // Reset input để chọn lại file cũ nếu cần
    e.target.value = "";
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [`${type}File`]: file,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "event_upload"); // preset bạn đã cấu hình trong Cloudinary

    const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
  };

  const getCoordinatesFromAddress = async (address) => {
    const apiKey = "pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F";
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
      address
    )}&api_key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("🔍 Phản hồi từ Goong:", data.results[0].geometry.location);

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.warn("⚠️ Không tìm thấy tọa độ cho địa chỉ:", address);
        return null;
      }
    } catch (err) {
      console.error("❌ Lỗi gọi Goong API:", err);
      return null;
    }
  };

  const addNewZone = () => {
    setFormData((prev) => ({
      ...prev,
      zoneTickets: [
        ...prev.zoneTickets,
        {
          name: "",
          price: 0,
          totalTicketCount: 0,
          isEditing: true,
        },
      ],
    }));
  };

  const startZoneEdit = (index) => {
    setFormData((prev) => {
      const updated = [...prev.zoneTickets];
      if (!updated[index]) return prev; // ✅ Chống lỗi nếu index không tồn tại
      updated[index] = {
        ...updated[index],
        isEditing: true,
      };
      return { ...prev, zoneTickets: updated };
    });
  };

  const toggleZoneEdit = (index) => {
    setFormData((prev) => {
      const updated = [...prev.zoneTickets];
      if (!updated[index]) return prev;
      updated[index] = {
        ...updated[index],
        isEditing: false,
      };
      return { ...prev, zoneTickets: updated };
    });
  };

  const removeZone = (index) => {
    const updated = [...formData.zoneTickets];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
  };

  const handleZoneChange = (index, field, value) => {
    const updated = [...formData.zoneTickets];
    updated[index][field] =
      field === "price" || field === "totalTicketCount" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, zoneTickets: updated }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const updatedFields = {};

      // 1. 🔤 Name
      if (formData.name !== initialFormData.name) {
        updatedFields.name = formData.name;
      }

      // 2. 🕒 Thời gian
      if (formData.timeStart !== initialFormData.timeStart) {
        updatedFields.timeStart = convertISOToMillis(formData.timeStart);
      }

      if (formData.timeEnd !== initialFormData.timeEnd) {
        updatedFields.timeEnd = convertISOToMillis(formData.timeEnd);
      }

      // 3. 🖼 Avatar (nếu có chọn ảnh mới - là file)
      if (formData.avatarFile) {
        const avatarUrl = await uploadToCloudinary(formData.avatarFile);
        updatedFields.avatar = avatarUrl;
      } else if (formData.avatar !== initialFormData.avatar) {
        updatedFields.avatar = formData.avatar;
      }

      // 4. 🖼 Banner
      if (formData.bannerFile) {
        const bannerUrl = await uploadToCloudinary(formData.bannerFile);
        updatedFields.banner = bannerUrl;
      } else if (formData.banner !== initialFormData.banner) {
        updatedFields.banner = formData.banner;
      }

      // 5. 🖼 Images (chỉ giữ lại URL string)
      const currentImageUrls = formData.images.map((img) =>
        typeof img === "string" ? img : img.preview
      );
      const initialImageUrls = initialFormData.images || [];

      const isImagesChanged =
        currentImageUrls.length !== initialImageUrls.length ||
        JSON.stringify(currentImageUrls) !== JSON.stringify(initialImageUrls);

      if (isImagesChanged) {
        // Nếu có file tạm (file), upload lên Cloudinary trước
        const uploadedUrls = await Promise.all(
          formData.images.map(async (img) => {
            if (typeof img === "string") return img;
            if (img.file) {
              const url = await uploadToCloudinary(img.file);
              return url;
            }
            return img.preview; // fallback
          })
        );
        updatedFields.images = uploadedUrls;
      }
      // Địa chỉ
      if (formData.location !== initialFormData.location) {
        updatedFields.location = formData.location;
        const coords = await getCoordinatesFromAddress(formData.location);
        if (coords) {
          updatedFields.latitude = coords.latitude;
          updatedFields.longitude = coords.longitude;
        } else {
          console.warn("Không lấy được toạ độ từ địa chỉ:", formData.location);
        }
      }
      // Zone
      if (JSON.stringify(formData.zoneTickets) !== JSON.stringify(initialFormData.zoneTickets)) {
        updatedFields.zones = formData.zoneTickets.map(({ name, price, totalTicketCount }) => ({
          name,
          price,
          totalTicketCount,
        }));
      }
      const isShowtimesChanged =
        formData.showtimes.length !== initialFormData.showtimes.length ||
        formData.showtimes.some((s, i) => {
          const init = initialFormData.showtimes[i];
          return !init || s.startTime !== init.startTime || s.endTime !== init.endTime;
        });

      if (isShowtimesChanged) {
        updatedFields.showtimes = formData.showtimes.map(({ startTime, endTime }) => ({
          startTime,
          endTime,
        }));
      }

      //Tag
      if (JSON.stringify(formData.tags) !== JSON.stringify(initialFormData.tags)) {
        updatedFields.tags = formData.tags;
      }

      // 6. Nếu không có thay đổi gì
      if (Object.keys(updatedFields).length === 0) {
        console.log("Không có thay đổi để lưu.");
        setIsSaving(false);
        return;
      }

      const payload = {
        id: eventId,
        typeBase: formData.typeBase,
        ...updatedFields,
      };

      console.log("📤 Payload gửi lên:", JSON.stringify(payload, null, 2));

      // TODO: Gọi API thực tế để cập nhật ở đây

      const res = await eventApi.editEvent(payload);
      console.log("✅ Cập nhật thành công:", res.data);

      // Cập nhật dữ liệu gốc
      setInitialFormData((prev) => ({ ...prev, ...updatedFields }));
      setIsChanged(false);
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Lỗi khi lưu thay đổi:", error);
    } finally {
      setIsSaving(false);
    }
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
          <Typography fontSize={22} fontWeight={600}>
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
              style={{ width: 500, borderRadius: 8 }}
              onClick={() =>
                setPreviewImageUrl(
                  isEditing && formData.avatarFile
                    ? URL.createObjectURL(formData.avatarFile)
                    : formData.avatar
                )
              }
            />
            {isEditing && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("avatar-upload").click()}
                  sx={{
                    mt: 1,
                    ml: 5,
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
                  Tải ảnh đại diện mới
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
              style={{ width: 500, borderRadius: 8 }}
              onClick={() =>
                setPreviewImageUrl(
                  isEditing && formData.avatarFile
                    ? URL.createObjectURL(formData.avatarFile)
                    : formData.avatar
                )
              }
            />
            {isEditing && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => document.getElementById("banner-upload").click()}
                  sx={{
                    mt: 1,
                    ml: 5,
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
                  Tải ảnh sự kiện mới
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
            <TinyMCEEditor
              value={formData.description}
              onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
              ready={true}
            />
          ) : (
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 5,
                backgroundColor: "#f9f9f9",
              }}
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
          )}
        </Box>

        {/* Luôn hiển thị danh sách tag */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" mb={1}>
            Thẻ sự kiện:
          </Typography>

          {isEditing && (
            <Box sx={{ mb: 2 }}>
              <TagSelector
                label="Chọn thẻ"
                value={formData.tags}
                onChange={(updatedTags) => {
                  setFormData((prev) => ({
                    ...prev,
                    tags: updatedTags,
                  }));
                }}
                options={suggestions.map((tag) => ({ label: tag, value: tag }))}
                searchable
              />
            </Box>
          )}

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
            {formData.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: "#fff",
                  border: 1,
                  borderColor: "#1976D2",
                  color: "#1976D2",
                }}
                onDelete={
                  isEditing
                    ? () => {
                        const updated = formData.tags.filter((_, i) => i !== index);
                        setFormData((prev) => ({
                          ...prev,
                          tags: updated,
                        }));
                      }
                    : undefined
                }
              />
            ))}
          </Box>
        </Box>

        <Box mt={3}>
          <Typography fontSize={18} fontWeight={700} gutterBottom>
            Thời gian bán vé:
          </Typography>

          {isEditing ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Bắt đầu bán vé:</Typography>
                <CustomTextField
                  type="datetime-local"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Kết thúc bán vé:</Typography>
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
                Bắt đầu: {formatVietnameseDateTimeInput(initialFormData.timeStart)}
              </Typography>
              <Typography fontSize={16} fontWeight={600} color="text.secondary">
                Kết thúc: {formatVietnameseDateTimeInput(initialFormData.timeEnd)}
              </Typography>
            </Box>
          )}
        </Box>

        {(isEditing || initialFormData.images?.length > 0 || formData.images?.length > 0) && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Hình ảnh liên quan:
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {(isEditing ? formData.images : initialFormData.images)?.map((img, index) => {
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
                      onClick={() => setPreviewImageUrl(url)}
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
                    + Thêm ảnh
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

        {initialFormData.typeBase === "none" && (
          <Box mt={3} display="flex" gap={2} flexWrap="wrap">
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
              Giá vé: {formData.showtimes[0]?.ticketPrice?.toLocaleString("vi-VN") || "0"} ₫
            </Typography>

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
              Số lượng vé: {formData.showtimes[0]?.ticketQuantity || "0"} vé
            </Typography>
          </Box>
        )}

        {initialFormData.typeBase === "zone" && (
          <Box mt={3}>
            <Typography fontSize={18} fontWeight={600} gutterBottom>
              Danh sách khu vực:
            </Typography>

            {formData.zoneTickets.length > 0 ? (
              <Grid container spacing={2}>
                {formData.zoneTickets.map((zone, index) => {
                  const isZoneEditing = isEditing && zone.isEditing;

                  return (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: "#fafafa",
                        }}
                      >
                        {isZoneEditing ? (
                          <Box display="flex" flexDirection="column" gap={2}>
                            <CustomTextField
                              label="Tên khu vực"
                              value={zone.name}
                              onChange={(e) => handleZoneChange(index, "name", e.target.value)}
                            />
                            <CustomTextField
                              label="Giá vé"
                              type="number"
                              value={zone.price}
                              onChange={(e) => handleZoneChange(index, "price", e.target.value)}
                            />
                            <CustomTextField
                              label="Số lượng vé"
                              type="number"
                              value={zone.totalTicketCount}
                              onChange={(e) =>
                                handleZoneChange(index, "totalTicketCount", e.target.value)
                              }
                            />

                            <Box display="flex" justifyContent="flex-end" gap={1}>
                              <IconButton color="primary" onClick={() => toggleZoneEdit(index)}>
                                <CheckIcon sx={{ fontSize: 20, color: "#000" }} />
                              </IconButton>
                              <IconButton
                                sx={{ fontSize: 20, color: "#000" }}
                                onClick={() => {
                                  const updated = formData.zoneTickets.filter(
                                    (_, i) => i !== index
                                  );
                                  setFormData((prev) => ({ ...prev, zoneTickets: updated }));
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight={600} fontSize={16}>
                                {zone.name}
                              </Typography>
                              {isEditing && (
                                <Box>
                                  <IconButton onClick={() => startZoneEdit(index)}>
                                    <EditIcon sx={{ fontSize: 20, color: "#000" }} />
                                  </IconButton>

                                  <IconButton onClick={() => removeZone(index)}>
                                    <DeleteIcon sx={{ fontSize: 20, color: "#000" }} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                            <Typography fontSize={14}>
                              Giá: {zone.price.toLocaleString()} ₫
                            </Typography>
                            <Typography fontSize={14}>Số vé: {zone.totalTicketCount}</Typography>
                            {typeof zone.availableCount === "number" && (
                              <Typography fontSize={14}>
                                Số vé còn lại: {zone.availableCount}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography color="text.secondary">Chưa có khu vực nào.</Typography>
            )}

            {isEditing && (
              <Button
                variant="outlined"
                onClick={addNewZone}
                sx={{
                  mt: 2,
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
                + Thêm khu vực
              </Button>
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
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 1 }}>
                      {[
                        ...new Set(
                          seats
                            .filter((s) => s.seatId !== "none")
                            .map((s) =>
                              JSON.stringify({ color: s.color, area: s.area, price: s.price })
                            )
                        ),
                      ].map((item, idx) => {
                        const { color, area, price } = JSON.parse(item);
                        return (
                          <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: color !== "none" ? color : "#eee",
                                border: "1px solid #999",
                                borderRadius: 0.5,
                              }}
                            />
                            <Typography fontSize={13}>
                              {area} – {price.toLocaleString()}đ
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${cols}, 30px)`,
                        gap: 0.5,
                      }}
                    >
                      {seatMap.flatMap((row, rowIndex) =>
                        row.map((seat, colIndex) => {
                          if (!seat || seat.seatId === "none") {
                            return (
                              <Box
                                key={`empty-${rowIndex}-${colIndex}`}
                                sx={{
                                  width: 30,
                                  height: 30,
                                }}
                              />
                            );
                          }

                          return (
                            <Box
                              key={`seat-${rowIndex}-${colIndex}`}
                              sx={{
                                width: 30,
                                height: 30,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                fontSize: 11,
                                borderRadius: 1,
                                color: "#fff",
                                backgroundColor:
                                  seat.color && seat.color !== "none"
                                    ? seat.color
                                    : seat.status === "booked"
                                    ? "#ffcdd2"
                                    : seat.status === "available"
                                    ? "#c8e6c9"
                                    : "#eeeeee",
                                border: "1px solid #ccc",
                              }}
                            >
                              {seat.label}
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        )}

        <Box mt={3}>
          <Typography fontSize={18} fontWeight={600} gutterBottom>
            Danh sách suất diễn:
          </Typography>

          <Grid container spacing={2}>
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
                          <b>{formatVietnameseShowtime(showtime.startTime, showtime.endTime)}</b>
                        </Typography>

                        {isEditing && (
                          <Box>
                            <IconButton
                              onClick={() => {
                                const updated = [...formData.showtimes];
                                updated[index].isEditing = true;
                                setFormData((prev) => ({ ...prev, showtimes: updated }));
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                const updated = formData.showtimes.filter((_, i) => i !== index);
                                setFormData((prev) => ({ ...prev, showtimes: updated }));
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        gap={2}
                        alignItems="center"
                        flexWrap="wrap"
                        justifyContent="space-between"
                      >
                        <CustomTextField
                          label="Thời gian bắt đầu"
                          type="datetime-local"
                          value={formatInputDateTime(showtime.startTime)}
                          onChange={(e) => {
                            const newStartTime = new Date(e.target.value).getTime();
                            const updated = formData.showtimes.map((item, i) =>
                              i === index ? { ...item, startTime: newStartTime } : item
                            );
                            setFormData((prev) => ({ ...prev, showtimes: updated }));
                          }}
                        />
                        <CustomTextField
                          label="Thời gian kết thúc"
                          type="datetime-local"
                          value={formatInputDateTime(showtime.endTime)}
                          onChange={(e) => {
                            const newEndTime = new Date(e.target.value).getTime();
                            const updated = formData.showtimes.map((item, i) =>
                              i === index ? { ...item, endTime: newEndTime } : item
                            );
                            setFormData((prev) => ({ ...prev, showtimes: updated }));
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            const updated = formData.showtimes.map((item, i) =>
                              i === index ? { ...item, isEditing: false } : item
                            );
                            setFormData((prev) => ({ ...prev, showtimes: updated }));
                          }}
                        >
                          <CheckIcon />
                        </IconButton>
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
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    showtimes: [
                      ...prev.showtimes,
                      {
                        startTime: new Date().getTime(),
                        endTime: new Date().getTime() + 2 * 60 * 60 * 1000,
                        isEditing: true,
                      },
                    ],
                  }))
                }
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
                + Thêm suất diễn
              </Button>
            </Box>
          )}
        </Box>

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
      <Dialog open={!!previewImageUrl} onClose={() => setPreviewImageUrl(null)} maxWidth="md">
        <img
          src={previewImageUrl}
          alt="Preview"
          style={{ width: "100%", height: "auto", borderRadius: 8 }}
        />
      </Dialog>
    </Box>
  );
};

EventDetail.propTypes = {
  eventId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventDetail;

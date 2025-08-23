import React, { useEffect, useState } from "react";
import { Box, Paper, Button, Typography, Dialog, Chip } from "@mui/material";
import PropTypes from "prop-types";
import ImageSection from "./EventDetail/ImageSection";
import eventApi from "../../../../../src/api/eventApi";
import GeneralInfoSection from "./EventDetail/GeneralInfoSection";
import TagSection from "./EventDetail/TagSection";
import TicketTimeSection from "./EventDetail/TicketTimeSection";
import ZoneTicketSection from "./EventDetail/ZoneTicketSection";
import WorkshopTicketSection from "./EventDetail/WorkshopTicketSection";
import ShowtimeEditorSection from "./EventDetail/ShowtimeEditorSection";
import SeatLayoutSection from "./EventDetail/seat/SeatLayoutSection";
import axiosInstance from "api/axiosInstance";
import ArgonButton from "components/ArgonButton";
import ArgonBox from "components/ArgonBox";

const EventDetail = ({ eventId, onClose }) => {
  const [formData, setFormData] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isPostponing, setIsPostponing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isFormChanged = () => {
    const omitKeys = ["_id", "typeBase", "ticketPrice", "ticketQuantity"];
    const cleanedCurrent = JSON.parse(JSON.stringify(formData));
    const cleanedInitial = JSON.parse(JSON.stringify(initialFormData));

    omitKeys.forEach((key) => {
      delete cleanedCurrent[key];
      delete cleanedInitial[key];
    });

    return JSON.stringify(cleanedCurrent) !== JSON.stringify(cleanedInitial);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventApi.getDetail(eventId);
        const data = res.data.data;
        setFormData(data);
        setInitialFormData(JSON.parse(JSON.stringify(data)));
        console.log("event", data);
        const showtimes = data?.showtimes || [];
        const hasSold = showtimes.some((s) => s.soldTickets > 0);
        setIsReadOnly(hasSold);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu sự kiện", err);
      }
    };

    fetchEvent();
  }, [refreshKey]);

  const prepareEventData = async () => {
    const updatedData = { ...formData };

    // Upload avatar nếu có file mới
    if (formData.avatarFile) {
      updatedData.avatar = await uploadToCloudinary(formData.avatarFile);
      delete updatedData.avatarFile;
    }

    // Upload banner nếu có file mới
    if (formData.bannerFile) {
      updatedData.banner = await uploadToCloudinary(formData.bannerFile);
      delete updatedData.bannerFile;
    }

    // Upload gallery (chỉ upload file mới, giữ lại URL đã có)
    if (formData.images && formData.images.length > 0) {
      const uploadedImages = await Promise.all(
        formData.images.map(async (item) => {
          if (typeof item === "string") return item; // ảnh đã upload
          return await uploadToCloudinary(item.file); // ảnh mới
        })
      );
      updatedData.images = uploadedImages;
    }

    const coordinates = await getCoordinatesFromAddress(updatedData.location);
    if (coordinates) {
      updatedData.latitude = coordinates.latitude;
      updatedData.longitude = coordinates.longitude;
    }
    if (updatedData.typeBase === "seat") {
      const layout = updatedData.zones?.[0]?.layout;
    }
    return updatedData;
  };

  const handleUpdate = async () => {
      setIsSaving(true);
      try {
        const dataToSend = await prepareEventData();
        const changedData = {
          id: dataToSend._id,
          typeBase: dataToSend.typeBase,
        };

        // Xử lý showtimes độc lập
        const cleanShowtimes = dataToSend.showtimes?.map((s) => ({
          _id: s.id || s._id,
          startTime: s.startTime,
          endTime: s.endTime,
        })) || [];
        const initialCleanShowtimes = initialFormData.showtimes?.map((s) => ({
          _id: s.id || s._id,
          startTime: s.startTime,
          endTime: s.endTime,
        })) || [];

        if (JSON.stringify(cleanShowtimes) !== JSON.stringify(initialCleanShowtimes)) {
          changedData.showtimes = cleanShowtimes;
        }

        // Xử lý các trường còn lại
        for (const key in dataToSend) {
          if (["_id", "typeBase", "ticketPrice", "ticketQuantity", "showtimes"].includes(key)) continue;

          // Zone - typeBase === "zone"
          if (key === "zoneTickets" && dataToSend.typeBase === "zone") {
            const formatZone = (zone) => ({
              name: zone.name,
              price: zone.price,
              totalTicketCount: zone.totalTicketCount,
            });

            const newZones = dataToSend.zoneTickets?.map(formatZone) || [];
            const initialZones = initialFormData.zoneTickets?.map(formatZone) || [];

            // Chỉ thêm zones nếu có thay đổi
            if (JSON.stringify(newZones) !== JSON.stringify(initialZones) && newZones.length > 0) {
              changedData.zones = newZones;
            }
            continue;
          }

          // Seat Layout - typeBase === "seat"
          if (key === "zones" && dataToSend.typeBase === "seat") {
            const newLayout = dataToSend.zones?.[0]?.layout || {};
            const initialLayout = initialFormData.zones?.[0]?.layout || {};

            // Chỉ thêm zones nếu layout có thay đổi
            if (JSON.stringify(newLayout) !== JSON.stringify(initialLayout)) {
              changedData.zones = [
                {
                  name: "Sơ đồ ghế",
                  layout: newLayout,
                },
              ];
            }
            continue;
          }

          // Các trường khác nếu có thay đổi
          if (JSON.stringify(dataToSend[key]) !== JSON.stringify(initialFormData[key])) {
            changedData[key] = dataToSend[key];
          }
        }

        // Nếu không có thay đổi nào, không gửi yêu cầu API
        if (Object.keys(changedData).length <= 2) { // Chỉ có id và typeBase
          console.log("🟡 Không có dữ liệu thay đổi để gửi.");
          setIsSaving(false);
          return;
        }

        // In dữ liệu trước khi gửi, đảm bảo showtimes có định dạng đúng
        console.log("🟡 Dữ liệu thay đổi cần gửi:\n", JSON.stringify(changedData, null, 2));

        const response = await axiosInstance.put(`/events/edit`, changedData);

        console.log("✅ Phản hồi từ server:", response);

        setInitialFormData(dataToSend);
        setIsEditing(false);
      } catch (err) {
        console.error("❌ Lỗi khi cập nhật sự kiện", err);
      } finally {
        setIsSaving(false);
      }
    };

  const getCoordinatesFromAddress = async (address) => {
    const apiKey = "pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F";
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log("🔍 Phản hồi từ Goong:", data.results?.[0]?.geometry?.location);

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

  const handleTogglePostpone = async () => {
    if (!formData) return;
    setIsPostponing(true);
    try {
      let response;
      switch (formData.approvalStatus) {
        case "approved":
          response = await eventApi.postponeEvent(formData._id);
          break;

        case "postponed":
          response = await eventApi.unpostponeEvent(formData._id);
          break;

        default:
          console.warn("⚠️ Trạng thái sự kiện không hỗ trợ hoãn/bỏ hoãn:", formData.approvalStatus);
          setIsPostponing(false);
          return;
      }

      if (response?.data) {
        console.log("✅ Kết quả:", response.data);
        setRefreshKey((prev) => prev + 1);
        const res = await eventApi.getDetail(formData._id);
        const updatedData = res.data.data;
        setFormData(updatedData);
        setInitialFormData(JSON.parse(JSON.stringify(updatedData)));
      }
    } catch (err) {
      console.error("❌ Lỗi khi hoãn/bỏ hoãn sự kiện:", err);
    } finally {
      setIsPostponing(false);
    }
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [`${type}File`]: file,
    }));

    e.target.value = "";
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...previews],
    }));

    e.target.value = "";
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "event_upload");

    const res = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  if (!formData) return null;

  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <ArgonButton color="info" size="medium" variant="contained" onClick={onClose}>
            {"←"} Quay lại
          </ArgonButton>
          <Box display="flex" gap={1}>
            {(() => {
            const isEnded = new Date(initialFormData.timeEnd) < new Date();
              const status = formData?.approvalStatus;

              // đã bán vé hay chưa
              const hasSold = formData?.showtimes?.some(s => s.soldTickets > 0);

              let showEdit = false;
              let showPostpone = false;

              if (!isEnded) {
                switch (status) {
                  case "pending":
                    showEdit = true; // chỉ chỉnh sửa
                    break;

                  case "approved":
                    if (hasSold) {
                      showPostpone = true; // đã bán vé thì chỉ hiện hoãn
                    } else {
                      showEdit = true; // chưa bán vé thì chỉ hiện chỉnh sửa
                    }
                    break;

                  case "postponed":
                    showEdit = true;     // vừa chỉnh sửa vừa bỏ hoãn
                    showPostpone = true;
                    break;

                  case "rejected":
                  default:
                    // ẩn hết
                    break;
                }
              }


              return (
                <>
                  {showPostpone && (
                    <Button
                      variant="contained"
                      onClick={handleTogglePostpone}
                      disabled={isPostponing}
                      color={status === "postponed" ? "success" : "error"}
                      sx={{
                        backgroundColor: status === "postponed" ? "#4CAF50" : "#f44336",
                        color: "#fff",
                        "&:hover": {
                          opacity: 0.9,
                        },
                        mr: 1,
                      }}
                    >
                      {isPostponing
                        ? "Đang xử lý..."
                        : status === "postponed"
                        ? "Huỷ hoãn sự kiện"
                        : "Hoãn sự kiện"}
                    </Button>
                  )}
                  {showEdit &&
                    (!isEditing ? (
                      <ArgonButton
                        color="info"
                        size="medium"
                        onClick={() => setIsEditing(true)}
                        variant="contained"
                      >
                        Chỉnh sửa
                      </ArgonButton>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setFormData(initialFormData);
                            setIsEditing(false);
                          }}
                          sx={{
                            backgroundColor: "#fff",
                            color: "#5669FF",
                            border: "1px solid #5669FF",
                            "&:hover": {
                              backgroundColor: "#5669FF",
                              color: "#fff",
                            },
                            mr: 1,
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleUpdate}
                          disabled={
                            isSaving ||
                            !isFormChanged() ||
                            (formData.showtimes?.length ?? 0) === 0
                          }
                          sx={{
                            backgroundColor: "#5669FF",
                            color: "#fff",
                            border: "1px solid #5669FF",
                            "&:hover": {
                              backgroundColor: "#fff",
                              color: "#5669FF",
                              borderColor: "#5669FF",
                            },
                          }}
                        >
                          {isSaving ? "Đang lưu..." : "Xác nhận"}
                        </Button>
                      </>
                    ))}
                </>
              );
            })()}
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontSize={24} fontWeight={700}>
            {isEditing ? "Chỉnh sửa sự kiện" : "Chi tiết sự kiện"}
          </Typography>
          <Chip
            label={
              formData.approvalStatus === "rejected"
                ? "Từ chối"
                : formData.approvalStatus === "postponed"
                ? "Tạm hoãn"
                : new Date() < new Date(initialFormData.timeStart)
                ? "Chưa mở bán"
                : new Date() > new Date(initialFormData.timeEnd)
                ? "Đã kết thúc"
                : "Đang mở bán"
            }
            color={
              formData.approvalStatus === "rejected"
                ? "error"
                : formData.approvalStatus === "postponed"
                ? "warning"
                : new Date() < new Date(initialFormData.timeStart)
                ? "warning"
                : new Date() > new Date(initialFormData.timeEnd)
                ? "error"
                : "success"
            }
            sx={{
              color: "#fff",
              backgroundColor:
                formData.approvalStatus === "postponed"
                  ? "#FFA500"
                  : formData.approvalStatus === "rejected"
                  ? "#D32F2F"
                  : undefined,
            }}
            size="small"
          />
        </Box>
        {isEditing ? (
          ""
        ) : (
          <Typography fontSize={24} fontWeight={700}>{formData.name}</Typography>
        )}

        <ImageSection
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          previewImageUrl={previewImageUrl}
          setPreviewImageUrl={setPreviewImageUrl}
          handleImageSelect={handleImageSelect}
          handleImageUpload={handleImageUpload}
          initialFormData={initialFormData}
        />

        <GeneralInfoSection
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          isReadOnly={isReadOnly}
        />

        <TagSection
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          isReadOnly={isReadOnly}
        />

        <TicketTimeSection
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
        />

        {formData?.typeBase === "none" && (
          <WorkshopTicketSection
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
        )}

        {formData?.typeBase === "zone" && (
          <ZoneTicketSection
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
        )}

        {formData?.typeBase === "seat" && (
          <SeatLayoutSection
            isEditing={isEditing}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        <ShowtimeEditorSection
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
        />
      </Paper>

      <Dialog open={!!previewImageUrl} onClose={() => setPreviewImageUrl(null)} maxWidth="md">
        <img src={previewImageUrl} alt="Preview" style={{ width: "100%", borderRadius: 8 }} />
      </Dialog>
    </Box>
  );
};

EventDetail.propTypes = {
  eventId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventDetail;
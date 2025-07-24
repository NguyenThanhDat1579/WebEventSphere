// src/components/tabs/TabInfoEvent.js
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  InputLabel,
  Button,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Popper,
  MenuList,
  Chip,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import SelectMenu from "../SelectMenu";
import TagSelector from "../TagSelector";
import TinyMCEEditor from "../TinyMCEEditor";
import { useDispatch, useSelector } from "react-redux";
import CustomTextField from "../CustomTextField";
import categoryApi from "api/utils/categoryApi";
import PropTypes from "prop-types";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AxiosIntent from "../../../../../../api/axiosInstance";
import provinceData from "../../../../../../data/province.json";
import wardData from "../../../../../../data/ward.json";

import {
  setEventName as setEventNameAction,
  setEventLogo as setEventLogoAction,
  setEventBanner as setEventBannerAction,
  setEventImages,
  setAddressName as setAddressNameAction,
  setFullAddress as setFullAddressAction,
  setCategory as setCategoryAction,
  setTags as setTagsAction,
  setLatitude as setLatitudeAction,
  setLongitude as setLongitudeAction,
  setDescription as setDescriptionAction,
  setOrganizerName as setOrganizerNameAction,
  setOrganizerDescription as setOrganizerDescriptionAction,
  setOrganizerLogo as setOrganizerLogoAction,
  setUserId,
  resetEventInfo,
} from "../../../../../../redux/store/slices/eventInfoSlice";

import {
  setProvince as setProvinceAction,
  setWard as setWardAction,
  setAddress as setAddressAction,
} from "../../../../../../redux/store/slices/eventAddressSlice";

export default function TabInfoEvent({ onNext }) {
  // 1. Redux và thư viện
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.id);
  const eventInfo = useSelector((state) => state.eventInfo);
  const { province, ward, address } = useSelector((state) => state.eventAddress);
  // 2. State
  const [formData, setFormData] = useState({
    eventName: "",
    addressName: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    eventBanner: "",
    eventName: "",
    addressName: "",
    province: "",
    address: "",
    category: "",
  });

  const [alertStatus, setAlertStatus] = useState(null); // "success", "error", null
  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration, setAlertDuration] = useState(5000);

  const [eventLogo, setEventLogo] = useState(null); // ảnh logo đã lưu
  const [tempLogoFile, setTempLogoFile] = useState(null); // file tạm
  const [previewLogo, setPreviewLogo] = useState(null); // URL preview

  const [eventBanner, setEventBanner] = useState(null);
  const [tempBannerFile, setTempBannerFile] = useState(null); // File tạm
  const [previewBanner, setPreviewBanner] = useState(null); // Preview ảnh mới

  const [images, setImages] = useState([]); // ảnh đã lưu
  const [tempGalleryFiles, setTempGalleryFiles] = useState([]); // ảnh tạm
  const [previewGallery, setPreviewGallery] = useState([]); // ảnh tạm preview

  const [selectedProvince, setSelectedProvince] = useState(province || "");
  const [selectedWard, setSelectedWard] = useState(ward || "");

  const [wards, setWards] = useState([]);

  const provinceOptions = Object.values(provinceData).map((p) => ({
    label: p.name_with_type, // ví dụ: "Thành phố Hà Nội"
    value: p.code, // ví dụ: "11"
  }));

  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      return;
    }

    const filtered = Object.values(wardData).filter(
      (ward) => ward.parent_code === selectedProvince
    );

    const wardOptions = filtered.map((w) => ({
      label: w.name_with_type,
      value: w.code,
    }));

    setWards(wardOptions);

    // ✅ Chỉ reset nếu ward không còn hợp lệ (ví dụ người đã đổi tỉnh)
    const wardStillValid = wardOptions.some((w) => w.value === selectedWard);
    if (!wardStillValid) {
      setSelectedWard("");
    }
  }, [selectedProvince, selectedWard]);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagError, setTagError] = useState("");

  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const response = await AxiosIntent.get("/tags/suggest");
        setSuggestions(response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải tag:", error);
      }
    };

    fetchAllTags();
  }, []);

  const handleCreateTag = (newTag) => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) {
      setTagError("Tag không được để trống");
      return;
    }
    if (tags.includes(trimmedTag)) {
      setTagError("Tag đã tồn tại");
      return;
    }
    setTags((prev) => [...prev, trimmedTag]);
  };

  const [description, setDescription] = useState("");
  const [readyToInitTiny, setReadyToInitTiny] = useState(false);
  // 3. useEffect – Theo dõi và load dữ liệu
  useEffect(() => {
    console.log("eventInfo đã cập nhật:", eventInfo);
    if (eventInfo?.avatar) {
      setEventLogo(eventInfo.avatar);
    }
    if (eventInfo?.banner) {
      setEventBanner(eventInfo.banner);
    }
    if (eventInfo?.images) {
      setImages([...eventInfo.images]);
    }

    if (eventInfo?.name) {
      setFormData((prev) => ({
        ...prev,
        eventName: eventInfo.name || "",
      }));
    }
    if (eventInfo?.tags) {
      setTags(eventInfo.tags);
    }

    if (address) {
      setFormData((prev) => ({
        ...prev,
        address: address || "",
      }));
    }
  }, [eventInfo]);
  useEffect(() => {
    const desc = eventInfo?.description?.trim();
    if (desc && desc !== "") {
      setDescription(desc);
    } else {
      setDescription(initialContent);
    }

    setReadyToInitTiny(true); // ✅ đảm bảo Tiny chỉ init khi đã có mô tả
  }, [eventInfo?.description]);

  const handleSelectImage = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`📸 Ảnh ${type} được chọn:`, file.name);
    const previewUrl = URL.createObjectURL(file);

    if (type === "logo") {
      setTempLogoFile(file);
      setPreviewLogo(previewUrl);
    } else if (type === "banner") {
      setTempBannerFile(file);
      setPreviewBanner(previewUrl);
    }

    e.target.value = null; // cho phép chọn lại cùng file
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "event_upload");
    formData.append("cloud_name", "deoqppiun");

    const res = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSelectGallery = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Log
    files.forEach((file) => {
      console.log("🖼️ Ảnh tạm gallery được chọn:", file.name);
    });

    // Thêm vào mảng tạm
    setTempGalleryFiles((prev) => [...prev, ...files]);

    // Thêm vào preview
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewGallery((prev) => [...prev, ...newPreviews]);

    e.target.value = null; // reset input
  };

  const handleRemoveSavedImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };
  const handleRemoveTempImage = (indexToRemove) => {
    setPreviewGallery((prev) => prev.filter((_, index) => index !== indexToRemove));
    setTempGalleryFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 5. Xử lý toạ độ
  const getCoordinatesFromAddress = async (fullAddress) => {
    const apiKey = "pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F";
    try {
      const response = await axios.get("https://rsapi.goong.io/Geocode", {
        params: { address: fullAddress, api_key: apiKey },
      });

      const location = response.data.results?.[0]?.geometry?.location;
      if (location) {
        return { latitude: location.lat, longitude: location.lng };
      } else {
        console.warn("Không tìm thấy tọa độ.");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi gọi API toạ độ:", error);
      return null;
    }
  };

  // 7. Xử lý form
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // 8. Lưu thông tin sự kiện
  const handleSaveEventInfos = async () => {
    const newErrors = {};
    let hasError = false;

    // ✅ Kiểm tra lỗi form
    if (!formData.eventName.trim()) {
      newErrors.eventName = "Vui lòng nhập tên sự kiện";
      hasError = true;
    }

    if (!selectedProvince) {
      newErrors.selectedProvince = "Vui lòng chọn tỉnh/thành";
      hasError = true;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập số nhà, đường";
      hasError = true;
    }

    if (tags.length === 0) {
      setTagError("Vui lòng nhập ít nhất 1 tag");
      hasError = true;
    } else {
      setTagError("");
    }

    setErrors(newErrors);
    if (hasError) return false;

    // ✅ Hiển thị trạng thái bắt đầu
    setAlertStatus("loading");
    setAlertMessage("Đang lưu dữ liệu...");
    setAlertDuration(null);
    try {
      let hasChange = false;

      // ✅ Upload logo nếu có
      if (tempLogoFile) {
        const url = await uploadImageToCloudinary(tempLogoFile);
        setEventLogo(url);
        dispatch(setEventLogoAction(url));
        hasChange = true;
      }

      // ✅ Upload banner nếu có
      if (tempBannerFile) {
        const url = await uploadImageToCloudinary(tempBannerFile);
        setEventBanner(url);
        dispatch(setEventBannerAction(url));
        hasChange = true;
      }

      // ✅ Upload gallery nếu có
      if (tempGalleryFiles.length > 0) {
        const uploadPromises = tempGalleryFiles.map(uploadImageToCloudinary);
        const uploadedUrls = await Promise.all(uploadPromises);

        const updatedList = [...images, ...uploadedUrls];
        setImages(updatedList);
        dispatch(setEventImages(updatedList));

        setTempGalleryFiles([]);
        setPreviewGallery([]);

        hasChange = true;
      }

      // ✅ Xử lý địa chỉ và geocoding
      const provinceName = provinceData[selectedProvince]?.name_with_type || "";
      const wardName = wardData[selectedWard]?.name_with_type || "";
      const fullAddress = `${formData.address}, ${wardName}, ${provinceName}`;

      dispatch(setProvinceAction(selectedProvince));
      dispatch(setWardAction(selectedWard));
      dispatch(setAddressAction(formData.address));

      const coords = await getCoordinatesFromAddress(fullAddress);
      if (coords?.latitude && coords?.longitude) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        dispatch(setEventNameAction(formData.eventName));
        dispatch(setFullAddressAction(fullAddress));
        dispatch(setCategoryAction("")); // TODO: set đúng category
        dispatch(setTagsAction(tags));
        dispatch(setLatitudeAction(coords.latitude));
        dispatch(setLongitudeAction(coords.longitude));
        dispatch(setDescriptionAction(description));
        dispatch(setUserId(userId));
      } else {
        console.warn("Không có tọa độ hợp lệ để lưu.");
      }

      setAlertStatus("success");
      setAlertMessage("Đã lưu dữ liệu!");
      return true;
    } catch (err) {
      console.error("Lỗi trong quá trình lưu:", err);
      setAlertStatus("error");
      setAlertMessage("Có lỗi xảy ra khi lưu dữ liệu.");
      return false;
    } finally {
      setTempLogoFile(null);
      setPreviewLogo(null);
      setTempBannerFile(null);
      setPreviewBanner(null);
    }
  };
  const handleNextClick = async () => {
    const isValid = await handleSaveEventInfos();
    if (isValid) {
      onNext(); // do EventTabContent truyền xuống
    }
  };

  // 9. Nội dung mẫu RichText (editor)
  const initialContent = `
  <h4>Giới thiệu sự kiện:</h4>
  <p><em>[Tóm tắt ngắn gọn về sự kiện...]</em></p>

  <h4>Chi tiết sự kiện:</h4>
  <p><strong>Chương trình chính:</strong> <em>[...]</em></p>
  <p><strong>Khách mời:</strong> <em>[...]</em></p>
  <p><strong>Trải nghiệm đặc biệt:</strong> <em>[...]</em></p>

  <h4>Điều khoản và điều kiện:</h4>
  <p><em>[...]</em></p>
`;

  return (
    <Box>
      {/* ✅ Khung: Ảnh & Tên sự kiện */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <span style={{ color: "red" }}>*</span> Upload hình ảnh
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 370,
                overflow: "hidden",
              }}
            >
              {previewLogo || eventLogo ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={previewLogo || eventLogo}
                    alt="Logo sự kiện"
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography sx={{ color: "#1976D2" }}>Thêm logo sự kiện</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#1976D2" }}>
                    (720x958)
                  </Typography>
                </Box>
              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleSelectImage(e, "logo")}
              />
            </Button>
          </Grid>
          <Grid item xs={12} sm={12}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "black",
                height: 370,
                textTransform: "none",
              }}
            >
              {previewBanner ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={previewBanner}
                    alt="Preview banner"
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : eventBanner ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={eventBanner}
                    alt="Ảnh nền sự kiện"
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography sx={{ color: "#1976D2" }}>Thêm ảnh nền sự kiện</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ color: "#1976D2" }}>
                    (1920x1080)
                  </Typography>
                </Box>
              )}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleSelectImage(e, "banner")}
              />
            </Button>

            {errors.eventBanner && (
              <Typography variant="body2" color="red" sx={{ mt: 0.5, ml: 1 }}>
                {errors.eventBanner}
              </Typography>
            )}
          </Grid>
          {/* <Typography variant="h6" gutterBottom sx={{ mt: 5, px: 3, mb: -6 }}>
            <span style={{ color: "red" }}>*</span> Hình ảnh liên quan
          </Typography>

          <Grid container spacing={2} sx={{ flexWrap: "nowrap", overflowX: "auto", mt: 2, p: 3 }}>
        
            {images.map((url, index) => (
              <Grid item key={`saved-${index}`} sx={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`image-${index}`}
                  style={{
                    width: 192,
                    height: 108,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSavedImage(index)}
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: -10,
                    bgcolor: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    boxShadow: 1,
                    p: 0.5,
                    "&:hover": { bgcolor: "error.main", color: "white" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Grid>
            ))}

            {previewGallery.map((url, index) => (
              <Grid item key={`preview-${index}`} sx={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`preview-${index}`}
                  style={{
                    width: 192,
                    height: 108,
                    borderRadius: 8,
                    objectFit: "cover",
                    opacity: 0.8,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveTempImage(index)}
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: -10,
                    bgcolor: "white",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    boxShadow: 1,
                    p: 0.5,
                    "&:hover": { bgcolor: "error.main", color: "white" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Grid>
            ))}

            <Grid item>
              <Box
                component="label"
                sx={{
                  width: 192,
                  height: 108,
                  border: "2px dashed gray",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                  color: "gray",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              >
                <AddIcon fontSize="large" />
                <Typography variant="body2" fontWeight="medium">
                  Thêm ảnh
                </Typography>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectGallery}
                />
              </Box>
            </Grid>
          </Grid> */}
          <Grid item xs={12}>
            <CustomTextField
              name="eventName"
              label={
                <>
                  <span style={{ color: "red" }}>*</span> Tên sự kiện
                </>
              }
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Nhập tên sự kiện"
              maxWidth="100%"
              maxLength={100}
              error={!!errors.eventName}
              helperText={errors.eventName}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Địa chỉ sự kiện
        </Typography>

        <Grid container spacing={3}>
          {/* Tên địa điểm */}
          {/* <Grid item xs={12}>
            <CustomTextField
              name="addressName"
              label={
                <>
                  <span style={{ color: "red" }}>*</span> Tên địa điểm
                </>
              }
              value={formData.addressName}
              onChange={handleChange}
              placeholder="Nhập tên địa điểm"
              maxLength={80}
              maxWidth="100%"
              error={!!errors.addressName}
              helperText={errors.addressName}
            />
          </Grid> */}
          {/* Tỉnh / Thành */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              <span style={{ color: "red" }}>*</span> Tỉnh/Thành
            </Typography>
            <SelectMenu
              label="Chọn tỉnh / thành phố"
              value={selectedProvince}
              onChange={(val) => {
                setSelectedProvince(val);
                setSelectedWard(""); // reset xã
              }}
              options={provinceOptions}
              searchable
            />
          </Grid>

          {/* Phường / Xã */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Phường/Xã
            </Typography>
            <SelectMenu
              label="Chọn phường / xã"
              value={selectedWard}
              onChange={(val) => setSelectedWard(val)}
              options={wards}
              searchable
            />
          </Grid>

          {/* Số nhà, đường */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              <span style={{ color: "red" }}>*</span> Số nhà, đường
            </Typography>
            <CustomTextField
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập số nhà, đường"
              maxLength={80}
              maxWidth="100%"
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <span style={{ color: "red" }}>*</span> Tag
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <TagSelector
                label="Chọn Tag"
                value={tags}
                onChange={(updatedSelectedTags) => {
                  setTags(updatedSelectedTags); // ✅ cập nhật trực tiếp

                  // Optional: xử lý tạo tag nếu muốn (chỉ khi tag mới không nằm trong gợi ý)
                  updatedSelectedTags.forEach((tag) => {
                    if (!suggestions.includes(tag)) {
                      handleCreateTag(tag);
                    }
                  });

                  setTagError(""); // xóa lỗi nếu có
                }}
                options={suggestions.map((tag) => ({ label: tag, value: tag }))}
                searchable
              />
            </Box>
            {tagError && (
              <Typography color="error" fontSize={13} mt={0.5}>
                {tagError}
              </Typography>
            )}

            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => setTags((prev) => prev.filter((_, i) => i !== index))}
                  deleteIcon={<CloseIcon />}
                  color="info"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ pt: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ pl: 3 }}>
          Thông tin sự kiện
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TinyMCEEditor value={description} onChange={setDescription} ready={readyToInitTiny} />
          </Grid>
        </Grid>
      </Paper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 3,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSaveEventInfos}
          sx={{
            color: "#5669FF",
            borderColor: "#5669FF",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#5669FF",
              color: "#fff",
            },
          }}
        >
          Lưu
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#5669FF",
            color: "#fff",
            border: "1px solid #5669FF",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#5669FF",
            },
          }}
          onClick={handleNextClick}
        >
          Tiếp tục
        </Button>
      </Box>
      <Snackbar
        open={Boolean(alertStatus)}
        autoHideDuration={alertDuration}
        onClose={() => setAlertStatus(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={
            alertStatus === "loading" ? "info" : alertStatus === "success" ? "success" : "error"
          }
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
TabInfoEvent.propTypes = {
  onNext: PropTypes.func.isRequired,
};

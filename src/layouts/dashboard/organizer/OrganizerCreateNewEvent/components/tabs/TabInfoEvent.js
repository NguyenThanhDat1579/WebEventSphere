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
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import SelectMenu from "../SelectMenu";
import TinyMCEEditor from "../TinyMCEEditor";
import { useDispatch, useSelector } from "react-redux";
import CustomTextField from "../CustomTextField";
import categoryApi from "api/utils/categoryApi";
import PropTypes from "prop-types";

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
  setDistrict as setDistrictAction,
  setWard as setWardAction,
  setAddress as setAddressAction,
} from "../../../../../../redux/store/slices/eventAddressSlice";

export default function TabInfoEvent({ onNext }) {
  // 1. Redux và thư viện
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.id);
  const eventInfo = useSelector((state) => state.eventInfo);
  const { province, district, ward, address } = useSelector((state) => state.eventAddress);
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

  const [eventLogo, setEventLogo] = useState(null);
  const [eventBanner, setEventBanner] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [loadingLogo, setLoadingLogo] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState(province || "");
  const [selectedDistrict, setSelectedDistrict] = useState(district || "");
  const [selectedWard, setSelectedWard] = useState(ward || "");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [categories, setCategories] = useState("");
  const [category, setCategory] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [tagError, setTagError] = useState("");

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
        eventName: address || "",
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

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((item) => ({
          label: item.name,
          value: item.code,
        }));
        setProvinces(options);
      });
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const options = data.districts.map((item) => ({
          label: item.name,
          value: item.code,
        }));
        setDistricts(options);
      });
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedDistrict) return;
    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const options = data.wards.map((item) => ({
          label: item.name,
          value: item.code,
        }));
        setWards(options);
      });
  }, [selectedDistrict]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response.data.status) {
          const formatted = response.data.data.map((item) => ({
            label: item.name,
            value: item._id,
          }));
          setCategories(formatted);
        } else {
          console.error("Lấy danh mục thất bại");
        }
      } catch (err) {
        console.error("Lỗi khi gọi API lấy danh mục", err);
      }
    };

    fetchCategories();
  }, []);

  // 4. Xử lý ảnh
  const handleImageUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === "gallery") {
      setUploadingImages(true); // Bắt đầu loading
      try {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "event_upload");
          formData.append("cloud_name", "deoqppiun");

          const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          return data.secure_url;
        });

        const imageUrls = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...imageUrls]);
      } catch (err) {
        console.error("Lỗi upload ảnh lên Cloudinary:", err);
      } finally {
        setUploadingImages(false); // Kết thúc loading
      }
      return;
    }

    // ✅ Nếu không phải type "gallery", xử lý một ảnh đơn
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "event_upload");
    formData.append("cloud_name", "deoqppiun");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const imageUrl = data.secure_url;

      switch (type) {
        case "logo":
          setLoadingLogo(true);
          setEventLogo(null); // Tùy chọn: xóa ảnh cũ trong lúc loading
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "event_upload");
            formData.append("cloud_name", "deoqppiun");

            const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();
            setEventLogo(data.secure_url);
          } catch (err) {
            console.error("Lỗi upload ảnh logo:", err);
          } finally {
            setLoadingLogo(false);
          }
          break;

        case "banner":
          setLoadingBanner(true);
          setEventBanner(null); // Xóa ảnh cũ tạm thời nếu muốn
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "event_upload");
            formData.append("cloud_name", "deoqppiun");

            const response = await fetch("https://api.cloudinary.com/v1_1/deoqppiun/image/upload", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();
            setEventBanner(data.secure_url);
          } catch (err) {
            console.error("Lỗi upload ảnh banner:", err);
          } finally {
            setLoadingBanner(false);
          }
          break;

        default:
          console.warn("Loại ảnh không xác định:", type);
      }
    } catch (err) {
      console.error("Lỗi upload ảnh lên Cloudinary:", err);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
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

  // 6. Xử lý tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim();

    if (!trimmed) {
      setTagError("Vui lòng nhập tag");
      return;
    }

    if (tags.length >= 5) {
      setTagError("Chỉ được nhập tối đa 5 tag");
      return;
    }

    const normalized = trimmed.toLowerCase();

    if (tags.some((tag) => tag.toLowerCase() === normalized)) {
      setTagError("Tag đã tồn tại");
      return;
    }

    setTags([...tags, trimmed]);
    setTagInput("");
    setTagError("");
  };

  const handleRemoveTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
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

    // if (!eventBanner) {
    //   newErrors.eventBanner = "Vui lòng tải lên ảnh nền sự kiện";
    //   hasError = true;
    // }
    if (!formData.eventName.trim()) {
      newErrors.eventName = "Vui lòng nhập tên sự kiện";
      hasError = true;
    }

    // if (!formData.addressName.trim()) {
    //   newErrors.addressName = "Vui lòng nhập tên địa điểm";
    //   hasError = true;
    // }

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

    const provinceName = provinces.find((p) => p.value === selectedProvince)?.label || "";
    const districtName = districts.find((d) => d.value === selectedDistrict)?.label || "";
    const wardName = wards.find((w) => w.value === selectedWard)?.label || "";
    const fullAddress = `${formData.address}, ${wardName}, ${districtName}, ${provinceName}`;

    dispatch(setProvinceAction(selectedProvince));
    dispatch(setDistrictAction(selectedDistrict));
    dispatch(setWardAction(selectedWard));
    dispatch(setAddressAction(formData.address));

    try {
      const coords = await getCoordinatesFromAddress(fullAddress);
      if (coords?.latitude && coords?.longitude) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        dispatch(setEventLogoAction(eventLogo));
        dispatch(setEventBannerAction(eventBanner));
        dispatch(setEventImages(images));
        dispatch(setEventNameAction(formData.eventName));
        dispatch(setFullAddressAction(fullAddress));
        dispatch(setCategoryAction("")); // TODO: set đúng category
        dispatch(setTagsAction(tags));
        dispatch(setLatitudeAction(coords.latitude));
        dispatch(setLongitudeAction(coords.longitude));
        dispatch(setDescriptionAction(description));
        dispatch(setUserId(userId));
      } else {
        console.warn("Không có toạ độ hợp lệ để lưu.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy tọa độ:", error);
    }

    return true;
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
              {loadingLogo ? (
                <Box textAlign="center">
                  <CircularProgress size={32} sx={{ color: "#1976D2", mb: 1 }} />
                  <Typography sx={{ color: "#1976D2" }}>Đang tải logo...</Typography>
                </Box>
              ) : eventLogo ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={eventLogo}
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
                onChange={(e) => handleImageUpload(e, "logo")}
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
              {loadingBanner ? (
                <Box textAlign="center">
                  <CircularProgress size={32} sx={{ color: "#1976D2", mb: 1 }} />
                  <Typography sx={{ color: "#1976D2" }}>Đang tải ảnh nền...</Typography>
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
                onChange={(e) => handleImageUpload(e, "banner")}
              />
            </Button>
            {errors.eventBanner && (
              <Typography variant="body2" color="red" sx={{ mt: 0.5, ml: 1 }}>
                {errors.eventBanner}
              </Typography>
            )}
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ mt: 5, px: 3, mb: -6 }}>
            <span style={{ color: "red" }}>*</span> Hình ảnh liên quan
          </Typography>

          <Grid container spacing={2} sx={{ flexWrap: "nowrap", overflowX: "auto", mt: 2, p: 3 }}>
            {/* Danh sách ảnh nằm bên trái */}
            {images.map((url, index) => (
              <Grid item key={index} sx={{ position: "relative" }}>
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
                  onClick={() => handleRemoveImage(index)}
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

            {/* Nút thêm ảnh nằm bên phải */}
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
                {uploadingImages ? (
                  <>
                    <CircularProgress size={32} />
                    <Typography variant="body2" mt={1}>
                      Đang tải...
                    </Typography>
                  </>
                ) : (
                  <>
                    <AddIcon fontSize="large" />
                    <Typography variant="body2" fontWeight="medium">
                      Thêm ảnh
                    </Typography>
                  </>
                )}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, "gallery")}
                />
              </Box>
            </Grid>
          </Grid>

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
                setSelectedDistrict("");
                setSelectedWard("");
              }}
              options={provinces}
            />

            {errors.province && (
              <Typography sx={{ color: "red", fontSize: 13, mt: 0.5 }}>
                {errors.province}
              </Typography>
            )}
          </Grid>
          {/* Quận / Huyện */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Quận/Huyện
            </Typography>

            <SelectMenu
              label="Chọn quận / huyện"
              value={selectedDistrict}
              onChange={(val) => {
                setSelectedDistrict(val);
                setSelectedWard("");
              }}
              options={selectedProvince ? districts : []}
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
              options={selectedDistrict ? wards : []}
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
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" gutterBottom>
              <span style={{ color: "red" }}>*</span> Tag
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <CustomTextField
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    if (tagError) setTagError("");
                  }}
                  placeholder="Nhập tag"
                  maxWidth={200}
                  inputSx={{
                    borderColor: tagError ? "red" : undefined,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />

                <Button
                  variant="contained"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()} // ✅ Disable nếu tagInput rỗng hoặc toàn khoảng trắng
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
                  Thêm tag
                </Button>
              </Box>

              {/* ✅ Thêm dòng này để hiển thị lỗi */}
              {tagError && (
                <Typography variant="caption" color="red" sx={{ ml: "4px", mt: "-6px" }}>
                  {tagError}
                </Typography>
              )}
            </Box>

            {/* ✅ Danh sách tag */}
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(index)}
                  deleteIcon={<CloseIcon />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {tags.length} / 5
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
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
            color: "#1976D2",
            borderColor: "#1976D2",
            backgroundColor: "#fff",
            "&:hover": {
              backgroundColor: "#1976D2",
              color: "#fff",
            },
          }}
        >
          Lưu
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976D2",
            color: "#fff",
            border: "1px solid #1976D2",
            "&:hover": {
              backgroundColor: "#fff",
              color: "#1976D2",
            },
          }}
          onClick={handleNextClick}
        >
          Tiếp tục
        </Button>
      </Box>
    </Box>
  );
}
TabInfoEvent.propTypes = {
  onNext: PropTypes.func.isRequired,
};

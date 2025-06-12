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

export default function TabInfoEvent() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.id);

  const [eventLogo, setEventLogo] = useState(null);
  const eventInfo = useSelector((state) => state.eventInfo);

  useEffect(() => {
    console.log("eventInfo đã cập nhật:", eventInfo);
  }, [eventInfo]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

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

      // Gán đúng state dựa trên type
      switch (type) {
        case "logo":
          setEventLogo(imageUrl);
          break;
        case "banner":
          setEventBanner(imageUrl);
          break;
        case "gallery":
          setImages((prev) => [...prev, imageUrl]);
          break;
        default:
          console.warn("Loại ảnh không xác định:", type);
      }
    } catch (err) {
      console.error("Lỗi upload ảnh lên Cloudinary:", err);
    }
  };

  const [eventBanner, setEventBanner] = useState(null);
  const [images, setImages] = useState([]);

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const [organizerLogo, setOrganizerLogo] = useState(null);

  const [eventName, setEventName] = useState("");

  const [addressName, setaddressName] = useState("");

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const getCoordinatesFromAddress = async (fullAddress) => {
    const apiKey = "pJ2xud8j3xprqVfQZLFKjGV51MPH60VjRuZh1i3F"; // Thay bằng API key của bạn

    try {
      const response = await axios.get("https://rsapi.goong.io/Geocode", {
        params: {
          address: fullAddress,
          api_key: apiKey,
        },
      });

      const location = response.data.results?.[0]?.geometry?.location;

      if (location) {
        const { lat, lng } = location;
        return {
          latitude: lat,
          longitude: lng,
        };
      } else {
        console.warn("Không tìm thấy tọa độ.");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi gọi API toạ độ:", error);
      return null;
    }
  };
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Lấy danh sách tỉnh
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

  // Lấy danh sách quận khi chọn tỉnh
  useEffect(() => {
    if (!province) return;
    fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const options = data.districts.map((item) => ({
          label: item.name,
          value: item.code,
        }));
        setDistricts(options);
      });
  }, [province]);

  // Lấy danh sách phường khi chọn quận
  useEffect(() => {
    if (!district) return;
    fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const options = data.wards.map((item) => ({
          label: item.name,
          value: item.code,
        }));
        setWards(options);
      });
  }, [district]);

  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response.data.status) {
          const formattedCategories = response.data.data.map((item) => ({
            label: item.name,
            value: item._id,
          }));
          setCategories(formattedCategories); // cập nhật dạng {label, value}
        } else {
          console.error("Lấy danh mục thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API lấy danh mục", error);
      }
    };

    fetchCategories();
  }, []);
  const [categories, setCategories] = useState("");
  const [category, setCategory] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const initialContent = `
  <h4>Giới thiệu sự kiện:</h4>
  <p><em>[Tóm tắt ngắn gọn về sự kiện: Nội dung chính của sự kiện, điểm đặc sắc nhất và lý do khiến người tham gia không nên bỏ lỡ]</em></p>

  <h4>Chi tiết sự kiện:</h4>
  <p><strong>Chương trình chính:</strong> <em>[Liệt kê những hoạt động nổi bật trong sự kiện: các phần trình diễn, khách mời đặc biệt, lịch trình các tiết mục cụ thể nếu có.]</em></p>
  <p><strong>Khách mời:</strong> <em>[Thông tin về các khách mời đặc biệt, nghệ sĩ, diễn giả sẽ tham gia sự kiện. Có thể bao gồm phần mô tả ngắn gọn về họ và những gì họ sẽ mang lại cho sự kiện.]</em></p>
  <p><strong>Trải nghiệm đặc biệt:</strong> <em>[Nếu có các hoạt động đặc biệt khác như workshop, khu trải nghiệm, photo booth, khu vực check-in hay các phần quà/ưu đãi dành riêng cho người tham dự.]</em></p>

  <h4>Điều khoản và điều kiện:</h4>
  <p><em>[TnC sự kiện]</em></p>
  <p><em>Lưu ý về điều khoản trẻ em</em></p>
  <p><em>Lưu ý về điều khoản VAT</em></p>
`;

  const [description, setDescription] = useState("");

  const [organizerName, setOrganizerName] = useState("");
  const [organizerDescription, setOrganizerDescription] = useState("");

  const handleOrganizerNameChange = (e) => {
    setOrganizerName(e.target.value);
  };

  const handleOrganizerDescriptionChange = (e) => {
    setOrganizerDescription(e.target.value);
  };

  const handleSaveEventInfos = async () => {
    const provinceName = provinces.find((p) => p.value === province)?.label || "";
    const districtName = districts.find((d) => d.value === district)?.label || "";
    const wardName = wards.find((w) => w.value === ward)?.label || "";
    const fullAddress = `${address}, ${wardName}, ${districtName}, ${provinceName}`;
    try {
      const coords = await getCoordinatesFromAddress(fullAddress);

      if (coords?.latitude && coords?.longitude) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        // Dispatch chỉ khi có toạ độ hợp lệ
        dispatch(setEventLogoAction(eventLogo));
        dispatch(setEventBannerAction(eventBanner));
        dispatch(setEventImages(images));
        dispatch(setEventNameAction(eventName));
        dispatch(setFullAddressAction(fullAddress));
        dispatch(setCategoryAction(category));
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

    // dispatch(setAddressNameAction(addressName));
    // dispatch(setOrganizerLogoAction(organizerLogo));
    // dispatch(setOrganizerNameAction(organizerName));
    // dispatch(setOrganizerDescriptionAction(organizerDescription));
  };

  return (
    <Box>
      {/* ✅ Khung: Ảnh & Tên sự kiện */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload hình ảnh
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3.5}>
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
              {eventLogo ? (
                // Nếu đã có ảnh
                <Box
                  sx={{
                    width: "90%",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={eventLogo}
                    alt="Logo sự kiện"
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : (
                // Nếu chưa có ảnh, hiển thị hướng dẫn
                <Box textAlign="center">
                  <Typography>Thêm logo sự kiện</Typography>
                  <Typography variant="body2" fontWeight="bold" color="black">
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

          <Grid item xs={12} sm={8.5}>
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
              {eventBanner ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={eventBanner}
                    alt="Ảnh nền sự kiện"
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography>Thêm ảnh nền sự kiện</Typography>
                  <Typography variant="body2" fontWeight="bold" color="black">
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
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 4, mt: 5 }}>
              {/* Nút thêm ảnh nằm trên */}

              <Button variant="outlined" component="label">
                Thêm ảnh
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "gallery")}
                />
              </Button>

              {/* Danh sách ảnh đã upload nằm dưới và cuộn ngang */}
              <Box sx={{ overflowX: "auto", mt: 2, pr: 5, pt: 3 }}>
                <Grid container spacing={2} sx={{ flexWrap: "nowrap" }}>
                  {images.map((url, index) => (
                    <Grid item key={index} sx={{ position: "relative" }}>
                      <img
                        src={url}
                        alt={`image-${index}`}
                        style={{
                          width: 384,
                          height: 216,
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
                </Grid>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Tên sự kiện
            </Typography>

            <CustomTextField
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Nhập tên sự kiện"
              maxLength={100}
              maxWidth="100%"
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
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Tên địa điểm
            </Typography>
            <CustomTextField
              value={addressName}
              onChange={(e) => setaddressName(e.target.value)}
              placeholder="Nhập tên địa điểm"
              maxLength={80}
              maxWidth="100%"
            />
          </Grid>
          {/* Tỉnh / Thành */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Tỉnh/Thành
            </Typography>
            <SelectMenu
              label="Chọn tỉnh / thành phố"
              value={province}
              onChange={(val) => {
                setProvince(val);
                setDistrict("");
                setWard("");
              }}
              options={provinces}
            />
          </Grid>
          {/* Quận / Huyện */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Quận/Huyện
            </Typography>
            <SelectMenu
              label="Chọn quận / huyện"
              value={district}
              onChange={(val) => {
                setDistrict(val);
                setWard("");
              }}
              options={province ? districts : []}
            />
          </Grid>
          {/* Phường / Xã */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Phường/Xã
            </Typography>
            <SelectMenu
              label="Chọn phường / xã"
              value={ward}
              onChange={(val) => setWard(val)}
              options={district ? wards : []}
            />
          </Grid>

          {/* Số nhà, đường */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Số nhà, đường
            </Typography>
            <CustomTextField
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập số nhà, đường"
              maxLength={80}
              maxWidth="100%"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thể loại sự kiện
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <SelectMenu
              label="Chọn thể loại"
              value={category} // là _id
              onChange={(val) => setCategory(val)} // val là _id được chọn
              options={categories}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <Typography variant="h6" gutterBottom>
              Tag
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <CustomTextField
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập tag"
                maxWidth={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <IconButton color="primary" onClick={handleAddTag}>
                <AddIcon />
              </IconButton>
            </Box>

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
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin sự kiện
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TinyMCEEditor
              value={description || initialContent}
              onChange={(value) => setDescription(value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin Ban Tổ Chức
        </Typography>

        <Grid container spacing={3}>
     
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 220,
              }}
            >
              {organizerLogo ? (
                <Box sx={{ width: "90%", textAlign: "center" }}>
                  <img
                    src={organizerLogo}
                    alt="Logo ban tổ chức"
                    style={{
                      width: "100%",
                      maxHeight: 150,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </Box>
              ) : (
                <Box textAlign="center">
                  <Typography>Thêm logo ban tổ chức</Typography>
                  <Typography variant="body2" fontWeight="bold" color="black">
                    (512x512)
                  </Typography>
                </Box>
              )}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setOrganizerLogo)}
              />
            </Button>
          </Grid>

  
          <Grid item xs={12} sm={10}>
   
            <Typography variant="h6" gutterBottom>
              Tên ban tổ chức
            </Typography>
            <Box sx={{ width: "100%", position: "relative", mb: 3 }}>
              <TextField
                placeholder="Nhập tên ban tổ chức"
                size="small"
                value={organizerName}
                onChange={handleOrganizerNameChange}
                fullWidth
                inputProps={{
                  maxLength: 80,
                  style: { paddingBottom: 24, paddingLeft: 0 },
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 6,
                  right: 8,
                  fontSize: 12,
                  color: "gray",
                  pointerEvents: "none",
                  userSelect: "none",
                  padding: "0 4px",
                }}
              >
                {organizerName.length} / 100
              </Typography>
            </Box>

       
            <Typography variant="h6" gutterBottom>
              Thông tin ban tổ chức
            </Typography>
            <TextField
              placeholder="Thông tin ban tổ chức"
              multiline
              rows={4}
              fullWidth
              value={organizerDescription}
              onChange={handleOrganizerDescriptionChange}
            />
          </Grid>
        </Grid>
      </Paper> 
   */}
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
            borderColor: "primary.main",
            color: "primary.main",
            "&:hover": {
              backgroundColor: "primary.main",
              color: "#FFFFFF",
            },
          }}
        >
          Lưu
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: "#FFFFFF",
            border: "1px solid",
            borderColor: "primary.main",
            "&:hover": {
              backgroundColor: "#f5f5f5",
              color: "primary.main",
            },
          }}
        >
          Tiếp tục
        </Button>
      </Box>
    </Box>
  );
}

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
} from "@mui/material";
import SelectMenu from "../SelectMenu";
import TinyMCEEditor from "../TinyMCEEditor";
export default function TabInfoEvent() {
  const [eventLogo, setEventLogo] = useState(null);
  const [eventBanner, setEventBanner] = useState(null);
  const [organizerLogo, setOrganizerLogo] = useState(null);

  const handleImageUpload = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const [eventName, setEventName] = useState("");

  const handleEventNameChange = (e) => {
    // Giới hạn tối đa 100 ký tự
    if (e.target.value.length <= 100) {
      setEventName(e.target.value);
    }
  };

  const [addressName, setaddressName] = useState("");

  const handleAddressNameChange = (e) => {
    // Giới hạn tối đa 80 ký tự
    if (e.target.value.length <= 80) {
      setaddressName(e.target.value);
    }
  };

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

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

  const handleAddress = (e) => {
    // Giới hạn tối đa 80 ký tự
    if (e.target.value.length <= 80) {
      setAddress(e.target.value);
    }
  };

  const categories = [
    { label: "Hội thảo", value: "hoithao" },
    { label: "Triển lãm", value: "trienlam" },
    { label: "Hội chợ", value: "hoicho" },
    { label: "Giải trí", value: "giaitri" },
    { label: "Thể thao", value: "thethao" },
  ];
  const [category, setCategory] = useState("");

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
  const [organizerNameLogo, setOrganizerNameLogoLogo] = useState(null);

  const handleOrganizerNameChange = (e) => {
    setOrganizerName(e.target.value);
  };

  const handleOrganizerDescriptionChange = (e) => {
    setOrganizerDescription(e.target.value);
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
              }}
            >
              <Box textAlign="center">
                <Typography>Thêm logo sự kiện</Typography>
                <Typography variant="body2" fontWeight="bold" color="black">
                  (720x958)
                </Typography>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setEventLogo)}
              />
            </Button>

            {eventLogo && (
              <img
                src={eventLogo}
                alt="Logo sự kiện"
                style={{ marginTop: 8, width: "100%", maxHeight: 150, objectFit: "contain" }}
              />
            )}
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
              <Box textAlign="center">
                <Typography>Thêm ảnh nền sự kiện</Typography>
                <Typography fontWeight={800} color="black">
                  (1280x720)
                </Typography>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setEventBanner)}
              />
            </Button>

            {eventBanner && (
              <img
                src={eventBanner}
                alt="Ảnh nền sự kiện"
                style={{ marginTop: 8, width: "100%", maxHeight: 150, objectFit: "cover" }}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Tên sự kiện
            </Typography>
            <Box sx={{ width: "100%", position: "relative" }}>
              <TextField
                placeholder="Nhập tên sự kiện"
                size="small"
                value={eventName}
                onChange={handleEventNameChange}
                fullWidth
                inputProps={{ maxLength: 100, style: { paddingBottom: 24, paddingLeft: 0 } }} // thêm khoảng trống dưới input để hiện số ký tự
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
                {eventName.length} / 100
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tên địa điểm
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ width: "100%", position: "relative" }}>
              <TextField
                placeholder="Nhập tên địa điểm"
                size="small"
                value={addressName}
                onChange={handleAddressNameChange}
                fullWidth
                inputProps={{ maxLength: 80, style: { paddingBottom: 24, paddingLeft: 0 } }} // thêm khoảng trống dưới input để hiện số ký tự
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
                {eventName.length} / 80
              </Typography>
            </Box>
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
            <Box sx={{ width: "100%", position: "relative" }}>
              <TextField
                placeholder="Nhập tên địa điểm"
                size="medium"
                value={address}
                onChange={handleAddress}
                fullWidth
                inputProps={{
                  maxLength: 80,
                  style: { paddingBottom: 24, paddingLeft: 0 },
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 9,
                  right: 8,
                  fontSize: 12,
                  color: "gray",
                  pointerEvents: "none",
                  userSelect: "none",
                  padding: "0 4px",
                }}
              >
                {eventName.length} / 80
              </Typography>
            </Box>
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
            <Box sx={{ width: "100%", position: "relative" }}>
              <TextField
                placeholder="Nhập tên địa điểm"
                size="medium"
                value={addressName}
                onChange={handleAddressNameChange}
                fullWidth
                inputProps={{
                  maxLength: 80,
                  style: { paddingBottom: 24, paddingLeft: 0 },
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 9,
                  right: 8,
                  fontSize: 12,
                  color: "gray",
                  pointerEvents: "none",
                  userSelect: "none",
                  padding: "0 4px",
                }}
              >
                {eventName.length} / 80
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thể loại sự kiện
        </Typography>

        <Grid container spacing={3}>
          {/* Phường / Xã */}
          <Grid item xs={12} sm={12}>
            <SelectMenu
              label="Chọn thể loại"
              value={category}
              onChange={(val) => setCategory(val)}
              options={categories}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin sự kiện
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <TinyMCEEditor value={initialContent} onChange={setDescription} />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thông tin Ban Tổ Chức
        </Typography>

        <Grid container spacing={3}>
          {/* Logo ban tổ chức (bên trái) */}
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
              <Box textAlign="center">
                <Typography>Thêm logo ban tổ chức</Typography>
                <Typography variant="body2" fontWeight="bold" color="black">
                  (275x275)
                </Typography>
              </Box>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setEventLogo)}
              />
            </Button>

            {eventLogo && (
              <img
                src={eventLogo}
                alt="Logo ban tổ chức"
                style={{
                  marginTop: 8,
                  width: "100%",
                  maxHeight: 150,
                  objectFit: "contain",
                }}
              />
            )}
          </Grid>

          {/* Tên + thông tin ban tổ chức (bên phải) */}
          <Grid item xs={12} sm={10}>
            {/* Tên ban tổ chức */}
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
                  maxLength: 100,
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

            {/* Thông tin mô tả ban tổ chức */}
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

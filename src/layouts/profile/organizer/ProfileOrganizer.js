import React, { useEffect, useState } from "react";

// @mui material components
import {
  Grid,
  Card,
  Avatar,
  Button,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

// Layout & Components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ArgonBox from "components/ArgonBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CustomTextField from "layouts/dashboard/organizer/OrganizerCreateNewEvent/components/CustomTextField";

// API & Redux
import { useDispatch, useSelector } from "react-redux";
import userApi from "api/userApi";
import ArgonInput from "components/ArgonInput";
import ArgonTypography from "components/ArgonTypography";
import authApi from "api/utils/authApi";
import { clearUserData } from "../../../redux/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

// Upload avatar function
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

const ProfileOrganizer = () => {
  const userId = useSelector((state) => state.auth.id);

  // Profile state
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [editedName, setEditedName] = useState("");

  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Avatar state
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Validate tên
  const [nameError, setNameError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Validate form tên
  const validateForm = () => {
    let isValid = true;
    if (!editedName.trim()) {
      setNameError("Tên nhà tổ chức không được để trống.");
      isValid = false;
    } else {
      setNameError("");
    }
    return isValid;
  };

  // Validate đổi mật khẩu
  const validatePasswordForm = () => {
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };
    let isValid = true;

    if (!currentPassword.trim()) {
      errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
      isValid = false;
    }
    if (!newPassword.trim()) {
      errors.newPassword = "Vui lòng nhập mật khẩu mới.";
      isValid = false;
    }
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng nhập lại mật khẩu mới.";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu mới không trùng khớp.";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Fetch profile khi mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getUserById(userId);
        const user = response.data.data;
        setProfile(user);
        setEditedName(user.username || "");
        setPreviewUrl(user.picUrl);

        setAccountHolder(user.bankAccountHolder || "");
        setAccountNumber(user.bankAccountNumber || "");
        setBankName(user.bankName || "");
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);


  // Chọn avatar mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveBankInfo = async () => {
    try {
      setLoading(true);
      const body = {
        id: userId,
        bankAccountHolder: accountHolder,
        bankAccountNumber: accountNumber,
        bankName: bankName,
      };

      const response = await userApi.updateBankInfo(body);
      console.log("Cập nhật thông tin ngân hàng thành công:", response);

      // Cập nhật state profile
      setProfile(prev => ({
        ...prev,
        bankAccountHolder: accountHolder,
        bankAccountNumber: accountNumber,
        bankName: bankName,
      }));

      alert("Cập nhật thông tin ngân hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin ngân hàng:", error);
      alert("Cập nhật thông tin ngân hàng thất bại!");
    } finally {
      setLoading(false);
    }
  };


  // Lưu chỉnh sửa profile
  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);

      let uploadedImageUrl = null;
      if (selectedImage) {
        uploadedImageUrl = await uploadImageToCloudinary(selectedImage);
      }

      const body = { id: userId };
      if (editedName !== profile.username) body.username = editedName;
      if (uploadedImageUrl) body.picUrl = uploadedImageUrl;

      if (body.username || body.picUrl) {
        console.log("dữ liệu gửi đi: ", body);
        const response = await userApi.editUser(body);
        console.log("Phản hồi từ server khi cập nhật người dùng:", response);
        setProfile((prev) => ({
          ...prev,
          ...(body.username && { username: body.username }),
          ...(body.picUrl && { picUrl: body.picUrl }),
        }));
        setSelectedImage(null);
      }

      setEditMode(false);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    try {
      setLoading(true);
      const body = {
        id: userId,
        currentPassword: currentPassword,
        newPassword: newPassword,
      }
      const response = await  userApi.editPassword(body);
      console.log("Đổi mật khẩu thành công:", response);

      // Reset
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMode(false);
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
  // Clear Redux state
  dispatch(clearUserData());

  // Xoá thêm localStorage nếu có dùng
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userData");

  // Navigate về trang đăng nhập
  navigate("/authentication/sign-in");

  setTimeout(() => {
    window.location.reload();
  }, 100); // Delay nhẹ để đảm bảo navigate xong mới reload
};

  if (!profile) return null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox mt={3}>
        <Card sx={{ p: 4 }}>
          {!passwordMode ? (
            // ================== PROFILE MODE ==================
            <Grid container spacing={2}>
              {/* Avatar */}
              <Grid item xs={12} sm={3} textAlign="center">
                <Avatar
                  src={previewUrl || profile.picUrl}
                  alt="Avatar"
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 1,
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: "50%",
                  }}
                  onClick={() => !editMode && setDialogOpen(true)}
                />
                {editMode && (
                  <ArgonBox mt={2}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        backgroundColor: "#5669FF",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#fff",
                          color: "#5669FF",
                        },
                      }}
                    >
                      Thay đổi ảnh đại diện
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </Button>
                  </ArgonBox>
                )}
              </Grid>

              {/* Thông tin */}
             <Grid item xs={12} sm={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">THÔNG TIN NHÀ TỔ CHỨC</Typography>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Email liên hệ"
                    name="email"
                    value={profile.email}
                    fullWidth
                    disabled
                  />
                </Grid>

                {/* Tên nhà tổ chức */}
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Tên nhà tổ chức"
                    name="username"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    fullWidth
                    disabled={!editMode}
                    error={Boolean(nameError)}
                    helperText={nameError}
                  />
                </Grid>

                {/* Chủ tài khoản */}
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Chủ tài khoản"
                    name="accountHolder"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>

                {/* Số tài khoản */}
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Số tài khoản"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>

                {/* Tên ngân hàng */}
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Tên ngân hàng"
                    name="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    fullWidth
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>


                {/* Nút hành động */}
                <Grid item xs={12} mt={1.5}>
                  {editMode ? (
                    <>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#5669FF",
                          color: "#fff",
                          mr: 3,
                        }}
                         onClick={async () => {
                            await handleSave();          // Lưu thông tin profile (username, avatar)
                            await handleSaveBankInfo();  // Lưu thông tin ngân hàng
                          }}
                          disabled={loading}
                      >
                        Thay đổi
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          backgroundColor: "#fff",
                          color: "#5669FF",
                          border: "1px solid #5669FF",
                        }}
                        onClick={() => {
                          setEditedName(profile.username);
                          setPreviewUrl(profile.picUrl);
                          setSelectedImage(null);
                          setEditMode(false);
                          setNameError("");
                        }}
                      >
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#5669FF",
                          color: "#fff",
                          mr: 2,
                        }}
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Chỉnh sửa
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          color: "#5669FF",
                          border: "1px solid #5669FF",
                        }}
                        onClick={() => setPasswordMode(true)}
                      >
                        Đổi mật khẩu
                      </Button>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          ) : (
            // ================== PASSWORD MODE ==================
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">ĐỔI MẬT KHẨU</Typography>
              </Grid>

              {/* input thẳng hàng từ trên xuống */}
              <Grid item xs={6.1}>
                <ArgonTypography variant="body2" fontWeight="900" color="text" mb={1}>
                  Nhập mật khẩu hiện tại
              </ArgonTypography>
              <ArgonInput
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={!!passwordErrors.currentPassword}
                />
                {passwordErrors.currentPassword && (
                  <ArgonTypography color="error" fontSize="13px">
                    {passwordErrors.currentPassword}
                  </ArgonTypography>
                )}
              </Grid>
              <Grid item xs={6.1}>
                  <ArgonTypography variant="body2" fontWeight="900" color="text" mb={1}>
                  Nhập mật khẩu mới
                </ArgonTypography>
                <ArgonInput
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  error={!!passwordErrors.newPassword}
                />
                {passwordErrors.newPassword && (
                  <ArgonTypography color="error" fontSize="13px">
                    {passwordErrors.newPassword}
                  </ArgonTypography>
                )}
              </Grid>
              <Grid item xs={6.1}>
                <ArgonTypography variant="body2" fontWeight="900" color="text" mb={1}>
                Nhập lại mật khẩu mới
              </ArgonTypography>
                <ArgonInput
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  error={!!passwordErrors.confirmPassword}
                />
                 {passwordErrors.confirmPassword && (
                  <ArgonTypography color="error" fontSize="13px">
                    {passwordErrors.confirmPassword}
                  </ArgonTypography>
                )}
              </Grid>

              <Grid item xs={12} mt={1.5}>
                <Button
                  variant="contained"
                  sx={{ mr: 2, color: "#fff" }}
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: "#5669FF",
                    border: "1px solid #5669FF",
                  }}
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordErrors({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Quay lại
                </Button>
              </Grid>
            </Grid>
          )}
        </Card>
      </ArgonBox>

      {/* Dialog xem ảnh */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm">
        <DialogContent sx={{ position: "relative", p: 2 }}>
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={previewUrl || profile.picUrl}
            alt="preview"
            style={{ width: "100%", borderRadius: 8 }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={successDialogOpen}
        onClose={() => {}}
        disableEscapeKeyDown
        disableBackdropClick // với MUI v4, nếu v5 thì dùng `onClose` custom
        PaperProps={{
          sx: {
            width: "30vw",   // 50% chiều rộng màn hình
            height: "30vh",  // 50% chiều cao màn hình
            borderRadius: 3,
          },
        }}
      >
        <DialogContent sx={{ textAlign: "center", p: 3, }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={2}
            mt={3}
          >
            <Typography variant="h3" gutterBottom>
              Đổi mật khẩu thành công!
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, backgroundColor: "#5669FF", color: "#fff" }}
              onClick={() => {
                setSuccessDialogOpen(false);
                handleLogout();
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default ProfileOrganizer;
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";

// Layout & Components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ArgonBox from "components/ArgonBox";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import CustomTextField from "layouts/dashboard/organizer/OrganizerCreateNewEvent/components/CustomTextField";

// API & Redux
import { useSelector } from "react-redux";
import userApi from "api/userApi";

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
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false); // dialog preview ảnh
  const [nameError, setNameError] = useState("");


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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userApi.getUserById(userId);
        const user = response.data.data;
        setProfile(user);
        setEditedName(user.username || "");
        setPreviewUrl(user.picUrl);
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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

        console.log("dữ liệu gửi đi: ",body)
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

  if (!profile) return null;

  return (
  
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox mt={3}>
        <Card sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3} textAlign="center">
              <Avatar
                src={previewUrl || profile.picUrl}
                alt="Avatar"
                sx={{ width: 120, height: 120, mx: "auto", mb: 1,border: "2px solid",  borderColor: "primary.main", borderRadius: "50%",  }}
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
               <Grid item xs={12} sm={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">THÔNG TIN NHÀ TỔ CHỨC</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Email liên hệ"
                    name="email"
                    value={profile.email}
                    fullWidth
                    disabled
                  />
                </Grid>
                  </Grid>
                   <Grid container spacing={2} mt={1.5}>
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
                  </Grid>
                  <Grid item xs={12} mt={1.2}>
                          {editMode ? (
                          <>
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
                          mr: 3
                        }}
                          onClick={handleSave}
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
                          "&:hover": {
                            backgroundColor: "#5669FF",
                            color: "#fff",
                          },
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
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                </Grid>
                </Grid>
            </Grid>      
        </Card>      
      </ArgonBox>   
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
    </DashboardLayout>
  );
};

export default ProfileOrganizer;

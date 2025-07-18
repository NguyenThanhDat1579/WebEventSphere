import React, { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import ArgonBox from "components/ArgonBox";
import Footer from "examples/Footer";
import CustomTextField from "layouts/dashboard/organizer/OrganizerCreateNewEvent/components/CustomTextField";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSelector } from "react-redux";
import userApi from "api/userApi";

// ✅ Default ban đầu để tránh crash trước khi API trả về
const defaultInfo = {
  username: "",
  email: "",
  phoneNumber: "",
  picUrl: "",
  address: "",
  website: "",
  description: "",
};

function ProfileOrganizer() {
  const userId = useSelector((state) => state.auth.id);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(defaultInfo);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await userApi.getUserById(userId);
        if (res.data.status) {
          const data = res.data.data;
          setUserData(data);
          setFormData({
            username: data.username || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            picUrl: data.picUrl || "",
            address: data.address || "",
            website: data.website || "",
            description: data.description || "",
          });
        } else {
          console.error("Lỗi lấy user:", res.data.message);
        }
      } catch (error) {
        console.error("Lỗi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <p>Đang tải thông tin...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox mt={3}>
        <Card sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3} textAlign="center">
              <Avatar
                src={formData.picUrl}
                alt="Avatar"
                sx={{ width: 120, height: 120, mx: "auto", mb: 1 }}
              />
              {editing && (
                <Button variant="outlined" size="small">
                  Đổi ảnh đại diện
                </Button>
              )}
            </Grid>

            <Grid item xs={12} sm={9}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">THÔNG TIN NHÀ TỔ CHỨC</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Tên nhà tổ chức"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Email liên hệ"
                    name="email"
                    value={formData.email}
                    fullWidth
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="Số điện thoại"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>

                {/* <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label="📍 Địa chỉ trụ sở"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    label="🌐 Website / Mạng xã hội"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    fullWidth
                    disabled={!editing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomTextField
                    label="📝 Mô tả tổ chức"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    disabled={!editing}
                  />
                </Grid> */}

                <Grid item xs={12} textAlign="right">
                  {!editing ? (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing(true)}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<SaveIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => setEditing(false)}
                      >
                        Lưu
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          // reset lại dữ liệu từ userData
                          setFormData({
                            username: userData.username || "",
                            email: userData.email || "",
                            phoneNumber: userData.phoneNumber || "",
                            picUrl: userData.picUrl || "",
                            address: userData.address || "",
                            website: userData.website || "",
                            description: userData.description || "",
                          });
                          setEditing(false);
                        }}
                      >
                        Hủy
                      </Button>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default ProfileOrganizer;

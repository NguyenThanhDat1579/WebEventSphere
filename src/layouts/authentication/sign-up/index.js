// react-router-dom components
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import Socials from "layouts/authentication/components/Socials";
import Separator from "layouts/authentication/components/Separator";

// API
import authApi from "api/utils/authApi";

// React
import { useState } from "react";
import { Typography } from "@mui/material";
import bgImage from '../../../assets/images/imgAuthetication.png'
import avImage from '../../../assets/images/avImg.jpg'

function Cover() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let tempErrors = {};

    if (!username.trim()) {
      tempErrors.username = "Vui lòng nhập tên";
    } else if (username.length < 3 || username.length > 50) {
      tempErrors.username = "Tên người dùng phải từ 3 đến 50 ký tự";
    } else if (!/^[a-zA-ZÀ-ỹ\d_ ]+$/.test(username)) {
      tempErrors.username = "Tên người dùng không được chứa kí tự đặc biệt";
    }

    if (!email.trim()) {
      tempErrors.email = "Vui lòng nhập Email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Email không hợp lệ";
    }

    if (!password.trim()) {
      tempErrors.password = "Vui lòng nhập Mật khẩu";
    } else if (password.length < 6 || password.length > 28) {
      tempErrors.password = "Mật khẩu phải có từ 6 đến 28 ký tự";
    } else if (!/[A-Z]/.test(password)) {
      tempErrors.password = "Mật khẩu phải chứa ít nhất một chữ cái in hoa";
    } else if (!/[a-z]/.test(password)) {
      tempErrors.password = "Mật khẩu phải chứa ít nhất một chữ cái in thường";
    } else if (!/[0-9]/.test(password)) {
      tempErrors.password = "Mật khẩu phải chứa ít nhất một chữ số";
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      tempErrors.password = "Mật khẩu phải chứa ít nhất một ký tự đặc biệt";
    }

    if (!confirmPassword.trim()) {
      tempErrors.confirmPassword = "Vui lòng nhập Xác nhận mật khẩu";
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
     const body = {
        username: username.trim(),
        email: email.trim(),
        password,
        role: 2,
      };
      console.log("Body", body)
      const res = await authApi.register(body);
      
      if (res.status) {
           navigate("/authentication/verify-otp-organizer", { state: { email } });
      } else {
        setErrors(prev => ({ ...prev, email: res.message || "Email đã tồn tại" }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, email: "Lỗi hệ thống. Vui lòng thử lại." }));
    } finally {
      setLoading(false);
    }
  };

  return (
  <CoverLayout
    image={bgImage}
    imgPosition="top"
  >
    <Card>
      <ArgonBox pt={4} pb={4} px={4}>
        {/* ✅ Logo và tiêu đề */}
        <ArgonBox textAlign="center" mb={3}>
          <img
            src={avImage}
            alt="Logo"
            style={{ width: "40%", marginBottom: 8 }}
          />
          <ArgonTypography variant="h4" fontWeight="bold" style={{ color: "#5669FF" }}>
            Đăng ký
          </ArgonTypography>
          <Typography variant="body2" color="textSecondary" mb={1} textAlign="center">
          với tư cách nhà tổ chức
        </Typography>
        </ArgonBox>

        <ArgonBox component="form" role="form">
          <ArgonBox mb={2}>
            <ArgonInput
              placeholder="Tên người dùng"
              value={username}
              onChange={e => setUsername(e.target.value)}
              error={!!errors.username}
            />
            {errors.username && (
              <ArgonTypography color="error" fontSize="13px">
                {errors.username}
              </ArgonTypography>
            )}
          </ArgonBox>

          <ArgonBox mb={2}>
            <ArgonInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={!!errors.email}
            />
            {errors.email && (
              <ArgonTypography color="error" fontSize="13px">
                {errors.email}
              </ArgonTypography>
            )}
          </ArgonBox>

          <ArgonBox mb={2}>
            <ArgonInput
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={!!errors.password}
            />
            {errors.password && (
              <ArgonTypography color="error" fontSize="13px">
                {errors.password}
              </ArgonTypography>
            )}
          </ArgonBox>

          <ArgonBox mb={2}>
            <ArgonInput
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <ArgonTypography color="error" fontSize="13px">
                {errors.confirmPassword}
              </ArgonTypography>
            )}
          </ArgonBox>

          <ArgonBox mt={4} mb={1}>
            <ArgonButton
              color="info"
                size="large"
              variant="gradient"
              fullWidth
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </ArgonButton>
          </ArgonBox>

          <ArgonBox mt={2} textAlign="center">
            <ArgonTypography variant="button" color="text" fontWeight="regular"  style={{ textTransform: "none" }}>
              Đã có tài khoản?{' '}
              <ArgonTypography
                component={Link}
                to="/authentication/sign-in"
                variant="button"
                color="dark"
                fontWeight="bold"
                style={{ color: "#5669FF", textTransform: "none" }}
              >
                Đăng nhập ngay
              </ArgonTypography>
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </ArgonBox>
    </Card>
  </CoverLayout>
);

}

export default Cover;

import React, { useState } from 'react';
import { Box, Paper, Typography, Switch, Card } from '@mui/material';
import ArgonBox from 'components/ArgonBox';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import ArgonTypography from 'components/ArgonTypography';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import authApi from 'api/utils/authApi';
import { saveTokens } from 'api/token/authTokens';
import { setUserData } from '../../../redux/store/slices/authSlice';
import CoverLayout from '../components/CoverLayout';

function ModernLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignIn = async (e) => {
  e.preventDefault();
  setErrors({});
  setErrorMessage('');
  setIsLoading(true);

  const newErrors = {};
  if (!email) newErrors.email = 'Vui lòng nhập Email';
  if (!password) newErrors.password = 'Vui lòng nhập Mật khẩu';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setIsLoading(false);
    return;
  }

   if (email === "admin" && password === "admin") {
      console.log("Admin đăng nhập");
      dispatch(setUserData({ role: 1 })); // Lưu role = 1
      navigate("/dashboard-admin");
      return; // Dừng hàm
    }

    try {
      const res = await authApi.login(email, password);
      const userData = res.data.data;

      if (userData && userData.role === 2) {
        console.log("Organizer đăng nhập", userData);

        // ✅ In token ra để kiểm tra
        console.log("Access Token:", userData.token);
        console.log("Refresh Token:", userData.refreshToken);

        // ✅ Lưu token KHÔNG cần await
        saveTokens(userData.token, userData.refreshToken);

        dispatch(setUserData(userData));
        localStorage.setItem("userData", JSON.stringify(userData));
        navigate("/dashboard-organizer");
      } else {
        console.log("Đăng nhập không phải organizer", userData);
        setErrors({
        email: ' ',
        password: 'Tài khoản không có quyền truy cập.',
      });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setErrors({
        email: ' ',
        password: 'Email hoặc mật khẩu không chính xác.',
      });


    } finally {
    setIsLoading(false);}
};

  
const bgImage =
  "https://res.cloudinary.com/deoqppiun/image/upload/v1752238173/images_lwwgko.png";

  return (
    <CoverLayout
    image={bgImage}
    imgPosition="top"
  >
    <Card>
      <ArgonBox pt={4} pb={4} px={4}>
        <ArgonBox textAlign="center" mb={3}>
          <img
            src="https://res.cloudinary.com/deoqppiun/image/upload/v1752066762/Logo_det6xk.jpg" // 👉 thay bằng logo của bạn
            alt="Logo"
            style={{ width: "40%", marginBottom: 8 }}
          />
          <ArgonTypography variant="h4" fontWeight="bold" style={{ color: "#5669FF" }}>
            Đăng nhập
          </ArgonTypography>
          <Typography variant="body2" color="textSecondary">
            Chào mừng bạn trở lại!
          </Typography>
        </ArgonBox>
        
        <ArgonBox component="form" role="form">
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
        </ArgonBox>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
               {/* <Switch
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
                 sx={{
                   '& .MuiSwitch-switchBase.Mui-checked': { color: '#5669FF' },
                   '& .MuiSwitch-track': { backgroundColor: rememberMe ? '#5669FF' : '#ccc' },
                 }}
               />
               <ArgonTypography variant="button" sx={{ userSelect: 'none', ml: 1 }}>
                 Ghi nhớ tài khoản
               </ArgonTypography> */}
             </Box>         
             <ArgonTypography
                component={Link}
                to="/authentication/forget-password"
                variant="button"
                color="dark"
                fontWeight="bold"
                style={{ color: "#5669FF", textTransform: "none" }}
              >
                Quên mật khẩu?
              </ArgonTypography>
        </ArgonBox>
          <ArgonBox mt={3} mb={1}>
            <ArgonButton
              color="info"
                size="large"
              variant="gradient"
              fullWidth
              disabled={isLoading}
               onClick={handleSignIn}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </ArgonButton>
          </ArgonBox>

          <ArgonBox mt={2} textAlign="center">
            <ArgonTypography variant="button" color="text" fontWeight="regular"  style={{ textTransform: "none" }}>
             Chưa có tài khoản?{' '}
              <ArgonTypography
                component={Link}
                to="/authentication/sign-up"
                variant="button"
                color="dark"
                fontWeight="bold"
                style={{ color: "#5669FF", textTransform: "none" }}
              >
                Đăng ký
              </ArgonTypography>
            </ArgonTypography>
          </ArgonBox>

      </ArgonBox>
    </Card>
    </CoverLayout>
  );
}

export default ModernLoginPage;

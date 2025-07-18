import React, { useState } from 'react';
import { Box, Card, Paper, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import ArgonTypography from 'components/ArgonTypography';
import authApi from 'api/utils/authApi';
import CoverLayout from '../components/CoverLayout';
import ArgonBox from 'components/ArgonBox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
const ResetPasswordOrganizer = () => {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    if (pwd.length < 6 || pwd.length > 28)
      return 'Mật khẩu phải có từ 6 đến 28 ký tự.';
    if (!/[A-Z]/.test(pwd))
      return 'Mật khẩu phải chứa ít nhất một chữ cái in hoa.';
    if (!/[a-z]/.test(pwd))
      return 'Mật khẩu phải chứa ít nhất một chữ cái in thường.';
    if (!/[0-9]/.test(pwd))
      return 'Mật khẩu phải chứa ít nhất một chữ số.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      return 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt.';
    return '';
  };

  const handleReset = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    const validationMsg = validatePassword(password);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(email, password); // bạn cần tạo hàm này
      console.log("res", res)
      if (res.data.message === 'Đặt lại mật khẩu thành công') {
        navigate('/authentication/sign-in');
      } else {
        setError(res.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const bgImage =
  "https://res.cloudinary.com/deoqppiun/image/upload/v1752238173/images_lwwgko.png";

  return (
      <CoverLayout
        image={bgImage}
        imgPosition="top"
      >
      <Card>
      <ArgonBox  pt={4} pb={4} px={4}>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <ArrowBackIosNewIcon
                sx={{ cursor: 'pointer', mr: 1, }}
                onClick={() => navigate(-1)}
            />
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#5669FF" }}>Đặt lại mật khẩu</Typography>
            <Typography>
              
            </Typography>
        </Box>
        <ArgonInput
                  placeholder="Mật khẩu mới"
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
        />
        <ArgonInput
          placeholder="Nhập lại mật khẩu"
          fullWidth
          sx={{ mt: 2 }}
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
        />
        {error && (
          <ArgonTypography color="error" mt={2}>
            {error}
          </ArgonTypography>
        )}
        <Box display="flex" justifyContent="center">
              <ArgonButton
                    fullWidth
                    onClick={handleReset}
                    disabled={loading}
                    color="info"
                    size="large"
                    variant="gradient"
                    sx={{
                      mt: 3,
                      width: "45%",
                      p: 1,
                      backgroundColor: '#5669FF',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#4b5bd8',
                        color: '#fff',
                      },
                    }}
                  >
                   {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </ArgonButton>
        </Box>
      </ArgonBox>
    </Card>  
  </CoverLayout>
  ) 
};

export default ResetPasswordOrganizer;

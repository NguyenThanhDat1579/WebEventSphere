import React, { useState } from 'react';
import { Box, Typography, Paper, Card } from '@mui/material';
import ArgonBox from 'components/ArgonBox';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import ArgonTypography from 'components/ArgonTypography';
import authApi from 'api/utils/authApi';
import { useNavigate } from 'react-router-dom';
import CoverLayout from '../components/CoverLayout';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
const ForgetPasswordOrganizer = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
  setError('');
  
  // ✅ Kiểm tra nếu email rỗng
  if (!email.trim()) {
    setError('Vui lòng nhập email.');
    return;
  }

  // ✅ Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Email không hợp lệ.');
    return;
  }

  setLoading(true);
  try {
    const res = await authApi.forgotPasswordRequest(email); // Gửi email lên server
    if (res.status) {
        console.log("Email nhận được:", email)
      navigate('/authentication/otp-forget-password', { state: { email } });
    } else {
      setError('Email không tồn tại hoặc không đúng.');
    }
  } catch (err) {
    console.error("Lỗi gửi yêu cầu quên mật khẩu:", err);
    if (err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    }
  }
  setLoading(false);
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

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <ArrowBackIosNewIcon
                      sx={{ cursor: 'pointer', mr: 1, }}
                      onClick={() => navigate(-1)}
                  />
                 <Typography variant="h5" fontWeight="bold" sx={{ color: "#5669FF" }}>Quên mật khẩu</Typography>
                  <Typography>
                    
                  </Typography>
              </Box>
                 <Typography variant="body2" mb={1} textAlign="center">
                          Nhập email để nhận mã OTP xác nhận
                  </Typography>
              <ArgonInput
                    placeholder="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!error}
                  />
                    {error && (
                    <ArgonTypography color="error" mt={1} fontSize="13px">
                        {error}
                    </ArgonTypography>
                    )}
                  <Box display="flex" justifyContent="center">
                    <ArgonButton
                          fullWidth
                          onClick={handleSubmit}
                          disabled={loading}
                          color="info"
                          size="large"
                          variant="gradient"
                          sx={{
                            mt: 3,
                            width: "40%",
                            p: 1,
                            backgroundColor: '#5669FF',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: '#4b5bd8',
                              color: '#fff',
                            },
                          }}
                        >
                          {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </ArgonButton>
              </Box>
      </ArgonBox>
    </Card>  
  </CoverLayout>
   
  );
};

export default ForgetPasswordOrganizer;

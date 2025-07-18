import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import ArgonInput from 'components/ArgonInput';
import ArgonButton from 'components/ArgonButton';
import ArgonTypography from 'components/ArgonTypography';
import authApi from 'api/utils/authApi';
import CoverLayout from '../components/CoverLayout';
import ArgonBox from 'components/ArgonBox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const OtpForgetPasswordOrganizer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [errorIndices, setErrorIndices] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef([]);

  // 🕒 Đếm ngược
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    setError('');
    setErrorIndices([]);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtpDigits(newOtp);
      newOtp.forEach((digit, i) => {
        if (inputsRef.current[i]) {
          inputsRef.current[i].value = digit;
        }
      });
      inputsRef.current[5]?.focus();
      setError('');
      setErrorIndices([]);
    }
  };

  const handleVerify = async () => {
    setError('');
    setErrorIndices([]);
    const otp = otpDigits.join('');
    if (otp.length < 6 || otpDigits.some(d => d === '')) {
      setError('Vui lòng nhập đầy đủ 6 số OTP.');
      const missing = otpDigits.map((d, i) => (!d ? i : null)).filter(i => i !== null);
      setErrorIndices(missing);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyForgotOtp(email, otp);
      if (res.data.message === 'OTP hợp lệ. Bạn có thể đổi mật khẩu.') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/authentication/reset-password', { state: { email } });
        }, 1500);
      } else {
        setError(res.message || 'Mã OTP không hợp lệ.');
      }
    } catch (err) {
      setError('Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      const res = await authApi.resendOtp(email);
      if (res.status) {
        setError('');
        setOtpDigits(['', '', '', '', '', '']);
        setTimer(60);
      } else {
        setError('Không thể gửi lại mã OTP.');
      }
    } catch (err) {
      setError('Lỗi khi gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  const bgImage = "https://res.cloudinary.com/deoqppiun/image/upload/v1752238173/images_lwwgko.png";

  return (
    <CoverLayout image={bgImage} imgPosition="top">
      <Card>
        <ArgonBox pt={4} pb={4} px={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <ArrowBackIosNewIcon
              sx={{ cursor: 'pointer', mr: 1 }}
              onClick={() => navigate(-1)}
            />
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#5669FF" }}>
              Xác thực OTP
            </Typography>
            <Typography></Typography>
          </Box>

          <Typography variant="body2" mb={1} textAlign="center">
            Nhập mã xác nhận đã gửi đến
          </Typography>
          <Typography
            variant="body2"
            mb={3}
            fontWeight="bold"
            textAlign="center"
            sx={{ wordBreak: 'break-word' }}
          >
            {email}
          </Typography>

          <Box
            display="flex"
            justifyContent="center"
            gap={1}
            mb={2}
            onPaste={handlePaste}
          >
            {otpDigits.map((digit, index) => (
              <ArgonInput
                key={index}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                    inputsRef.current[index - 1]?.focus();
                  }
                }}
                onFocus={(e) => e.target.select()}
                inputRef={(el) => (inputsRef.current[index] = el)}
                maxLength={1}
                sx={{
                  width: 60,
                  height: 60,
                  fontSize: '20px',
                  p: 1,
                  border: `2px solid ${errorIndices.includes(index) ? '#f44336' : '#ccc'}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
                inputProps={{
                  style: {
                    textAlign: 'center',
                    fontSize: '20px',
                    padding: 0,
                    height: '100%',
                    width: '100%',
                  },
                }}
              />
            ))}
          </Box>

          {error && (
            <ArgonTypography color="error" mt={2} fontSize="13px" textAlign="center">
              {error}
            </ArgonTypography>
          )}
          {success && (
            <ArgonTypography color="success" mt={2} fontSize="13px" textAlign="center">
              Xác minh thành công!
            </ArgonTypography>
          )}

          <Box display="flex" justifyContent="center">
            <ArgonButton
              fullWidth
              onClick={handleVerify}
              disabled={loading}
              color="info"
              size="large"
              variant="gradient"
              sx={{
                mt: 3,
                width: "40%",
                p: 1.5,
                backgroundColor: '#5669FF',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#4b5bd8',
                  color: '#fff',
                },
              }}
            >
              {loading ? 'Đang xác minh...' : 'Xác minh'}
            </ArgonButton>
          </Box>

          <Typography variant="body2" textAlign="center" mt={1}>
            {timer > 0 ? (
              <>Bạn có thể gửi lại mã sau <strong>{timer}s</strong></>
            ) : (
              <ArgonButton
                size="small"
                color="secondary"
                onClick={handleResendOTP}
                disabled={isResending}
                sx={{ mt: 1 }}
              >
                {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </ArgonButton>
            )}
          </Typography>
        </ArgonBox>
      </Card>
    </CoverLayout>
  );
};

export default OtpForgetPasswordOrganizer;

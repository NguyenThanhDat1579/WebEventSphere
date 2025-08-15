import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import bgImage from "../../assets/images/imgAuthetication.png";
import WelcomeCoverLayout from "./components/WelcomeCoverLayout";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <WelcomeCoverLayout bgImage={bgImage}>
      <Box
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "32px",
          p: { xs: "1.5rem", sm: "2.5rem" },
          maxWidth: 560,
          width: "100%",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          animation: "slideIn 0.8s ease-out",
          "@keyframes slideIn": {
            from: { opacity: 0, transform: "translateY(40px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes fadeInUp": {
            from: { opacity: 0, transform: "translateY(20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes pulse": {
            "0%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(86, 105, 255, 0.3)" },
            "50%": { transform: "scale(1.05)", boxShadow: "0 0 20px rgba(86, 105, 255, 0.5)" },
            "100%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(86, 105, 255, 0.3)" },
          },
          "@keyframes gradientMove": {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
          },
          "@keyframes rotateIn": {
            from: { opacity: 0, transform: "rotate(-20deg) scale(0.8)" },
            to: { opacity: 1, transform: "rotate(0deg) scale(1)" },
          },
        }}
      >
        {/* Logo với animation rotateIn */}
        <Box
          component="img"
          src="/icon.png"
          alt="EventSphere Logo"
          sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            mb: 2,
            borderRadius: "50%",
            animation: "rotateIn 0.8s ease-out forwards",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.1) rotate(5deg)" },
          }}
        />

        {/* Tiêu đề với gradient di chuyển và fadeInUp */}
        <Typography
          variant="h4"
          sx={{
            fontSize: "2rem",
            fontWeight: 700,
            mb: 2,
            lineHeight: 1.3,
            background: "linear-gradient(90deg, #5669ff, #00f8ff, #5669ff)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            animation: "fadeInUp 0.8s ease-out 0.2s forwards, gradientMove 3s linear infinite",
            opacity: 0,
          }}
        >
          Chào mừng đến với EventSphere
        </Typography>

        {/* Mô tả với fadeInUp delay lớn hơn */}
        <Typography
          variant="body1"
          sx={{
            mb: { xs: 6, sm: 4 }, // mobile tăng khoảng cách
            fontSize: { xs: "1.05rem", sm: "1rem" }, // chữ to hơn trên mobile
            color: "#4b5563",
            lineHeight: 1.6,
            animation: "fadeInUp 0.8s ease-out 0.4s forwards",
            opacity: 0,
            textAlign: "center", // mobile cân giữa cho đẹp
        }}
        >
          Khám phá và đặt vé cho những sự kiện hấp dẫn nhất, mới nhất
          trên ứng dụng di động!
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          {/* Nút Tải ứng dụng với pulse animation và hover nâng cao */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              // Link tải trực tiếp APK trên Google Drive
              window.location.href =
                "https://drive.google.com/uc?export=download&id=1B4Uu-mxZrgA-hF_fwijOwtJXKaQ1j16E";
            }}
             sx={{
                py: { xs: 2, sm: 1.5 }, // tăng padding trên mobile
                fontSize: { xs: "1.1rem", sm: "1rem" }, // chữ to hơn
                mb: { xs: 4, sm: 2 }, // tăng margin bottom trên mobile
                borderRadius: "12px",
                background: "linear-gradient(135deg, #5669ff 0%, #7c89ff 100%)",
                boxShadow: "0 4px 12px rgba(86, 105, 255, 0.3)",
                fontWeight: 600,
                color: "#fff",
                animation: "fadeInUp 0.8s ease-out 0.6s forwards, pulse 2s infinite",
                opacity: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                transform: "translateY(-4px) scale(1.02)",
                boxShadow: "0 8px 24px rgba(86, 105, 255, 0.5)",
                background: "linear-gradient(135deg, #7c89ff 0%, #5669ff 100%)",
                },
            }}
          >
            Tải ứng dụng
          </Button>

          {/* Đăng nhập và Đăng ký với fadeInUp và hover */}
          <Box
            sx={{
                display: { xs: "none", sm: "grid" },
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            {/* Đăng nhập */}
            <Button
              variant="outlined"
              sx={{
                borderColor: "#5669ff",
                color: "#5669ff",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 600,
                animation: "fadeInUp 0.8s ease-out 0.8s forwards",
                opacity: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#5669ff",
                  color: "#fff",
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(86, 105, 255, 0.4)",
                },
              }}
              onClick={() => navigate("/authentication/sign-in")}
            >
              Đăng nhập
            </Button>

            {/* Đăng ký */}
            <Button
              variant="outlined"
              sx={{
                borderColor: "#5669ff",
                color: "#5669ff",
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 600,
                animation: "fadeInUp 0.8s ease-out 0.8s forwards",
                opacity: 0,
                transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#5669ff",
                  color: "#fff",
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 20px rgba(86, 105, 255, 0.4)",
                },
              }}
              onClick={() => navigate("/authentication/sign-up")}
            >
              Đăng ký
            </Button>
          </Box>
        </Box>
      </Box>
    </WelcomeCoverLayout>
  );
}
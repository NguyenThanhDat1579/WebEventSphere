import { useState } from "react";
import authApi from "../../../api/utils/authApi";
import { saveTokens } from "../../../api/token/authTokens.js";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../redux/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// @mui material components
import Switch from "@mui/material/Switch";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import ArgonButton from "components/ArgonButton";

// Authentication layout components
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";

// Image
const bgImage =
  "https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg";

function Illustration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Xóa lỗi cũ

    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (email === "admin" && password === "admin") {
      dispatch(setUserData({ role: 1 }));
      navigate("/dashboard-admin");
      return;
    }

    try {
      const res = await authApi.login(email, password);
      const userData = res.data.data;

      if (userData && userData.role === 2) {
        saveTokens(userData.token, userData.refreshToken);
        dispatch(setUserData(userData));
        localStorage.setItem("userData", JSON.stringify(userData));
        navigate("/dashboard-organizer");
      } else {
        setErrorMessage("Tài khoản không có quyền truy cập Organizer.");
      }
    } catch (error) {
      // Xử lý lỗi từ server hoặc lỗi mạng
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      }
      console.error("Lỗi đăng nhập:", error);
    }
  };

  return (
    <IllustrationLayout
      title="Đăng nhập"
      description=""
      illustration={{ image: bgImage }}
    >
      <ArgonBox component="form" role="form">
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Nhập Email"
            size="large"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Nhập mật khẩu"
            size="large"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>

        {/* Hiển thị thông báo lỗi nếu có */}
        {errorMessage && (
          <ArgonBox mb={2}>
            <ArgonTypography color="error" fontSize="14px">
              {errorMessage}
            </ArgonTypography>
          </ArgonBox>
        )}

        <ArgonBox mt={4} mb={1}>
          <ArgonButton
            color="info"
            size="large"
            variant="gradient"
            fullWidth
            onClick={handleSignIn}
          >
            Đăng nhập
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default Illustration;

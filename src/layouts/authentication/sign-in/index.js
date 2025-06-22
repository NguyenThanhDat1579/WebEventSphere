import { useState } from "react";
import authApi from "../../../api/utils/authApi";
import { saveTokens } from "../../../api/token/authTokens.js";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../redux/store/slices/authSlice";
import { useNavigate } from "react-router-dom";
// react-router-dom components
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
  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleSignIn = async (e) => {
    e.preventDefault();

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
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
    }
  };
  return (
    <IllustrationLayout
      title="Đăng nhập"
      description=""
      illustration={{
        image: bgImage,
        // title: '"Attention is the new currency"',
        // description:
        //   "The more effortless the writing looks, the more effort the writer actually put into the process.",
      }}
    >
      <ArgonBox component="form" role="form">
        <ArgonBox mb={2}>
          <ArgonInput
            type="email"
            placeholder="Nhập Email"
            size="large"
            onChange={(e) => setEmail(e.target.value)}
          />
        </ArgonBox>
        <ArgonBox mb={2}>
          <ArgonInput
            type="password"
            placeholder="Nhập mật khẩu"
            size="large"
            onChange={(e) => setPassword(e.target.value)}
          />
        </ArgonBox>
        {/* <ArgonBox display="flex" alignItems="center">
          <Switch checked={rememberMe} onChange={handleSetRememberMe} />
          <ArgonTypography
            variant="button"
            fontWeight="regular"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none" }}
          >
            &nbsp;&nbsp;Ghi nhớ tài khoản
          </ArgonTypography>
        </ArgonBox> */}
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
        <ArgonBox mt={3} textAlign="center">
          {/* <ArgonTypography variant="button" color="text" fontWeight="regular">
            Bạn có tài khoản chưa?{" "}
            <ArgonTypography
              component={Link}
              to="/authentication/sign-up"
              variant="button"
              color="info"
              fontWeight="medium"
            >
              Sign up
            </ArgonTypography>
          </ArgonTypography> */}
        </ArgonBox>
      </ArgonBox>
    </IllustrationLayout>
  );
}

export default Illustration;

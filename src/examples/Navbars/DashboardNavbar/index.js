import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUserData } from "../../../redux/store/slices/authSlice"; 

// prop-types
import PropTypes from "prop-types";

// @mui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";

// Argon components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Custom styles
import { navbar, navbarContainer, navbarRow, navbarIconButton, navbarDesktopMenu } from "examples/Navbars/DashboardNavbar/styles";

// Argon context
import { useArgonController, setMiniSidenav } from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, fixedNavbar } = controller;
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const dispatch1 = useDispatch();

  const handleLogout = () => {
    // Clear Redux state
    dispatch1(clearUserData());
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userData");

    navigate("/authentication/sign-in");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");
  }, [fixedNavbar]);

  const handleMiniSidenavClick = () => setMiniSidenav(dispatch, !miniSidenav);

  return (
    <>
      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) => navbar(theme, { absolute, light })}
      >
        <Toolbar sx={(theme) => navbarContainer(theme, { navbarType })}>
          <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
            <Icon fontSize="medium" sx={{ ...navbarDesktopMenu, color: "#fff" }} onClick={handleMiniSidenavClick}>
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </ArgonBox>
          {!isMini && (
            <ArgonBox sx={(theme) => navbarRow(theme, { isMini })}>
              <ArgonBox color={light ? "white" : "inherit"}>
                <IconButton
                  sx={navbarIconButton}
                  size="small"
                  onClick={() => setOpenLogoutDialog(true)}
                >
                  <ArgonTypography variant="button" fontWeight="medium" sx={{ color: "#fff" }}>
                    Đăng xuất
                  </ArgonTypography>
                  <Icon sx={{ color: "#fff", ml: 1 }}>settings</Icon>
                </IconButton>
              </ArgonBox>
            </ArgonBox>
          )}
        </Toolbar>
      </AppBar>

      {/* Dialog xác nhận logout */}
        <Dialog
          open={openLogoutDialog}
          onClose={() => setOpenLogoutDialog(false)}
          maxWidth="xs" // Tăng kích thước dialog
          fullWidth
        >
          <DialogContent>
            <DialogContentText
              sx={{ fontSize: "1.2rem", color: "#000", textAlign: "center", fontWeight: "600", pt: 1 }} // chữ màu đen, lớn hơn
            >
              Bạn có chắc chắn muốn đăng xuất không?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
            <Button
              onClick={() => setOpenLogoutDialog(false)}
              color="primary"
              sx={{ fontSize: "1rem", minWidth: "100px" }}
            >
              Huỷ
            </Button>
            <Button
              onClick={handleLogout}
              variant="contained"
              sx={{ 
                fontSize: "1rem", 
                minWidth: "100px", 
                color: "#fff", // chữ màu trắng
                backgroundColor: "#5669FF", // màu nút tùy ý
                "&:hover": { backgroundColor: "#5669FF" }
              }}
            >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: true,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;

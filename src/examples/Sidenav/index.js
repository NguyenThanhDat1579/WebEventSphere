import { useEffect } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import SidenavItem from "examples/Sidenav/SidenavItem";
import SidenavFooter from "examples/Sidenav/SidenavFooter";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import { useArgonController, setMiniSidenav } from "context";
import { useSelector } from "react-redux";

function Sidenav({ color, brand, brandNameImage, routes, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, darkSidenav, layout } = controller;
  const location = useLocation();
  const { pathname } = location;
  const currentPath = pathname;
  const navigate = useNavigate();

  const role = useSelector((state) => state.auth?.role);

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  const renderRoutes = routes.map(({ type, name, icon, title, titleImage, key, href, route }) => {
    let returnValue;

    if (type === "route") {
      if (href) {
        returnValue = (
          <Link href={href} key={key} target="_blank" rel="noreferrer">
            <SidenavItem
              name={name}
              icon={icon}
              active={currentPath === route}
              noCollapse={false}
            />
          </Link>
        );
      } else {
        returnValue = (
          <NavLink to={route} key={key}>
            <SidenavItem name={name} icon={icon} active={currentPath === route} />
          </NavLink>
        );
      }
    } else if (type === "title") {
      returnValue = (
        <ArgonBox
          key={key}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            pl: 3,
            mt: 2,
            mb: 1,
          }}
        >
          {titleImage && (
            <img
              src={titleImage}
              alt="section"
              style={{ height: "20px", objectFit: "contain" }}
            />
          )}
        </ArgonBox>
      );
    } else if (type === "divider") {
      returnValue = <Divider key={key} light={darkSidenav} />;
    }

    return returnValue;
  });

  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ darkSidenav, miniSidenav, layout }}>
      <ArgonBox pt={3} pb={1} px={4} textAlign="center">
        <ArgonBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <ArgonTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </ArgonTypography>
        </ArgonBox>
        <ArgonBox
          component="div"
         onClick={() => {
            if (role === 1) {
              navigate("/dashboard-admin");
            } else if (role === 2) {
              navigate("/dashboard-organizer");
            } else {
              navigate("/dashboard");
            }
            window.location.reload(); // reload cho tất cả role
          }}
          display="flex"
          alignItems="center"
          sx={{ cursor: "pointer" }}
        >
          {brand && (
            <ArgonBox component="img" src={brand} alt="Argon Logo" width="2rem" mr={0.25} />
          )}
          {brandNameImage && (
          <ArgonBox
            width="10%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            ml={7}
          >
            <ArgonBox
              component="img"
              src={brandNameImage}
              alt="Brand Logo"
              height="28px"
              sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
            />
          </ArgonBox>
        )}

        </ArgonBox>
      </ArgonBox>
      <Divider light={darkSidenav} />
      <List>{renderRoutes}</List>

      <ArgonBox pt={1} mt="auto" mb={2} mx={2}>
        <SidenavFooter />
      </ArgonBox>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = {
  color: "info",
  brand: "",
  brandNameImage: "",
};

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandNameImage: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;

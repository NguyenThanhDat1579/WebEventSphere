import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import SignIn from "../src/layouts/authentication/sign-in";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

import ArgonBox from "components/ArgonBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

import routes from "routes";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../src/redux/store/slices/authSlice";
import { useArgonController, setMiniSidenav, setOpenConfigurator } from "context";

import brand from "assets/images/logo-ct.png";
import "assets/css/nucleo-icons.css";
import "assets/css/nucleo-svg.css";

export default function App() {
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth?.role);
  const dispatch1 = useDispatch();
  console.log("Current user role:", role);
  const isAuthenticated = role !== null;
  const [initializing, setInitializing] = useState(true);
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, darkSidenav } =
    controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const redirectedRef = useRef(false);
  // Redirect đến sign-in nếu chưa đăng nhập và không ở trang sign-in
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData && !role) {
      const parsedData = JSON.parse(storedUserData);
      dispatch1(setUserData(parsedData));
      console.log("User data restored from localStorage");
    }
    setInitializing(false); // kết thúc khởi tạo
  }, [dispatch, role]);

  // Chặn redirect trong khi đang khởi tạo
  useEffect(() => {
    if (!initializing && !isAuthenticated && pathname !== "/authentication/sign-in") {
      navigate("/authentication/sign-in");
    }
  }, [initializing, isAuthenticated, pathname, navigate]);

  // Bỏ redirect tới dashboard khi chưa khôi phục xong
  useEffect(() => {
    if (!initializing && isAuthenticated && !redirectedRef.current) {
      redirectedRef.current = true;
      if (role === 1) {
        navigate("/dashboard-admin");
      } else if (role === 2) {
        navigate("/dashboard-organizer");
      } else {
        navigate("/dashboard");
      }
    }
  }, [initializing, isAuthenticated, role, navigate]);

  // Cache RTL
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  // Lọc routes theo role
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (route.hidden) return false;
      if (!route.allowedRoles) return true;
      return role && route.allowedRoles.includes(role);
    });
  }, [role]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  // NẾU CHƯA ĐĂNG NHẬP -> CHỈ HIỂN THỊ TRANG SIGN IN
  if (!isAuthenticated) {
    return direction === "rtl" ? (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={themeRTL}>
          <CssBaseline />
          <Routes>
            <Route path="/authentication/sign-in" element={<SignIn />} />
            <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
          </Routes>
        </ThemeProvider>
      </CacheProvider>
    ) : (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/authentication/sign-in" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
        </Routes>
      </ThemeProvider>
    );
  }

  // NẾU ĐÃ ĐĂNG NHẬP -> HIỂN THỊ GIAO DIỆN CHÍNH
  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeRTL}>
        <CssBaseline />
        <>
          {/* Hiển thị Sidenav và Configurator khi đã đăng nhập */}
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={brand}
                brandName="EventSphere"
                routes={filteredRoutes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              <ArgonBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="3.5rem"
                height="3.5rem"
                bgColor="white"
                shadow="sm"
                borderRadius="50%"
                position="fixed"
                right="2rem"
                bottom="2rem"
                zIndex={99}
                color="dark"
                sx={{ cursor: "pointer" }}
                onClick={handleConfiguratorOpen}
              >
                <Icon fontSize="default" color="inherit">
                  settings
                </Icon>
              </ArgonBox>
            </>
          )}

          {layout === "vr" && <Configurator />}

          <Routes>
            {getRoutes(filteredRoutes)}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <>
        {/* Hiển thị Sidenav và Configurator khi đã đăng nhập */}
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={brand}
              brandName="EventSphere"
              routes={filteredRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            <ArgonBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="3.5rem"
              height="3.5rem"
              bgColor="white"
              shadow="sm"
              borderRadius="50%"
              position="fixed"
              right="2rem"
              bottom="2rem"
              zIndex={99}
              color="dark"
              sx={{ cursor: "pointer" }}
              onClick={handleConfiguratorOpen}
            >
              <Icon fontSize="default" color="inherit">
                settings
              </Icon>
            </ArgonBox>
          </>
        )}

        {layout === "vr" && <Configurator />}

        <Routes>
          {getRoutes(filteredRoutes)}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </>
    </ThemeProvider>
  );
}

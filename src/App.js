import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgetPasswordOrganizer from "layouts/authentication/forgotPassword/ForgetPasswordOrganizer";
import OtpForgetPasswordOrganizer from "layouts/authentication/forgotPassword/OtpForgetPasswordOrganizer";
import OtpOrganizerVerification from "layouts/authentication/forgotPassword/OtpOrganizerVerification";
import ResetPasswordOrganizer from "layouts/authentication/forgotPassword/ResetPasswordOrganizer";

import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";


import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import brand from "assets/images/logo-ct.png";
import globalStyles from "assets/theme/globalStyles";

import routes from "routes";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "./redux/store/slices/authSlice"
import { useArgonController, setMiniSidenav, setOpenConfigurator } from "context";
import brandImg from "./assets/images/logo.png";
export default function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth?.role);

  const [initializing, setInitializing] = useState(true);
  const isAuthenticated = role !== null;
  const redirectedRef = useRef(false);

  const [controller, controllerDispatch] = useArgonController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor } = controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Khôi phục user từ localStorage nếu chưa có
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData && !role) {
      dispatch(setUserData(JSON.parse(storedUserData)));
    }
    setInitializing(false);
  }, [dispatch, role]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (
      !initializing &&
      !isAuthenticated &&
      ![
        "/authentication/sign-in",
        "/authentication/sign-up",
        "/authentication/forget-password",
        "/authentication/otp-forget-password",
        "/authentication/reset-password",
        "/authentication/verify-otp-organizer"
      ].includes(pathname)
    ) {
      navigate("/authentication/sign-in");
    }
  }, [initializing, isAuthenticated, pathname, navigate]);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!initializing && isAuthenticated && !redirectedRef.current) {
      redirectedRef.current = true;
      if (role === 1) navigate("/dashboard-admin");
      else if (role === 2) navigate("/dashboard-organizer");
      else navigate("/dashboard");
    }
  }, [initializing, isAuthenticated, role, navigate]);

  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });
    setRtlCache(cacheRtl);
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (route.hidden) return false;
      if (!route.allowedRoles) return true;
      return role && route.allowedRoles.includes(role);
    });
  }, [role]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(controllerDispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(controllerDispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(controllerDispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [direction, pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);
      if (route.route) return <Route exact path={route.route} element={route.component} key={route.key} />;
      return null;
    });

  // Giao diện khi chưa đăng nhập
  if (!isAuthenticated) {
    const content = (
      <>
        <CssBaseline />
        {globalStyles}
        <Routes>
          <Route path="/authentication/sign-in" element={<SignIn />} />
          <Route path="/authentication/sign-up" element={<SignUp />} />
          <Route path="/authentication/forget-password" element={<ForgetPasswordOrganizer />} />
          <Route path="/authentication/otp-forget-password" element={<OtpForgetPasswordOrganizer />} />
          <Route path="/authentication/verify-otp-organizer" element={<OtpOrganizerVerification />} />
          <Route path="/authentication/reset-password" element={<ResetPasswordOrganizer />} />
          <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
        </Routes>
      </>
    );

    return direction === "rtl" ? (
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={themeRTL}>{content}</ThemeProvider>
      </CacheProvider>
    ) : (
      <ThemeProvider theme={theme}>{content}</ThemeProvider>
    );
  }

  // Giao diện chính khi đã đăng nhập
  const mainLayout = (
    <>
      <CssBaseline />
      {globalStyles}
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brand}
            brandNameImage={brandImg}
            routes={filteredRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
        </>
      )}

      <Routes>
        {getRoutes(filteredRoutes)}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={themeRTL}>{mainLayout}</ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={theme}>{mainLayout}</ThemeProvider>
  );
}

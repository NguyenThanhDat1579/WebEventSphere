import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import ArgonBox from "components/ArgonBox";
import { useArgonController, setLayout } from "context";

function DashboardLayout({ bgColor, children, ...rest }) {
  const [controller, dispatch] = useArgonController();
  const { miniSidenav, darkMode } = controller;
  const { pathname } = useLocation();

  const [layoutReady, setLayoutReady] = useState(false);

  // Set layout on route change
  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  // Wait for layout to be ready (avoids layout shift)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLayoutReady(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, [miniSidenav]);

  const background = darkMode && !bgColor ? "transparent" : bgColor;

  if (!layoutReady) return null;

  return (
    <ArgonBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      <ArgonBox
        bgColor={background || "info"}
        height="300px"
        width="100vw"
        position="absolute"
        top={0}
        left={0}
        sx={darkMode && { bgColor: ({ palette: { background } }) => background.default }}
        {...rest}
      />
      {children}
    </ArgonBox>
  );
}

DashboardLayout.propTypes = {
  bgColor: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;

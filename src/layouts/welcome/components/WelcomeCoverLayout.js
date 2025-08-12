import PropTypes from "prop-types";
import Box from "@mui/material/Box";

function WelcomeCoverLayout({ bgImage, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        p: 2,
        overflow: "hidden",

        // Gradient overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #d5d8ff 0%, #5669ff 80%)",
          opacity: 0.85,
          zIndex: -1,
        },

        // Background image with blur
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(6px)",
          zIndex: -2,
        },
      }}
    >
      {children}
    </Box>
  );
}

WelcomeCoverLayout.propTypes = {
  bgImage: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default WelcomeCoverLayout;

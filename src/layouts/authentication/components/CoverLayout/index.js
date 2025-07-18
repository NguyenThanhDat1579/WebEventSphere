

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI example components
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import PageLayout from "examples/LayoutContainers/PageLayout";

// Authentication layout components
import Footer from "layouts/authentication/components/Footer";

function CoverLayout({ title, description, image, imgPosition, button, children }) {
  return (
    <PageLayout>
      <ArgonBox
          width="100%"
          height="60vh" // 👈 Tăng chiều cao hình nền
          display="flex" // 👈 Dùng flexbox
          alignItems="center" // 👈 Căn giữa theo chiều dọc
          justifyContent="center" // 👈 Căn giữa theo chiều ngang
          sx={{
            backgroundImage: () =>
              `linear-gradient(rgba(86, 105, 255, 0.4), rgba(86, 105, 255, 0.4)), url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: imgPosition,
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Chèn children vào giữa */}
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={6} lg={5} xl={3.2} sx={{mt: 50}}>
              {children}
            </Grid>
          </Grid>
        </ArgonBox>

    </PageLayout>
  );
}

// Setting default values for the props of CoverLayout
CoverLayout.defaultProps = {
  title: "",
  description: "",
  imgPosition: "center",
  button: { color: "white" },
};

// Typechecking props for the CoverLayout
CoverLayout.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string.isRequired,
  imgPosition: PropTypes.string,
  button: PropTypes.object,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Argon Dashboard 2 MUI contexts
import { useArgonController } from "context";
function DetailedStaticsCard({ bgColor, title, count, icon }) {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  return (
    <Card>
      <ArgonBox
        bgColor={bgColor === "white" && darkMode ? "transparent" : bgColor}
        variant={bgColor === "white" && darkMode ? "contained" : "gradient"}
      >
        <ArgonBox p={2}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            {/* Phần title và count bên trái */}
            <Grid item xs>
              <ArgonBox lineHeight={1}>
                <ArgonTypography
                  variant="button"
                  color={bgColor === "white" ? "text" : "white"}
                  textTransform="uppercase"
                  fontWeight="medium"
                  gutterBottom={false}
                >
                  {title}
                </ArgonTypography>
                <ArgonTypography
                  variant="h5"
                  fontWeight="bold"
                  color={bgColor === "white" ? "dark" : "white"}
                >
                  {count}
                </ArgonTypography>
              </ArgonBox>
            </Grid>

            {/* Phần icon bên phải */}
            <Grid item>
              <ArgonBox
                variant="gradient"
                bgColor={bgColor === "white" ? icon.color : "white"}
                color={bgColor === "white" ? "white" : "dark"}
                width="2.5rem" // thu nhỏ icon
                height="2.5rem"
                borderRadius="section"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {typeof icon.component === "string" ? (
                  <Icon fontSize="small" color="inherit">
                    {icon.component}
                  </Icon>
                ) : (
                  <ArgonBox fontSize="1rem" display="grid" placeItems="center" color="inherit">
                    {icon.component}
                  </ArgonBox>
                )}
              </ArgonBox>
            </Grid>
          </Grid>
        </ArgonBox>
      </ArgonBox>
    </Card>
  );
}

// Setting default values for the props of DetailedStaticsCard
DetailedStaticsCard.defaultProps = {
  bgColor: "white",
  direction: "right",
};

// Typechecking props for the DetailedStaticsCard
DetailedStaticsCard.propTypes = {
  bgColor: PropTypes.oneOf([
    "transparent",
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.shape({
    color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
    component: PropTypes.node.isRequired,
  }).isRequired,
  direction: PropTypes.oneOf(["right", "left"]),
};

export default DetailedStaticsCard;

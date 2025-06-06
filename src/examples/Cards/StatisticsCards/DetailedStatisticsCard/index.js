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

function DetailedStaticsCard({ bgColor, title, count, icon, direction, percentage }) {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  return (
    <Card>
      <ArgonBox
        bgColor={bgColor === "black" && darkMode ? "transparent" : bgColor}
        variant={bgColor === "black" && darkMode ? "contained" : "gradient"}
      >
        <ArgonBox p={2}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            {/* Icon bên trái nếu direction === "left" */}
            {direction === "left" && (
              <Grid item>
                <ArgonBox
                  variant="gradient"
                  bgColor={bgColor === "black" ? icon.color : "black"}
                  color={bgColor === "black" ? "black" : "dark"}
                  width="3rem"
                  height="3rem"
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
                    <ArgonBox
                      fontSize="1.125rem"
                      display="grid"
                      placeItems="center"
                      color="inherit"
                    >
                      {icon.component}
                    </ArgonBox>
                  )}
                </ArgonBox>
              </Grid>
            )}

            {/* Nội dung title & count */}
            <Grid item xs>
              <ArgonBox ml={direction === "left" ? 2 : 0} lineHeight={1}>
                <ArgonTypography
                  variant="button"
                  color={bgColor === "black" ? "text" : "black"}
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

            {/* Icon bên phải nếu direction === "right" */}
            {direction === "right" && (
              <Grid item>
                <ArgonBox
                  variant="gradient"
                  bgColor={bgColor === "white" ? icon.color : "white"}
                  color={bgColor === "white" ? "white" : "dark"}
                  width="2.5rem"
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
            )}
          </Grid>

          {/* Hiển thị phần trăm nếu có */}
          {percentage && (
            <ArgonTypography
              display="flex"
              alignItems="center"
              variant="button"
              fontWeight="bold"
              color={percentage.color}
              mt={2}
            >
              {percentage.count}
              <ArgonTypography
                variant="body2"
                fontWeight="regular"
                color={bgColor === "black" ? "text" : "black"}
                ml={0.5}
                mt={-0.125}
              >
                {percentage.text}
              </ArgonTypography>
            </ArgonTypography>
          )}
        </ArgonBox>
      </ArgonBox>
    </Card>
  );
}

// Default props
DetailedStaticsCard.defaultProps = {
  bgColor: "white",
  direction: "right",
  percentage: null,
};

// Typechecking
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
  percentage: PropTypes.shape({
    color: PropTypes.string,
    count: PropTypes.string,
    text: PropTypes.string,
  }),
};

export default DetailedStaticsCard;

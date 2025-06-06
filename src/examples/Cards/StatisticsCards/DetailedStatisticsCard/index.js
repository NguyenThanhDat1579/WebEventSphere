import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

import { useArgonController } from "context";

function DetailedStaticsCard({ bgColor, title, count, icon }) {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  // Màu cố định
  const titleColor = "#1976d2"; // xanh dương cho title
  const countColor = "#d32f2f"; // đỏ đậm cho count
  const iconBgColor = "#1976d2"; // nền icon xanh dương
  const iconColor = "#ffffff"; // icon trắng

  return (
    <Card>
      <ArgonBox bgColor={bgColor} variant="contained">
        <ArgonBox p={2}>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            {/* Nội dung title & count */}
            <Grid item xs>
              <ArgonBox lineHeight={1}>
                <ArgonTypography
                  variant="button"
                  sx={{ color: titleColor, textTransform: "uppercase", fontWeight: "medium" }}
                  gutterBottom={false}
                >
                  {title}
                </ArgonTypography>
                <ArgonTypography variant="h5" sx={{ color: countColor, fontWeight: "bold" }}>
                  {count}
                </ArgonTypography>
              </ArgonBox>
            </Grid>

            {/* Icon bên phải */}
            <Grid item>
              <ArgonBox
                variant="gradient"
                sx={{
                  bgcolor: iconBgColor,
                  color: iconColor,
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {typeof icon.component === "string" ? (
                  <Icon fontSize="small" sx={{ color: iconColor }}>
                    {icon.component}
                  </Icon>
                ) : (
                  <ArgonBox
                    fontSize="1rem"
                    display="grid"
                    placeItems="center"
                    sx={{ color: iconColor }}
                  >
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

DetailedStaticsCard.defaultProps = {
  bgColor: "white",
};

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
    color: PropTypes.string, // không dùng, có thể bỏ
    component: PropTypes.node.isRequired,
  }).isRequired,
};

export default DetailedStaticsCard;

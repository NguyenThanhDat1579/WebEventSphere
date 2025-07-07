// tableHelpers.js
import ArgonTypography from "components/ArgonTypography";

/* Typography dùng cho các cell */
export const Cell = (value, align = "left") => (
  <ArgonTypography
    variant="body2"
    color="text"
    fontWeight={400}
    textAlign={align}
    sx={{ fontSize: "13px", lineHeight: 1.5 }}
  >
    {value !== undefined && value !== null && value !== "" ? value : "—"}
  </ArgonTypography>
);

import PropTypes from "prop-types";
import TableCell from "@mui/material/TableCell";
import ArgonTypography from "components/ArgonTypography";
import ArgonBox from "components/ArgonBox";

function SalesTableCell({ title, content, image, noBorder, flex = 1, ...rest }) {
  let template;

  if (image) {
    template = (
      <TableCell {...rest} align="left" sx={{ border: noBorder ? 0 : undefined, flex }}>
        <ArgonBox display="flex" alignItems="center" width="max-content">
          <ArgonBox component="img" src={image} alt={content} width="3rem" height="auto" />
          <ArgonBox display="flex" flexDirection="column" ml={3}>
            <ArgonTypography
              variant="caption"
              color="text"
              fontWeight="medium"
              textTransform="capitalize"
            >
              {title}:
            </ArgonTypography>
            <ArgonTypography variant="button" fontWeight="medium" textTransform="capitalize">
              {content}
            </ArgonTypography>
          </ArgonBox>
        </ArgonBox>
      </TableCell>
    );
  } else {
    template = (
      <TableCell {...rest} align="center" sx={{ border: noBorder ? 0 : undefined, flex }}>
        <ArgonBox display="flex" flexDirection="column">
          <ArgonTypography
            variant="caption"
            color="text"
            fontWeight="medium"
            textTransform="capitalize"
          >
            {title}:
          </ArgonTypography>
          <ArgonTypography variant="button" fontWeight="medium" textTransform="capitalize">
            {content}
          </ArgonTypography>
        </ArgonBox>
      </TableCell>
    );
  }

  return template;
}

SalesTableCell.defaultProps = {
  image: "",
  noBorder: false,
  flex: 1,
};

SalesTableCell.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  noBorder: PropTypes.bool,
  flex: PropTypes.number,
};

export default SalesTableCell;

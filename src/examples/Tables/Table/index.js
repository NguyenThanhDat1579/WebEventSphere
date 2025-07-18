import { useMemo } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import {
  Table as MuiTable,
  TableBody,
  TableContainer,
  TableRow,
} from "@mui/material";

import ArgonBox from "components/ArgonBox";
import ArgonAvatar from "components/ArgonAvatar";
import ArgonTypography from "components/ArgonTypography";

function Table({ columns = [], rows = [], sxTable = {} }) {
  /* ---------- HEADER ---------- */
  const header = (
    <TableRow>
      {columns.map(({ title, align = "left", width }, i) => (
        <ArgonBox
          key={i}
          component="th"
          width={width || "auto"}
          px={3}
          py={1.5}
          textAlign={align}
          fontSize="0.82rem"
          fontWeight={700}
          sx={{ whiteSpace: "nowrap", borderBottom: "1px solid #e0e0e0" }}
        >
          {title?.toUpperCase()}
        </ArgonBox>
      ))}
    </TableRow>
  );

  /* ---------- BODY ---------- */
  const body = rows.map((row, rIdx) => (
    <TableRow key={`row-${rIdx}`}>
      {columns.map(({ field, align = "left" }) => {
        const cell = row[field];

        // hỗ trợ kiểu [avatarUrl, label]
        if (Array.isArray(cell)) {
          const [src, label] = cell;
          return (
            <ArgonBox key={uuidv4()} component="td" p={1} textAlign={align}>
              <ArgonBox display="flex" alignItems="center">
               <ArgonAvatar
  src={src}
  name={label}
  variant="rounded"
  size="custom"
  width="96px"
  height="96px"
/>

                <ArgonTypography variant="body2">{label}</ArgonTypography>
              </ArgonBox>
            </ArgonBox>
          );
        }

        // ô bình thường
        return (
          <ArgonBox key={uuidv4()} component="td" p={1} textAlign={align}>
            {cell}
          </ArgonBox>
        );
      })}
    </TableRow>
  ));

  /* ---------- RENDER ---------- */
  return useMemo(
    () => (
      <TableContainer>
        <MuiTable
          sx={{
            "& tbody tr:nth-of-type(even)": { backgroundColor: "#f7f7f7" },
            "& tbody tr:hover": {
              backgroundColor: "#e0e0e0",
              transition: ".2s",
            },
            ...sxTable,
          }}
        >
          <ArgonBox
            component="thead"
            sx={{ position: "sticky", top: 0, zIndex: 2, bgcolor: "#fafafa" }}
          >
            {header}
          </ArgonBox>
          <TableBody>{body}</TableBody>
        </MuiTable>
      </TableContainer>
    ),
    [columns, rows, sxTable]
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired, // nhãn cột
      field: PropTypes.string.isRequired, // key tra trong row
      align: PropTypes.oneOf(["left", "center", "right"]),
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  rows: PropTypes.arrayOf(PropTypes.object),
  sxTable: PropTypes.object,
};

export default Table;

import PropTypes from "prop-types";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Box from "@mui/material/Box";
import ArgonTypography from "components/ArgonTypography";
import ArgonBox from "components/ArgonBox";
import SalesTableCell from "examples/Tables/SalesTable/SalesTableCell";

function SalesTable({ title, rows }) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 7;

  const handleChangePage = (event, newPage) => setPage(newPage);

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderTableCells = paginatedRows.map((row, key) => (
    <TableRow key={`row-${page * rowsPerPage + key}`}>
      {Object.entries(row).map(([cellTitle, cellContent]) =>
        Array.isArray(cellContent) ? (
          <SalesTableCell
            key={cellContent[1]}
            title={cellTitle}
            content={cellContent[1]}
            image={cellContent[0]}
            noBorder={key === paginatedRows.length - 1}
          />
        ) : (
          <SalesTableCell
            key={cellTitle + cellContent}
            title={cellTitle}
            content={cellContent}
            noBorder={key === paginatedRows.length - 1}
          />
        )
      )}
    </TableRow>
  ));

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <TableContainer sx={{ flexGrow: 1, minHeight: 400 }}>
        {/* 👆 minHeight đảm bảo giữ chỗ cho bảng */}
        <Table>
          <TableHead>
            <ArgonBox component="tr" width="max-content" display="block" mb={1.5}>
              <ArgonTypography variant="h6" component="td">
                {title}
              </ArgonTypography>
            </ArgonBox>
          </TableHead>
          <TableBody>{renderTableCells}</TableBody>
        </Table>
      </TableContainer>

      {/* 👇 Phân trang luôn dính dưới */}
      <Box display="flex" justifyContent="flex-end" mt="auto">
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[]} // ẩn dropdown
          labelRowsPerPage="" // ẩn label
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
        />
      </Box>
    </Box>
  );
}

SalesTable.defaultProps = {
  rows: [],
};

SalesTable.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object),
};

export default SalesTable;

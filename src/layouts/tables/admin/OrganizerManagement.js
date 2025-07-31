import React, { useEffect, useState } from "react";
import {
  Card,
  CircularProgress,
  Divider,
  Box,
  useTheme,
  TablePagination,
} from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import userApi from "api/userApi";
import organizerTableData from "layouts/tables/data/organizerTableData";

function OrganizerManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10); // cố định số dòng/trang
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const organizers = res.data.data.filter((u) => u.role !== 3);
          const { columns, rows } = organizerTableData(organizers);
          setColumns(columns);
          setRows(rows);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách tổ chức:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <ArgonBox py={3}>
        <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <ArgonBox px={3} py={2} bgcolor={"#5669FF"} color="white">
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách nhà tổ chức
            </ArgonTypography>
          </ArgonBox>

          <Divider />

          {/* Body */}
          {loading ? (
            <ArgonBox display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </ArgonBox>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table
                columns={columns}
                rows={paginatedRows}
                sxTable={{
                  minWidth: 820,
                  tableLayout: "fixed",

                  "& thead": {
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    bgcolor: theme.palette.grey[100],
                  },
                  "& thead th": {
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "12px 16px",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap",
                  },

                  "& tbody td": {
                    padding: "12px 16px",
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    borderBottom: "1px solid #e0e0e0",
                  },

                  "& tbody td:nth-of-type(3), & tbody td:nth-of-type(4), & tbody td:nth-of-type(5)": {
                    textAlign: "center",
                  },

                  "& tbody tr:nth-of-type(even)": { backgroundColor: "#f7f7f7" },
                  "& tbody tr:hover": {
                    backgroundColor: "#e0e0e0",
                    transition: ".2s",
                  },
                }}
              />
            </Box>
          )}
        </Card>

        {/* Pagination tách ra ngoài Card */}
        {!loading && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={() => {}}
              rowsPerPageOptions={[]} // ẩn dropdown chọn dòng/trang
              labelRowsPerPage=""     // ẩn nhãn "Rows per page"
              sx={{
                ".MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-input": {
                  display: "none",
                },
              }}
            />
          </Box>
        )}
      </ArgonBox>
    </DashboardLayout>
  );
}

export default OrganizerManagement;

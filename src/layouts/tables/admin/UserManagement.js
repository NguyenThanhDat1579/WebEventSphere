import React, { useEffect, useState } from "react";
import {
  Card,
  Divider,
  CircularProgress,
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
import userTableData from "layouts/tables/data/userTableData";

function UserManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        const userList = Array.isArray(res.data?.data) ? res.data.data : [];
        const filteredUsers = userList.filter((user) => user.role === 3);
        const { columns, rows } = userTableData(filteredUsers);
        setColumns(columns);
        setRows(rows);
      } catch (error) {
        console.error("Lỗi khi gọi API /users/all:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
          <ArgonBox
            px={3}
            py={2}
            sx={{
              bgcolor: "#5669FF",
              color: theme.palette.primary.contrastText,
            }}
          >
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách người dùng
            </ArgonTypography>
          </ArgonBox>

          <Divider />

          {loading ? (
            <ArgonBox display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </ArgonBox>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table columns={columns} rows={paginatedRows} />
            </Box>
          )}
        </Card>

        {/* TablePagination tách ra ngoài Card */}
        {!loading && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]} // Ẩn dropdown chọn số dòng/trang
              labelRowsPerPage=""     // Ẩn chữ "Rows per page"v
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Box>
        )}
      </ArgonBox>

    </DashboardLayout>
  );
}

export default UserManagement;

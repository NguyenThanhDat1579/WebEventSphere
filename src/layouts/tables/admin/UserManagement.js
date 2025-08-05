import React, { useEffect, useState } from "react";
import {
  Card,
  Divider,
  CircularProgress,
  Box,
  useTheme,
  TablePagination,
  Pagination,
} from "@mui/material";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Table from "examples/Tables/Table";
import userApi from "api/userApi";
import userTableData from "layouts/tables/data/userTableData";
import { TextField } from "@mui/material";
function UserManagement() {

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState(""); 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        const userList = Array.isArray(res.data?.data) ? res.data.data : [];
       const filtered = userList
      .filter((user) => user.role === 3)
      .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt))
      .map((user) => ({
          username: user.username || "Chưa có tên",
          email: user.email || "Chưa có email",
          phoneNumber: user.phoneNumber || "", // Chuyển từ phone => phoneNumber
          address: user.address || "",
          role: user.role, // vẫn cần truyền để phân biệt roleLabel trong Cell
        }));
        const { columns, rows } = userTableData(filtered);
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

  const filteredRows = rows.filter((row) => {
    const name = row.name?.props?.children?.toLowerCase() || "";
    const email = row.email?.props?.children?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });


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

          <ArgonBox px={3} py={2} >
            <Box sx={{width: "30%"}}>
            <TextField
             fullWidth
              padding="10"
              size="small"
              placeholder="Tìm kiếm"
              value={searchTerm}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset về trang đầu nếu search
              }}
            />
            </Box>
          </ArgonBox>


          <Divider />

          {loading ? (
            <ArgonBox display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </ArgonBox>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }} mt={-3}>
             <Table
                columns={columns}
                rows={filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
              />
            </Box>
          )}
        </Card>

        {/* TablePagination tách ra ngoài Card */}
        {!loading && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Pagination
              count={Math.ceil(filteredRows.length / rowsPerPage)}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="medium"
            />
          </Box>
        )}
      </ArgonBox>

    </DashboardLayout>
  );
}

export default UserManagement;
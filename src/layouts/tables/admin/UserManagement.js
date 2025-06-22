import React, { useEffect, useState } from "react";

// MUI & Argon
import Card from "@mui/material/Card";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";
import Divider from "@mui/material/Divider";
import { Box, CircularProgress } from "@mui/material";

// API & Helper
import userApi from "api/userApi";
import userTableData from "layouts/tables/data/userTableData";

function UserManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const filteredUsers = res.data.data.filter(user => user.role === 3);
          const { columns, rows } = userTableData(filteredUsers);
          setColumns(columns);
          setRows(rows);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API /users/all:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <ArgonBox px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
              <ArgonTypography variant="h5" fontWeight="bold">
                Danh sách người dùng
              </ArgonTypography>
            </ArgonBox>
            <Divider />
            <ArgonBox p={3}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" >
                  <CircularProgress />
                </Box>
              ) : (
                <ArgonBox
                  sx={{
                    overflowX: "auto",
                    "& .MuiTableHead-root .MuiTableCell-head": {
                      fontSize: "20px !important",
                      fontWeight: "bold",
                      color: "#344767",
                    },
                    "& .MuiTableRow-root:hover": { backgroundColor: "#f5f5f5" },
                    "& .MuiTableCell-root": { padding: "8px 12px", fontSize: 12 },
                  }}
                >
                  <Table columns={columns} rows={rows} />
                </ArgonBox>
              )}
            </ArgonBox>
          </Card>
        </ArgonBox>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserManagement;

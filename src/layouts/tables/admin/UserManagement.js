import React, { useEffect, useState } from "react";
import {
  Card,
  Divider,
  CircularProgress,
  Box,
  useTheme
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
  const theme = useTheme();

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
        <Card
          sx={{
            boxShadow: 4,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <ArgonBox
            px={3}
            py={2}
            sx={{
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách người dùng
            </ArgonTypography>
          </ArgonBox>

          <Divider />

          {/* Body */}
          {loading ? (
  <ArgonBox display="flex" justifyContent="center" py={10}>
    <CircularProgress />
  </ArgonBox>
) : (
  <Box
    sx={{
      width: "100%",
      overflowX: "auto",
      minWidth: 800,

      // 🔵 HEADER cố định
      "& table thead": {
        position: "sticky",
        top: 0,
        zIndex: 1,
        backgroundColor: theme.palette.grey[100],
      },

      // 🔵 Header style
      "& table thead th": {
        fontWeight: 600,
        fontSize: 13,
        color: theme.palette.grey[800],
        padding: "12px 16px",
        borderBottom: "1px solid #e0e0e0",
        whiteSpace: "nowrap",
      },

      // 🔵 Cell style
      "& table tbody td": {
        padding: "12px 16px",
        fontSize: 13.5,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        borderBottom: "1px solid #e0e0e0",
        color: theme.palette.text.primary,
      },

      // 🔵 Căn giữa cột 3, 4, 5
      "& table td:nth-of-type(3),\
         table th:nth-of-type(3),\
         table td:nth-of-type(4),\
         table th:nth-of-type(4),\
         table td:nth-of-type(5),\
         table th:nth-of-type(5)": {
        textAlign: "center",
      },

      // 🔵 Dòng chẵn có màu nhẹ
      "& table tbody tr:nth-of-type(even)": {
        backgroundColor: "#f9f9f9",
      },

      // 🔵 Hover hiệu ứng
      "& table tbody tr:hover": {
        backgroundColor: theme.palette.action.hover,
        cursor: "pointer",
        transition: "all .2s",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      },
    }}
  >
    <Table columns={columns} rows={rows} />
  </Box>
)}

        </Card>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );

}

export default UserManagement;

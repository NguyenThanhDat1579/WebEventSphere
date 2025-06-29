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
        <Card sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <ArgonBox px={3} py={2} bgcolor={theme.palette.grey[100]}>
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
            <ArgonBox sx={{ overflowX: "auto" }}>
              <Table
                columns={columns}
                rows={rows}
                sxTable={{
                  tableLayout: "fixed",
                  "& th, & td": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    padding: "8px 12px",
                    fontSize: "13px"
                  },
                  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: 140 },
                  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: 200 },
                  "& th:nth-of-type(3), & td:nth-of-type(3)": {
                    width: 120,
                    textAlign: "center"
                  },
                  "& th:nth-of-type(4), & td:nth-of-type(4)": {
                    width: 200,
                    textAlign: "center"
                  },
                  "& th:nth-of-type(5), & td:nth-of-type(5)": {
                    width: 100,
                    textAlign: "center"
                  },
                  "& tbody tr:nth-of-type(odd)": {
                    backgroundColor: theme.palette.grey[50]
                  },
                  "& tbody tr:hover": {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              />
            </ArgonBox>
          )}
        </Card>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserManagement;

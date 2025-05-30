import React, { useEffect, useState } from "react";

// MUI & Argon
import Card from "@mui/material/Card";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// API & Helper
import userApi from "api/userApi"; // Đường dẫn đúng file bạn đã tạo
import userTableData from "layouts/tables/data/userTableData";

function UserManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const { columns, rows } = userTableData(res.data.data);
          setColumns(columns);
          setRows(rows);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API /users/all:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <ArgonTypography variant="h6">Danh sách người dùng</ArgonTypography>
            </ArgonBox>
            <ArgonBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              <Table columns={columns} rows={rows} />
            </ArgonBox>
          </Card>
        </ArgonBox>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserManagement;

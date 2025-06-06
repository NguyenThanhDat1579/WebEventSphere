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
import userApi from "api/userApi";
import userTableData from "layouts/tables/data/userTableData";

function UserManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          // 🔍 Lọc chỉ người dùng có role === 3
          const filteredUsers = res.data.data.filter(user => user.role === 3);

          // ⚙️ Truyền dữ liệu đã lọc vào hàm dựng bảng
          const { columns, rows } = userTableData(filteredUsers);
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

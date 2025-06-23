import React, { useEffect, useState } from "react";
import {
  Card,
  CircularProgress,
  Divider
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

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const organizers = res.data.data.filter((u) => u.role !== 3);
          const { columns, rows } = organizerTableData(organizers);
          setColumns(columns);
          setRows(rows);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhà tổ chức:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <ArgonTypography variant="h5" fontWeight="bold">
                Danh sách nhà tổ chức
              </ArgonTypography>
            </ArgonBox>

            <Divider sx={{ borderColor: "#ddd" }} />

            <ArgonBox px={3} py={2}>
              {loading ? (
                <ArgonBox display="flex" justifyContent="center" alignItems="center" py={5}>
                  <CircularProgress />
                </ArgonBox>
              ) : (
                <ArgonBox
                  sx={{
                    "& .MuiTableRow-root:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    "& .MuiTableCell-root": {
                      padding: "8px 12px",
                      fontSize: 13,
                    },
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

export default OrganizerManagement;

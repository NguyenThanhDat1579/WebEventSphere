import React, { useEffect, useState } from "react";
import {
  Card,
  CircularProgress,
  Divider,
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
import organizerTableData from "layouts/tables/data/organizerTableData";

function OrganizerManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.error("Lỗi khi tải danh sách nhà tổ chức:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Card sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden" }}>
          <ArgonBox px={3} py={2} bgcolor={theme.palette.grey[100]}>
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách nhà tổ chức
            </ArgonTypography>
          </ArgonBox>

          <Divider />

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
                    fontSize: "13px",
                  },
                  "& th:nth-of-type(1), & td:nth-of-type(1)": { width: 140 },
                  "& th:nth-of-type(2), & td:nth-of-type(2)": { width: 200 },
                  "& th:nth-of-type(3), & td:nth-of-type(3)": {
                    width: 120,
                    textAlign: "center",
                  },
                  "& th:nth-of-type(4), & td:nth-of-type(4)": {
                    width: 200,
                    textAlign: "center",
                  },
                  "& th:nth-of-type(5), & td:nth-of-type(5)": {
                    width: 120,
                    textAlign: "center",
                  },
                  "& tbody tr:nth-of-type(odd)": {
                    backgroundColor: theme.palette.grey[50],
                  },
                  "& tbody tr:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
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

export default OrganizerManagement;

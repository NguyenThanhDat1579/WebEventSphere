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

// ... import giữ nguyên (đã có organizerTableData ở trên)

function OrganizerManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  /* --- Lấy dữ liệu --- */
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

  /* ----------- RENDER ----------- */
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <ArgonBox py={3}>
        <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
          {/* header */}
          <ArgonBox px={3} py={2} bgcolor={"#5669FF"} color="white">
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách nhà tổ chức
            </ArgonTypography>
          </ArgonBox>

          <Divider />

          {/* body */}
          {loading ? (
            <ArgonBox display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </ArgonBox>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Table
                columns={columns}
                rows={rows}
                sxTable={{
                  minWidth: 820,
                  tableLayout: "fixed",

                  "& thead": { position: "sticky", top: 0, zIndex: 2, bgcolor: theme.palette.grey[100] },
                  "& thead th": {
                    fontWeight: 600,
                    fontSize : 13,
                    padding  : "12px 16px",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap",
                  },

                  "& tbody td": {
                    padding: "12px 16px",
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow : "hidden",
                    textOverflow: "ellipsis",
                    borderBottom: "1px solid #e0e0e0",
                  },

                  /* canh giữa 3 cột cuối */
                  "& tbody td:nth-of-type(3), & tbody td:nth-of-type(4), & tbody td:nth-of-type(5)": {
                    textAlign: "center",
                  },

                  /* zebra & hover – phần này Table.jsx đã có nhưng thêm cũng không sao */
                  "& tbody tr:nth-of-type(even)": { backgroundColor: "#f7f7f7" },
                  "& tbody tr:hover":             { backgroundColor: "#e0e0e0", transition: ".2s" },
                }}
              />
            </Box>
          )}
        </Card>
      </ArgonBox>

      <Footer />
    </DashboardLayout>
  );
}

export default OrganizerManagement;

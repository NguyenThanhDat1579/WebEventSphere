import React, { useEffect, useState } from "react";
import {
  Card,
  CircularProgress,
  Divider,
  Box,
  useTheme,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Table from "examples/Tables/Table";
import userApi from "api/userApi";
import organizerTableData from "layouts/tables/data/organizerTableData";

function OrganizerManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 10;
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const res = await userApi.getAll();
        if (res.data.status) {
          const organizers = res.data.data.filter((u) => u.role !== 3);
            console.log("Danh sách organizers:", organizers);
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

  // 🔍 Lọc theo từ khóa
  const filteredRows = rows.filter((row) => {
    const name = row.name?.props?.children?.toLowerCase() || "";
    const email = row.email?.props?.children?.toLowerCase() || "";
    const phone = row.phone?.props?.children?.toLowerCase() || "";
    const address = row.address?.props?.children?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();
    return (
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      address.includes(search)
    );
  });

  const paginatedRows = filteredRows.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <ArgonBox py={3}>
        <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <ArgonBox px={3} py={2} bgcolor={"#5669FF"} color="white">
            <ArgonTypography variant="h5" fontWeight="bold">
              Danh sách nhà tổ chức
            </ArgonTypography>
          </ArgonBox>

          {/* Search */}
          <ArgonBox px={3} py={2}>
            <Box sx={{width: "30%"}}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset về trang đầu khi tìm kiếm
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            </Box>
          </ArgonBox>

          <Divider />

          {/* Body */}
          {loading ? (
            <ArgonBox display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </ArgonBox>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }} mt={-3}>
              <Table
                columns={columns}
                rows={paginatedRows}
                sxTable={{
                  minWidth: 820,
                  tableLayout: "fixed",

                  "& thead": {
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    bgcolor: theme.palette.grey[100],
                  },
                  "& thead th": {
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "12px 16px",
                    borderBottom: "1px solid #e0e0e0",
                    whiteSpace: "nowrap",
                  },

                  "& tbody td": {
                    padding: "12px 16px",
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    borderBottom: "1px solid #e0e0e0",
                  },

                  "& tbody td:nth-of-type(3), & tbody td:nth-of-type(4), & tbody td:nth-of-type(5)": {
                    textAlign: "center",
                  },

                  "& tbody tr:nth-of-type(even)": { backgroundColor: "#f7f7f7" },
                  "& tbody tr:hover": {
                    backgroundColor: "#e0e0e0",
                    transition: ".2s",
                  },
                }}
              />
            </Box>
          )}
        </Card>

        {/* Pagination */}
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

export default OrganizerManagement;

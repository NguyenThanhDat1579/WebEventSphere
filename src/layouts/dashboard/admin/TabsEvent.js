// src/components/TabsEvent.jsx
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Box, Card, Table, TableHead, TableRow, TableCell, TableContainer, TableBody, Paper, Typography, TextField, InputAdornment, Button } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import { Grid } from "@mui/material";
import eventApi from "api/eventApi";
import SearchIcon from "@mui/icons-material/Search";
import CustomTextField from "../organizer/OrganizerCreateNewEvent/components/CustomTextField";

const TabsEvent = () => {
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newTag, setNewTag] = useState("");
    const [error, setError] = useState("");

     useEffect(() => {
        if (!newTag.trim()) {
        setError(""); // input rỗng thì không báo lỗi
        return;
        }
        const isDuplicate = suggestedTags.some(
        (tag) =>
            (typeof tag === "string" ? tag : tag.name || "")
            .toLowerCase() === newTag.trim().toLowerCase()
        );
        if (isDuplicate) {
        setError("Tag đã tồn tại!");
        } else {
        setError("");
        }
    }, [newTag, suggestedTags]);

    useEffect(() => {
    // gọi API lấy gợi ý tag
    const fetchTags = async () => {
      try {
        const res = await eventApi.getSuggestedTags(); // GET /tags/suggest
        setSuggestedTags(res.data || []); // cập nhật state
      } catch (error) {
        console.error("Lỗi khi lấy gợi ý tag:", error);
      }
    };

    fetchTags();
    }, []);

    const filteredTags = suggestedTags.filter((tag) => {
        const tagName = (typeof tag === "string" ? tag : tag.name || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return tagName.includes(search);
        });

     const handleAddTag = async () => {
        if (!newTag.trim()) {
            setError("Vui lòng nhập nội tag");
            return;
        }
        if (error) return;

        try {
            const res = await eventApi.createTag(newTag.trim());
            const createdTag = res.data; // API trả về object
            // Lấy name để push vào state ngay lập tức
            setSuggestedTags((prev) => [...prev, createdTag]); // prev là object, không cần chỉnh gì
            setNewTag("");
        } catch (err) {
            console.error("Lỗi khi tạo tag:", err);
            setError("Không thể tạo tag, vui lòng thử lại.");
        }
        };

  return (
    <DashboardLayout>
          <DashboardNavbar />
           <ArgonBox py={3}>
                <Card sx={{ boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
                {/* Header */}
                    <ArgonBox px={3} py={2} bgcolor={"#5669FF"} color="white">
                        <ArgonTypography variant="h5" fontWeight="bold">
                        Danh sách thẻ sự kiện
                        </ArgonTypography>
                    </ArgonBox>
                       <ArgonBox px={2} py={2}>
                        <TextField
                          sx={{ width: '20%' }}
                        size="medium"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        InputProps={{
                            startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </InputAdornment>
                            ),
                        }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </ArgonBox>
                        <Typography variant="h5" fontWeight="600" color={"#000000"} px={2}>Thêm thẻ sự kiện</Typography>
                       <ArgonBox px={2} py={1} display="flex" gap={1}>
                       
                        <CustomTextField
                            size="medium"
                            placeholder="Thêm tag mới"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            error={!!error}
                            sx={{ width: '20%' }}
                            />
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#5669FF",
                                color: "#fff",
                                border: "1px solid #5669FF",
                                "&:hover": {
                                backgroundColor: "#fff",
                                color: "#5669FF",
                                },
                            }}
                            onClick={handleAddTag}
                            >
                            Thêm
                        </Button>
                    </ArgonBox>
                        {error && (
                        <Typography
                            variant="caption"
                            color="error"
                            fontSize={14}
                            sx={{ display: "block", ml: 3}}
                        >
                            {error}
                        </Typography>
                        )}
                     <TableContainer component={Paper} p={3}>
                        <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Tên danh mục</TableCell>
                        </TableRow>
                        </TableHead>
                    </TableContainer>
                     <Grid container spacing={2} p={1}>
                        {filteredTags.map((item, index) => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                padding: 2,
                                textAlign: "center",
                                cursor: "pointer",
                                "&:hover": { backgroundColor: "#f5f5f5" },
                                }}
                            >
                                   <Typography variant="body1">
                                    {typeof item === "string" ? item : item.name}
                                    </Typography>
                            </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Card>
          </ArgonBox>
    </DashboardLayout>
  );
};

export default TabsEvent;

import ArgonTypography from "components/ArgonTypography";

const userTableData = (userList) => {
  const columns = [
    { name: "Tên", align: "left" },
    { name: "Email", align: "left" },
    { name: "Số điện thoại", align: "center" },
    { name: "Địa chỉ", align: "center" },
    { name: "Vai trò", align: "center" },
  ];

  const commonStyle = {
    variant: "body2",
    fontWeight: "400",
    color: "text",
    sx: { fontSize: "13px" },
  };

  const rows = userList.map((user) => ({
    Tên: <ArgonTypography {...commonStyle}>{user.username || "—"}</ArgonTypography>,
    Email: <ArgonTypography {...commonStyle}>{user.email || "—"}</ArgonTypography>,
    "Số điện thoại": (
      <ArgonTypography {...commonStyle} textAlign="center">
        {user.phoneNumber || "—"}
      </ArgonTypography>
    ),
    "Địa chỉ": (
      <ArgonTypography {...commonStyle} textAlign="center">
        {user.address || "—"}
      </ArgonTypography>
    ),
    "Vai trò": (
      <ArgonTypography {...commonStyle} textAlign="center">
        {user.role === 3 ? "Người dùng" : "Nhà tổ chức"}
      </ArgonTypography>
    ),
  }));

  return { columns, rows };
};

export default userTableData;

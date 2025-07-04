import ArgonTypography from "components/ArgonTypography";

const columns = [
  { title: "Tên",            field: "name",      align: "left"   },
  { title: "Email",          field: "email",     align: "left"   },
  { title: "Số điện thoại",  field: "phone",     align: "center" },
  { title: "Địa chỉ",        field: "address",   align: "center" },
  { title: "Vai trò",        field: "roleLabel", align: "center" },
];

const cellText = (value, align = "left") => (
  <ArgonTypography
    variant="body2"
    fontWeight="400"
    color="text"
    sx={{ fontSize: 13, textAlign: align }}
  >
    {value}
  </ArgonTypography>
);

const userTableData = (users = []) => {
  if (!Array.isArray(users)) users = [];

  const rows = users.map((u) => ({
    name     : cellText(u.username || "—"),
    email    : cellText(u.email    || "—"),
    phone    : cellText(u.phoneNumber || "—", "center"),
    address  : cellText(u.address  || "—", "center"),
    roleLabel: cellText(u.role === 3 ? "Người dùng" : "Nhà tổ chức", "center"),
  }));

  return { columns, rows };
};

export default userTableData;
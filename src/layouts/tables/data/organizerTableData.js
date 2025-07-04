import ArgonTypography from "components/ArgonTypography";

/* ---- Cấu hình cột ---- */
export const columns = [
  { title: "Tên tổ chức",   field: "name",      align: "left"   },
  { title: "Email",         field: "email",     align: "left"   },
  { title: "Số ĐT",         field: "phone",     align: "center" },
  { title: "Địa chỉ",       field: "address",   align: "center" },
  { title: "Follower",      field: "follower",  align: "center" },
];

/* 1 hàm tiện tạo typography đồng bộ  */
const txt = (value, align = "left") => (
  <ArgonTypography
    variant="body2"
    fontWeight="400"
    color="text"
    sx={{ fontSize: 13, textAlign: align }}
  >
    {value}
  </ArgonTypography>
);

export const organizerTableData = (list = []) => {
  const rows = list.map((o) => ({
    /* trùng với field ở columns */
    name     : txt(o.username   || "—"),
    email    : txt(o.email      || "—"),
    phone    : txt(o.phoneNumber|| "—", "center"),
    address  : txt(o.address    || "—", "center"),
    follower : txt(o.follower   ?? 0 , "center"),
  }));

  return { columns, rows };
};

export default organizerTableData;

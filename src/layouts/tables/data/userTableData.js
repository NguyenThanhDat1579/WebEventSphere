// userTableData.js
import { Cell } from "../helpers/tableHelpers";

export const columns = [
  { title: "Tên",      field: "name",     align: "left"   },
  { title: "Email",    field: "email",    align: "left"   },
  { title: "Số ĐT",    field: "phone",    align: "center" },
  { title: "Ngày tạo", field: "createAt", align: "center" },
  // { title: "Địa chỉ", field: "address",   align: "center" },
  // { title: "Vai trò", field: "roleLabel", align: "center" },
];

const userTableData = (users = []) => {
  const rows = users.map(u => {
    // ✅ format ngày tạo
    let createdAtText = "N/A";
    if (u.createAt) {
      const date = new Date(u.createAt);
      if (!isNaN(date.getTime())) {
        createdAtText = date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return {
      name     : Cell(u.username || "Chưa có tên"),
      email    : Cell(u.email || "Chưa có email"),
     phone: Cell(
  u.phoneNumber && u.phoneNumber.trim() !== "" ? u.phoneNumber : "Chưa cập nhật",
  "center"
),

      address  : Cell(u.address || "", "center"),
      roleLabel: Cell(u.role === 3 ? "Người dùng" : "Nhà tổ chức", "center"),
      createAt : Cell(createdAtText, "center"), // ✅ format ngày
    };
  });

  return { columns, rows };
};

export default userTableData;

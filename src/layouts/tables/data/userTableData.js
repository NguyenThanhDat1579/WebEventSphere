// userTableData.js
import { Cell } from "../helpers/tableHelpers";

export const columns = [
  { title: "Tên",     field: "name",      align: "left"   },
  { title: "Email",   field: "email",     align: "left"   },
  { title: "Số ĐT",   field: "phone",     align: "center" },

];

  // { title: "Địa chỉ", field: "address",   align: "center" },
  // { title: "Vai trò", field: "roleLabel", align: "center" },

const userTableData = (users = []) => {
  const rows = users.map(u => ({
    name     : Cell(u.username,),
    email    : Cell(u.email),
    phone    : Cell(u.phoneNumber, "center"),
    address  : Cell(u.address, "center"),
    roleLabel: Cell(u.role === 3 ? "Người dùng" : "Nhà tổ chức", "center"),
  }));

  return { columns, rows };
};

export default userTableData;

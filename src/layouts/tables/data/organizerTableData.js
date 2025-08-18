// organizerTableData.js
import { Cell } from "../helpers/tableHelpers";

export const columns = [
  { title: "Tên nhà tổ chức", field: "name", align: "left" },
  { title: "Email",           field: "email", align: "left" },
  { title: "SĐT",             field: "phone", align: "center" },
  { title: "Ngày tạo",        field: "createAt", align: "center" },
];

const organizerTableData = (list = []) => {
  const rows = list.map(o => {
    // ✅ Lấy đúng field "createAt" từ API
    let createdAtText = "N/A";
    if (o.createAt) {
      const date = new Date(o.createAt);
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
      name     : Cell(o.username),
      email    : Cell(o.email),
      phone    : Cell(o.phoneNumber ?? "Chưa cập nhật", "center"),
      address  : Cell(o.address, "center"),
      followers: Cell(o.follower ?? 0, "center"),
      createAt : Cell(createdAtText, "center"),  // ✅ fix tên đúng với API
    };
  });

  return { columns, rows };
};

export default organizerTableData;

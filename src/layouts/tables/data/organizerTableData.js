// organizerTableData.js
import { Cell } from "../helpers/tableHelpers";

export const columns = [
  { title: "Tên nhà tổ chức", field: "name",      align: "left"   },
  { title: "Email",           field: "email",     align: "left"   },
  { title: "Số ĐT",           field: "phone",     align: "center" },

];

  // { title: "Địa chỉ",         field: "address",   align: "center" },
  // { title: "Người theo dõi",  field: "followers", align: "center" },

const organizerTableData = (list = []) => {
  const rows = list.map(o => ({
    name     : Cell(o.username),
    email    : Cell(o.email),
    phone    : Cell(o.phoneNumber, "center"),
    address  : Cell(o.address, "center"),
    followers: Cell(o.follower ?? 0, "center"),
  }));

  return { columns, rows };
};

export default organizerTableData;

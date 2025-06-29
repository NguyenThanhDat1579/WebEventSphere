// src/layouts/tables/data/organizerTableData.js

const organizerTableData = (organizers) => {
  const columns = [
    { name: "Tên nhà tổ chức", align: "left" },
    { name: "Email", align: "left" },
    { name: "Số điện thoại", align: "center" },
    { name: "Địa chỉ", align: "center" },
    { name: "Người theo dõi", align: "center" },
  ];

  const rows = organizers.map((user) => ({
    "Tên nhà tổ chức": user.username || "—",
    "Email": user.email || "—",
    "Số điện thoại": user.phoneNumber || "—",
    "Địa chỉ": user.address || "—",
    "Người theo dõi": user.follower ?? 0,
  }));

  return { columns, rows };
};

export default organizerTableData;

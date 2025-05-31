const userTableData = (userList) => {
  const columns = [
    { name: "user", align: "left" },
    { name: "email", align: "left" },
    { name: "phone", align: "center" },
    { name: "address", align: "center" },
    { name: "role", align: "center" },
  ];

  const rows = userList.map((user) => ({
    user: user.username,
    email: user.email,
    phone: user.phoneNumber || "—",
    address: user.address || "—",
    role: user.role === 3 ? "Người dùng" : "Nhà tổ chức",
  }));

  return { columns, rows };
};

export default userTableData;
const organizerTableData = (organizers) => {
  const columns = [
    { name: "name", align: "left" },
    { name: "email", align: "left" },
    { name: "phone", align: "center" },
    { name: "address", align: "center" },
    { name: "followers", align: "center" },
  ];

  const rows = organizers.map((user) => ({
    name: user.username,
    email: user.email,
    phone: user.phoneNumber || "—",
    address: user.address || "—",
    followers: user.follower || 0,
  }));

  return { columns, rows };
};

export default organizerTableData;

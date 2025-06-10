import ArgonButton from "components/ArgonButton";

const eventsTableData = (data, onDetailClick) => {
  const columns = [
    { name: "tên", align: "left" },
    { name: "giá vé", align: "center" },
    { name: "đã bán", align: "center" },
    { name: "trạng thái", align: "center" },
    { name: "chi tiết", align: "center" }, // 👈 thêm cột chi tiết
  ];

  const rows = data.map((event) => ({
    tên: event.name,
    "giá vé": event.ticketPrice ? event.ticketPrice.toLocaleString() : "Chưa rõ",
    "đã bán": event.soldTickets,
    "trạng thái": event.status || "Chưa rõ",
    "chi tiết": (
      <ArgonButton
        variant="outlined"
        size="small"
        color="info"
        onClick={() => onDetailClick(event._id)}
      >
        Chi tiết
      </ArgonButton>
    ),
  }));

  return { columns, rows };
};

export default eventsTableData;

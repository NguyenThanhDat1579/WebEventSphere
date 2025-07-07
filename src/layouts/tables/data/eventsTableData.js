import ArgonButton from "components/ArgonButton";
import { Cell } from "../helpers/tableHelpers"; // ✅ dùng chung Cell từ helper

// Hàm viết hoa chữ cái đầu
const capitalize = (str) =>
  typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : "—";

const eventsTableData = (data = [], onDetailClick = () => {}) => {
  const columns = [
    { title: "Tên",       field: "name",     align: "left"   },
    { title: "Giá vé",    field: "price",    align: "center" },
    { title: "Đã bán",    field: "sold",     align: "center" },
    { title: "Trạng thái",field: "status",   align: "center" },
    { title: "Chi tiết",  field: "action",   align: "center" },
  ];

  const rows = data.map((event) => {
    const price = event.ticketPrice
      ? `${event.ticketPrice.toLocaleString()} ₫`
      : "—";

    return {
      name:   Cell(event.name),
      price:  Cell(price, "center"),
      sold:   Cell(event.soldTickets ?? 0, "center"),
      status: Cell(capitalize(event.status), "center"),
      action: (
        <ArgonButton
          variant="outlined"
          size="small"
          color="info"
          onClick={() => onDetailClick(event._id)}
        >
          Chi tiết
        </ArgonButton>
      ),
    };
  });

  return { columns, rows };
};

export default eventsTableData;

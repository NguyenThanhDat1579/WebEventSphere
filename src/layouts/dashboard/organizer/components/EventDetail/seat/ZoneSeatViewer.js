import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Paper, Stack } from "@mui/material";

const formatPrice = (price) =>
  price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const ZoneSeatViewer = ({ layout }) => {

  if (!layout || !layout.rows || !layout.cols || !layout.seats?.length) {
    console.warn("⚠️ layout không hợp lệ hoặc không có seat.");
    return <Typography color="error">Không có dữ liệu sơ đồ ghế.</Typography>;
  }

  const { rows, cols, seats } = layout;

  const seatMatrix = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  seats.forEach((seat) => {
    const rowIndex = seat.row - 1;
    const colIndex = seat.col - 1;
    if (rowIndex < rows && colIndex < cols) {
      seatMatrix[rowIndex][colIndex] = seat;
    }
  });

  // 🔹 Tính tổng số ghế hợp lệ (seatId !== "none")
  const validSeats = seats.filter((s) => s.seatId !== "none");

  // 🔹 Gom nhóm area theo màu và giá để làm chú thích
  const legendMap = {};
  validSeats.forEach((seat) => {
    const key = `${seat.area}-${seat.color}-${seat.price}`;
    if (!legendMap[key]) {
      legendMap[key] = {
        area: seat.area,
        color: seat.color,
        price: seat.price,
      };
    }
  });

  const legends = Object.values(legendMap);

  return (
    <Box mt={2}>
      <Typography fontSize={18} fontWeight={600} gutterBottom>
        Sơ đồ ghế ngồi
      </Typography>

      <Typography fontSize={15} gutterBottom>
        Tổng số ghế: <strong>{validSeats.length}</strong>
      </Typography>

      {/* 🔹 Chú thích các loại ghế */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        {legends.map((item, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={1}
            mb={1}
            sx={{ px: 1, py: 0.5, borderRadius: 1, border: "1px solid #ccc" }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                backgroundColor: item.color,
                borderRadius: 0.5,
                border: "1px solid #aaa",
              }}
            />
            <Typography fontSize={13}>
              {item.area} – {formatPrice(item.price)}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box component={Paper} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 40px)`,
            gap: 1,
          }}
        >
          {seatMatrix.flatMap((row, rowIndex) =>
            row.map((seat, colIndex) => {
              const isNone = !seat || seat.seatId === "none";

              return (
                <Box
                  key={`seat-${rowIndex}-${colIndex}`}
                  sx={{
                    width: 40,
                    height: 40,
                    textAlign: "center",
                    fontSize: 13,
                    borderRadius: 1,
                    backgroundColor: isNone
                      ? "transparent"
                      : seat?.color || "#ccc",
                    border: isNone ? "" : "1px solid #ccc",
                    color: isNone ? "transparent" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {seat?.seatId !== "none" ? seat.label : ""}

                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
};

ZoneSeatViewer.propTypes = {
  layout: PropTypes.shape({
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    seats: PropTypes.arrayOf(
      PropTypes.shape({
        row: PropTypes.number.isRequired,
        col: PropTypes.number.isRequired,
        seatId: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        area: PropTypes.string,
        price: PropTypes.number,
        color: PropTypes.string,
      })
    ).isRequired,
  }),
};

export default ZoneSeatViewer;

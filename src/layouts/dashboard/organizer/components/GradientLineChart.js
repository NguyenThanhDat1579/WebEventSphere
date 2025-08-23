import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import Chart from "chart.js/auto";
import SelectMenu from "../OrganizerCreateNewEvent/components/SelectMenu";

const GradientLineChart = ({
  title,
  description,
  dataByDay,
  dataByMonth,
  dataByYear,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [filter, setFilter] = useState("day");
  const [chartData, setChartData] = useState(null);

  // Convert object to chart.js format
  const convertData = (dataObj) => {
     let labels = Object.keys(dataObj);   // dùng let thay vì const
    let values = Object.values(dataObj); // dùng let thay vì const

    if (labels.length === 1) {
      // Nếu muốn điểm nằm ở cuối trục X
      labels = ["", ...labels];
      values = [0, ...values];
    }
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu (₫)",
          data: values,
          fill: true,
          borderColor: "#42A5F5",
          backgroundColor: "rgba(66, 165, 245, 0.2)",
          tension: 0.3,
        },
      ],
    };
  };

  // Format numbers like 1000000 => 1,000,000
  const formatCurrency = (value) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  useEffect(() => {
    // Chọn đúng dữ liệu theo filter
    let selectedData;
    if (filter === "day") selectedData = dataByDay;
    else if (filter === "month") selectedData = dataByMonth;
    else selectedData = dataByYear;

    const formattedData = convertData(selectedData);
    setChartData(formattedData);
  }, [filter, dataByDay, dataByMonth, dataByYear]);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => formatCurrency(value),
            },
          },
        },
      },
    });
  }, [chartData]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom mt={2}>
          {title}
        </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <FormControl sx={{ minWidth: 170 }}>
            <SelectMenu
            label="Lọc theo thời gian"
            value={filter}
            onChange={(val) => setFilter(val)}
            options={[
                { label: "Theo ngày", value: "day" },
                { label: "Theo tháng", value: "month" },
                { label: "Theo năm", value: "year" },
            ]}
            />
        </FormControl>
        </Box>

        <canvas ref={chartRef} style={{ marginTop: 24 }} />
      </CardContent>
    </Card>
  );
};

GradientLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  dataByDay: PropTypes.object.isRequired,
  dataByMonth: PropTypes.object.isRequired,
  dataByYear: PropTypes.object.isRequired,
};

export default GradientLineChart;

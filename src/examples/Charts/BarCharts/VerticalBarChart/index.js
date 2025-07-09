import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";

// MUI
import Card from "@mui/material/Card";

// Argon Dashboard components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Base theme
import colors from "assets/theme/base/colors";

// Chart.js auto register
import Chart from "chart.js/auto";

// Gradient function
const createGradient = (ctx, area) => {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, "#42a5f5");  // light blue
  gradient.addColorStop(1, "#1e88e5");  // darker blue
  return gradient;
};

function VerticalBarChart({ title, description, height, chart }) {
const chartData = useMemo(() => {
  const datasets = chart.datasets.map((dataset) => ({
    ...dataset,
    backgroundColor: (context) => {
      const { ctx, chartArea } = context.chart;
      if (!chartArea) return "#42a5f5";
      return createGradient(ctx, chartArea);
    },
    borderRadius: {
      topLeft: 12,   // ✅ Bo tròn góc trên trái
      topRight: 12,  // ✅ Bo tròn góc trên phải
      bottomLeft: 0,
      bottomRight: 0,
    },
    borderSkipped: "bottom",  // ✅ Chỉ bỏ bo ở đáy (để bo trên)
    barThickness: 60,
    hoverBackgroundColor: "#1976d2",
  }));

  return {
    labels: chart.labels,
    datasets,
  };
}, [chart]);


  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#ccc",
        borderWidth: 1,
        cornerRadius: 6,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 13, weight: "600" },
          color: "#333",
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: { size: 13 },
          color: "#666",
        },
        grid: {
          color: "#e0e0e0",
          borderDash: [4, 4],
        },
      },
    },
  }), []);

  return (
    <Card>
      <ArgonBox p={2}>
        {(title || description) && (
          <ArgonBox px={description ? 1 : 0} pt={description ? 1 : 0}>
            {title && (
              <ArgonBox mb={1}>
                <ArgonTypography variant="h6">{title}</ArgonTypography>
              </ArgonBox>
            )}
            {description && (
              <ArgonBox mb={2}>
                <ArgonTypography component="div" variant="button" fontWeight="regular" color="text">
                  {description}
                </ArgonTypography>
              </ArgonBox>
            )}
          </ArgonBox>
        )}
        <ArgonBox height={height}>
          <Bar data={chartData} options={chartOptions} />
        </ArgonBox>
      </ArgonBox>
    </Card>
  );
}

VerticalBarChart.defaultProps = {
  title: "",
  description: "",
  height: "19.125rem",
};

VerticalBarChart.propTypes = {
  title: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  chart: PropTypes.shape({
    labels: PropTypes.array,
    datasets: PropTypes.array,
  }).isRequired,
};

export default VerticalBarChart;

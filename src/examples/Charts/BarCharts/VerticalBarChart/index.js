import { useMemo } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";

// MUI
import Card from "@mui/material/Card";

// Argon Dashboard components
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";

// Chart.js auto register
import Chart from "chart.js/auto";

// Gradient function
const createGradient = (ctx, area) => {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, "#42a5f5");
  gradient.addColorStop(1, "#1e88e5");
  return gradient;
};

function VerticalBarChart({ title, description, height, chart }) {
  const chartData = useMemo(() => {
    const datasets = chart.datasets.map((dataset) => {
      const isProfit = dataset.label.toLowerCase().includes("lợi nhuận");
      const axisId = isProfit ? "profit" : "revenue";

      return {
        ...dataset,
        yAxisID: axisId,
        backgroundColor: isProfit
          ? "#4CAF50"
          : (context) => {
              const { ctx, chartArea } = context.chart;
              if (!chartArea) return "#42a5f5";
              return createGradient(ctx, chartArea);
            },
        borderRadius: {
          topLeft: 12,
          topRight: 12,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: "bottom",
        barThickness: 60,
      };
    });

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
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            return `${label}: ${value.toLocaleString()} VND`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: { size: 13, weight: "600" },
          color: "#333",
        },
        grid: { display: false },
      },
      revenue: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        suggestedMax: Math.ceil(
          Math.max(...chart.datasets
            .filter((d) => !d.label.toLowerCase().includes("lợi nhuận"))
            .flatMap((d) => d.data)) * 1.2
        ),
        ticks: {
          color: "#1e88e5",
          font: { size: 13 },
        },
        grid: {
          color: "#e0e0e0",
          borderDash: [4, 4],
        },
      },
     profit: {
  type: "linear",
  position: "right",
  beginAtZero: true,
  suggestedMax: Math.ceil(
    Math.max(...chart.datasets
      .filter((d) => d.label.toLowerCase().includes("lợi nhuận"))
      .flatMap((d) => d.data)) * 2  // tăng ít hơn doanh thu
  ),

        ticks: {
          color: "#4CAF50",
          font: { size: 13 },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }), [chart]);

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

// LineChartDualAxis.js
import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
ChartJS.register(zoomPlugin);
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const LineChartDualAxis = ({ labels, revenueData, ticketData }) => {
  const chartRef = useRef(null);
  const [hiddenDatasets, setHiddenDatasets] = useState({});

  const firstRevenueIndex = revenueData.findIndex((value) => value > 0);
  const minIndex = Math.max(0, firstRevenueIndex - 1); // 👉 lấy trước 1 nếu có
  const maxIndex = Math.min(minIndex + 9, labels.length - 1); // giữ 10 điểm

  const data = {
    labels,
    datasets: [
      {
        label: "Doanh thu",
        data: revenueData,
        yAxisID: "yLeft",
        borderColor: "#2DCE89",
        backgroundColor: "#2DCE89",
        fill: false,
        tension: 0.4,
        pointRadius: revenueData.map((value) => (value > 0 ? 4 : 0)),
        pointHoverRadius: revenueData.map((value) => (value > 0 ? 6 : 0)),
        hidden: hiddenDatasets[0] || false,
      },
      {
        label: "Số vé bán",
        data: ticketData,
        yAxisID: "yRight",
        borderColor: "#17CEF0",
        backgroundColor: "#17CEF0",
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,

        hidden: hiddenDatasets[1] || false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.01,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          limits: {
            x: { min: 0, max: labels.length - 1 }, // Giới hạn trục X trong phạm vi dữ liệu
            minRange: 3, // 👈 ít nhất hiển thị 3 điểm khi zoom
            maxRange: 15, // 👈 không cho zoom quá rộng hơn 15 điểm
          },
        },
      },
    },
    layout: {
      padding: {
        top: 0,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#666",
          maxRotation: 45,
          minRotation: 30,
        },
        min: minIndex,
        max: maxIndex,
      },
      yLeft: {
        display: true,
        beginAtZero: true,
        position: "left",
        ticks: {
          color: "#2DCE89",
          callback: (value) => value.toLocaleString(),
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      yRight: {
        display: true,
        beginAtZero: true,
        position: "right",
        ticks: {
          color: "#17CEF0",
          callback: (value) => value.toLocaleString(),
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const handleLegendClick = (index) => {
    const chart = chartRef.current;
    if (!chart) return;

    // Toggle trạng thái hidden
    const meta = chart.getDatasetMeta(index);
    const currentlyHidden = !!hiddenDatasets[index];

    meta.hidden = !currentlyHidden;
    chart.update();

    setHiddenDatasets((prev) => ({
      ...prev,
      [index]: !currentlyHidden,
    }));
  };

  return (
    <div style={{ width: "100%" }}>
      {/* 🔘 Custom Legend */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 20,
          padding: "8px 0",
          flexWrap: "wrap",
        }}
      >
        {data.datasets.map((ds, index) => (
          <div
            key={index}
            onClick={() => handleLegendClick(index)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              userSelect: "none",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: ds.borderColor,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#333",
                textDecoration: hiddenDatasets[index] ? "line-through" : "none",
              }}
            >
              {ds.label}
            </span>
          </div>
        ))}
      </div>

      {/* 📈 Chart */}
      <div style={{ height: "600px" }}>
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
};

LineChartDualAxis.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  revenueData: PropTypes.arrayOf(PropTypes.number).isRequired,
  ticketData: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default LineChartDualAxis;

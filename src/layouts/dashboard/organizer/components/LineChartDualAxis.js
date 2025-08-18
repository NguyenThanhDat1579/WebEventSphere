import React, { useRef, useState, useMemo } from "react";
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
import dayjs from "dayjs";

ChartJS.register(zoomPlugin);
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

// 🔧 Hàm xử lý dữ liệu từ event
const buildLineChartDataFromEvent = (event) => {
  const revenueByDay = event?.revenueByDay || {};
  const ticketByDay = event?.ticketByDay || {};
  const timeStart = event?.timeStart;
  const timeEnd = event?.timeEnd;

  if (!timeStart || !timeEnd) return { labels: [], revenueData: [], ticketData: [] };

  const start = dayjs(timeStart);
  const end = dayjs(timeEnd);

  const labels = [];
  const revenueData = [];
  const ticketData = [];

  for (
    let current = start;
    current.isBefore(end) || current.isSame(end, "day");
    current = current.add(1, "day")
  ) {
    const dateKey = current.format("YYYY-MM-DD");
    labels.push(current.format("DD/MM"));
    revenueData.push(revenueByDay[dateKey] || 0);
    ticketData.push(ticketByDay[dateKey] || 0);
  }

  return { labels, revenueData, ticketData };
};

const LineChartDualAxis = ({ event }) => {
  const chartRef = useRef(null);
  const [hiddenDatasets, setHiddenDatasets] = useState({});

  // ✅ Memo hóa dữ liệu để không re-calculate mỗi render
  const { labels, revenueData, ticketData } = useMemo(() => buildLineChartDataFromEvent(event), [event]);

  const firstRevenueIndex = revenueData.findIndex((value) => value > 0);
  const minIndex = Math.max(0, firstRevenueIndex - 1);
  const maxIndex = Math.min(minIndex + 9, labels.length - 1);

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
      // {
      //   label: "Số vé bán",
      //   data: ticketData,
      //   yAxisID: "yRight",
      //   borderColor: "#17CEF0",
      //   backgroundColor: "#17CEF0",
      //   fill: false,
      //   tension: 0.4,
      //   pointRadius: 3,
      //   pointHoverRadius: 5,
      //   hidden: hiddenDatasets[1] || false,
      // },
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
            modifierKey: 'ctrl',
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
          limits: {
            x: { min: 0, max: labels.length - 1 },
            minRange: 3,
            maxRange: 15,
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
  event: PropTypes.shape({
    timeStart: PropTypes.string,
    timeEnd: PropTypes.string,
    revenueByDay: PropTypes.object,
    ticketByDay: PropTypes.object,
  }).isRequired,
};

export default React.memo(LineChartDualAxis);

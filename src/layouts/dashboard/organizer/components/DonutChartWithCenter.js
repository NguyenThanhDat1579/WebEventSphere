// DonutChartWithCenter.js
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const DonutChartWithCenter = ({ sold, locked, available }) => {
  const data = {
    labels: ["Đã bán", "Bị khoá", "Còn lại"],
    datasets: [
      {
        data: [sold, locked, available],
        backgroundColor: ["#2DCE89", "#FFA726", "#E0E0E0"],
        borderWidth: 0,
      },
    ],
  };

  const total = sold + locked + available;

  const options = {
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            const label = ctx.label || "";
            const value = ctx.parsed;
            const percent = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} vé (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ position: "relative", width: "100%", height: 220 }}>
      <Doughnut data={data} options={options} />
      <div
        style={{
          position: "absolute",
          top: "27%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: 18 }}>
          {total > 0 ? `${((sold / total) * 100).toFixed(1)}%` : "0%"}
        </div>
      </div>
    </div>
  );
};

DonutChartWithCenter.propTypes = {
  sold: PropTypes.number.isRequired,
  locked: PropTypes.number.isRequired,
  available: PropTypes.number.isRequired,
};

export default DonutChartWithCenter;

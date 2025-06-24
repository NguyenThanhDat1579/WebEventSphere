// PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ chart }) => {
  const dataset = chart?.datasets?.[0] || {};

  const data = {
    labels: chart?.labels || [],
    datasets: [
      {
        data: dataset.data || [],
        backgroundColor: dataset.backgroundColors || [],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
};

PieChart.propTypes = {
  chart: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(
      PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.number).isRequired,
        backgroundColors: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default PieChart;

import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const VideoStatsChart = ({ views, likes }) => {
  // Data for the chart
  const data = {
    labels: ["Views", "Likes"],
    datasets: [
      {
        label: "Video Statistics",
        data: [views, likes],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Options for the chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Video Statistics",
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

export default VideoStatsChart;
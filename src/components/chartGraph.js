import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const SimilarityGraph = ({ data = [], currentVideoId = '' }) => {
  // Validate and normalize data
  const validData = Array.isArray(data) ? data : [];
  
  if (validData.length === 0) {
    return (
      <div className="similarity-graph no-data">
        <p>No similarity data available</p>
      </div>
    );
  }

  // Prepare chart data with null checks
  const chartData = {
    labels: validData.map((item = {}) => {
      const videoId = item.video_id || '';
      const title = item.title || '';
      
      return videoId === currentVideoId 
        ? 'Current Video' 
        : title.substring(0, 20) + (title.length > 20 ? '...' : '');
    }),
    datasets: [{
      label: 'Similarity Score (%)',
      data: validData.map((item = {}) => Math.round((item.similarity_score || 0) * 100)),
      backgroundColor: validData.map((item = {}) => {
        const videoId = item.video_id || '';
        const score = item.similarity_score || 0;
        
        return videoId === currentVideoId 
          ? '#4CAF50' 
          : score > 0.7 
            ? 'rgba(75, 192, 192, 0.6)' 
            : score > 0.4 
              ? 'rgba(255, 206, 86, 0.6)' 
              : 'rgba(255, 99, 132, 0.6)';
      }),
      borderColor: validData.map((item = {}) => {
        const videoId = item.video_id || '';
        const score = item.similarity_score || 0;
        
        return videoId === currentVideoId 
          ? '#388E3C' 
          : score > 0.7 
            ? 'rgba(75, 192, 192, 1)' 
            : score > 0.4 
              ? 'rgba(255, 206, 86, 1)' 
              : 'rgba(255, 99, 132, 1)';
      }),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}% similarity`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Similarity Percentage'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Videos'
        }
      }
    }
  };

  return (
    <div className="similarity-graph">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SimilarityGraph;
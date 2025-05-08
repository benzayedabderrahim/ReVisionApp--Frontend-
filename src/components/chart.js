// RelatedVideosChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags, faAlignLeft, faHeading, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);

const RelatedVideosChart = ({ videos, currentVideo, onVideoClick }) => {
  const data = {
    labels: videos.map(v => v.title.length > 20 ? v.title.substring(0, 20) + '...' : v.title),
    datasets: [
      {
        label: 'Title Match',
        data: videos.map(v => v.match_breakdown?.title || 0),
        backgroundColor: '#4CAF50',
        stack: 'stack1'
      },
      {
        label: 'Content Match',
        data: videos.map(v => v.match_breakdown?.content || 0),
        backgroundColor: '#2196F3',
        stack: 'stack1'
      },
      {
        label: 'Tags Match',
        data: videos.map(v => v.match_breakdown?.tags || 0),
        backgroundColor: '#FFC107',
        stack: 'stack1'
      },
      {
        label: 'Category Match',
        data: videos.map(v => v.match_breakdown?.category || 0),
        backgroundColor: '#9C27B0',
        stack: 'stack1'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const video = videos[context.dataIndex];
            return [
              `Total Match: ${video.match_percentage}%`,
              `Title: ${video.match_breakdown?.title || 0}%`,
              `Content: ${video.match_breakdown?.content || 0}%`,
              `Tags: ${video.match_breakdown?.tags || 0}%`,
              `Category: ${video.match_breakdown?.category || 0}%`
            ];
          }
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        max: 100
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedVideo = videos[elements[0].index];
        if (clickedVideo.video_id !== currentVideo.video_id) {
          onVideoClick(clickedVideo);
        }
      }
    }
  };

  return (
    <div className="related-videos-analysis">
      <div className="matching-breakdown">
        <h5>Matching Factors:</h5>
        <div className="factors-list">
          <div className="factor">
            <FontAwesomeIcon icon={faHeading} className="factor-icon" />
            <span>Title Similarity</span>
          </div>
          <div className="factor">
            <FontAwesomeIcon icon={faAlignLeft} className="factor-icon" />
            <span>Content Similarity</span>
          </div>
          <div className="factor">
            <FontAwesomeIcon icon={faTags} className="factor-icon" />
            <span>Tags Match</span>
          </div>
          <div className="factor">
            <FontAwesomeIcon icon={faLayerGroup} className="factor-icon" />
            <span>Category Match</span>
          </div>
        </div>
      </div>
      
      <div className="related-videos-chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RelatedVideosChart;
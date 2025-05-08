import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faThumbsUp, 
  faComment,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

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

const VideoDetail = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [similarVideos, setSimilarVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similarityLoading] = useState(false)
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [videoRes, commentsRes, similarRes] = await Promise.all([
          axios.get(`/api/videos/${videoId}/`),
          axios.get(`/api/videos/${videoId}/comments/`),
          axios.get(`/api/videos/${videoId}/similar/`)
        ]);

        setVideo(videoRes.data.video || null);
        setComments(commentsRes.data.comments || []);
        setSimilarVideos(similarRes.data.similar_videos || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load video data');
        console.error('Error fetching video data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  if (loading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Loading video data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!video) {
    return <div className="no-video">Video not found</div>;
  }

  return (
    <div className="video-detail-container">
      <div className="video-player">
        <iframe
          src={`https://www.youtube.com/embed/${video.video_id}`}
          title={video.title || 'YouTube video'}
          frameBorder="0"
          allowFullScreen
        />
      </div>

      <div className="video-info">
        <h1>{video.title || 'Untitled Video'}</h1>
        <div className="video-stats">
          <span>
            <FontAwesomeIcon icon={faEye} /> {video.views?.toLocaleString() || 0} views
          </span>
          <span>
            <FontAwesomeIcon icon={faThumbsUp} /> {video.likes?.toLocaleString() || 0} likes
          </span>
          <span>
            <FontAwesomeIcon icon={faComment} /> {video.comments_count?.toLocaleString() || 0} comments
          </span>
        </div>
      </div>

      <div className="similarity-section">
        <h2>Similar Videos Analysis</h2>
        {similarityLoading ? (
          <div className="loading">
            <FontAwesomeIcon icon={faSpinner} spin /> Loading similarity data...
          </div>
        ) : (
          <SimilarityGraph 
            data={similarVideos} 
            currentVideoId={video.video_id} 
          />
        )}

        <div className="similar-videos-list">
          {similarVideos.length > 0 ? (
            similarVideos
              .filter(v => v.video_id !== video.video_id)
              .map(similarVideo => (
                <div key={similarVideo.video_id} className="similar-video-card">
                  <img 
                    src={similarVideo.thumbnail} 
                    alt={similarVideo.title || 'Video thumbnail'}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x170?text=No+Thumbnail';
                    }}
                  />
                  <div className="video-details">
                    <h3>{similarVideo.title || 'Untitled Video'}</h3>
                    <div className="similarity-score">
                      {Math.round((similarVideo.similarity_score || 0) * 100)}% similar
                    </div>
                    <div className="video-metrics">
                      <span>{similarVideo.views?.toLocaleString() || 0} views</span>
                      <span>{similarVideo.likes?.toLocaleString() || 0} likes</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="no-similar-videos">
              No similar videos found
            </div>
          )}
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {comments.length > 0 ? (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <p className="comment-text">{comment.text}</p>
                <div className="comment-meta">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {new Date(comment.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No comments available for this video</p>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;
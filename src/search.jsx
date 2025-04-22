import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./components/videoplayer";
import CommentsList from "./components/comments";
import VideoStatsChart from "./components/chart";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faEye, 
  faThumbsUp, 
  faComment,
  faThumbsDown,
  faMeh
} from "@fortawesome/free-solid-svg-icons";
import "./components/css/search.css";

const SentimentChart = ({ positive, negative, neutral }) => {
  const total = positive + negative + neutral;
  return (
    <div className="sentiment-chart">
      <h4>Comment Sentiment Analysis</h4>
      <div className="chart-container">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color positive"></span>
            <span>
              <FontAwesomeIcon icon={faThumbsUp} /> Positive: {positive} ({total > 0 ? Math.round((positive / total) * 100) : 0}%)
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-color negative"></span>
            <span>
              <FontAwesomeIcon icon={faThumbsDown} /> Negative: {negative} ({total > 0 ? Math.round((negative / total) * 100) : 0}%)
            </span>
          </div>
          <div className="legend-item">
            <span className="legend-color neutral"></span>
            <span>
              <FontAwesomeIcon icon={faMeh} /> Neutral: {neutral} ({total > 0 ? Math.round((neutral / total) * 100) : 0}%)
            </span>
          </div>
        </div>
        <div className="chart-visual">
          <div 
            className="chart-segment positive" 
            style={{ width: `${total > 0 ? (positive / total) * 100 : 0}%` }}
            title={`Positive: ${positive}`}
          ></div>
          <div 
            className="chart-segment negative" 
            style={{ width: `${total > 0 ? (negative / total) * 100 : 0}%` }}
            title={`Negative: ${negative}`}
          ></div>
          <div 
            className="chart-segment neutral" 
            style={{ width: `${total > 0 ? (neutral / total) * 100 : 0}%` }}
            title={`Neutral: ${neutral}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

const Search = () => {
  const [prompt, setPrompt] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentChart, setSentimentChart] = useState(null);

  useEffect(() => {
    fetchRandomVideos();
  }, []);

  const fetchRandomVideos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/videos/random/");
      setVideos(response.data.videos || []);
    } catch (err) {
      setError("Failed to fetch high-quality videos. Please try again.");
      console.error("Random videos error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setError("");
    setIsLoading(true);
    if (!prompt.trim()) {
      fetchRandomVideos();
      return;
    }
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/videos/", { prompt });
      setVideos(response.data.videos || []);
    } catch (err) {
      setError("Failed to fetch videos. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeYoutubeUrl = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
  
    setIsLoading(true);
    setError("");
    setSentimentChart(null);
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/analyze-youtube/',
        { url: youtubeUrl },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log("Analysis results:", response.data);
      setVideos([response.data.video]);
      setComments(response.data.comments || []);
      setSelectedVideo(response.data.video);
      
      if (response.data.video.sentiment_chart) {
        setSentimentChart(`data:image/png;base64,${response.data.video.sentiment_chart}`);
      }
      
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        code: err.code
      });
      setError(err.response?.data?.error || "Failed to analyze YouTube video. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoClick = async (video) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/videos/${video.video_id}/comments/`
      );
      setComments(response.data.comments || []);
      setSelectedVideo(video);
      setSentimentChart(null);
    } catch (err) {
      setError("Failed to load comments. Please try again.");
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedVideo(null);
    setComments([]);
    setSentimentChart(null);
  };

  const getPositivityPercentage = (video) => {
    if (!video.comments_count || video.comments_count === 0) return 0;
    return Math.round((video.positive_comments_count / video.comments_count) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 70) return "#4CAF50";
    if (percentage >= 50) return "#FFC107";
    return "#F44336";
  };

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <div className="search-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand href="/home">RE'VISION</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/home">Home</Nav.Link>
              <NavDropdown title="Categories" id="basic-nav-dropdown">
                <NavDropdown.Item href="/alg">Algorithm</NavDropdown.Item>
                <NavDropdown.Item href="/p">Programming Languages</NavDropdown.Item>
                <NavDropdown.Item href="/db">Databases</NavDropdown.Item>
                <NavDropdown.Item href="/dl">Deep Learning</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout}>Log Out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search for high-quality videos..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="youtube-analyzer">
        <input
          type="text"
          className="youtube-input"
          placeholder="Or paste a YouTube URL to analyze..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <button className="analyze-button" onClick={analyzeYoutubeUrl}>
          Analyze
        </button>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading high-quality videos...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {selectedVideo ? (
        <div className="video-player-container">
          <button className="back-button" onClick={handleBack}>
            &larr; Back to Videos
          </button>
          
          <VideoPlayer url={selectedVideo.embedded_link} />
          
          <div className="video-details">
            <h3>{selectedVideo.title}</h3>
            <div className="video-metrics">
              <span><FontAwesomeIcon icon={faEye} /> {selectedVideo.views?.toLocaleString() || 'N/A'}</span>
              <span><FontAwesomeIcon icon={faThumbsUp} /> {selectedVideo.likes?.toLocaleString() || 'N/A'}</span>
              <span><FontAwesomeIcon icon={faComment} /> {selectedVideo.comments_count?.toLocaleString() || '0'}</span>
            </div>
          </div>

          <div className="sentiment-analysis-section">
            {sentimentChart ? (
              <div className="sentiment-chart-container">
                <img src={sentimentChart} alt="Sentiment Analysis Chart" />
              </div>
            ) : (
              <SentimentChart 
                positive={selectedVideo.positive_comments_count || 0}
                negative={selectedVideo.negative_comments_count || 0}
                neutral={selectedVideo.neutral_comments_count || 0}
              />
            )}
          </div>

          <div className="comments-section">
            <h4>Community Feedback:</h4>
            {comments.length > 0 ? (
              <CommentsList comments={comments} />
            ) : (
              <p>No comments available for this video.</p>
            )}
          </div>

          <div className="video-stats-chart">
            <VideoStatsChart
              views={selectedVideo.views || 0}
              likes={selectedVideo.likes || 0}
              positiveComments={selectedVideo.positive_comments_count || 0}
              negativeComments={selectedVideo.negative_comments_count || 0}
            />
          </div>
        </div>
      ) : (
        <div className="video-list">
          {videos.length > 0 ? (
            videos.map((video) => {
              const positivityPercentage = getPositivityPercentage(video);
              const isHighQuality = positivityPercentage >= 70;

              return (
                <div
                  key={video.video_id}
                  className={`video-item ${isHighQuality ? 'high-quality' : ''}`}
                  onClick={() => handleVideoClick(video)}
                >
                  {isHighQuality && (
                    <div className="quality-badge">
                      <FontAwesomeIcon icon={faCheckCircle} /> Highly Positive
                    </div>
                  )}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="video-thumbnail"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x170?text=No+Thumbnail';
                    }}
                  />
                  <div className="video-info">
                    <h4 className="video-title">{video.title}</h4>
                    <div className="video-stats">
                      <span><FontAwesomeIcon icon={faEye} /> {video.views?.toLocaleString() || 'N/A'}</span>
                      <span><FontAwesomeIcon icon={faThumbsUp} /> {video.likes?.toLocaleString() || 'N/A'}</span>
                      <span className="positivity-percentage">
                        {positivityPercentage}% positive
                      </span>
                    </div>
                    <div className="positivity-meter">
                      <div
                        className="positivity-bar"
                        style={{
                          width: `${positivityPercentage}%`,
                          backgroundColor: getScoreColor(positivityPercentage),
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            !isLoading && (
              <div className="no-videos">
                <p>No high-quality videos found.</p>
                <button className="retry-button" onClick={fetchRandomVideos}>
                  Try Again
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
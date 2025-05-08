import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faEye,
  faThumbsUp,
  faComment,
  faLink,
  faSearch,
  faArrowLeft,
  faSpinner,
  faPercentage,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

const VideoGraph = ({ videoId, data }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!videoId || !data) return;

    // Create nodes
    const nodes = new DataSet([
      // Main video (center node)
      {
        id: videoId,
        label: "Selected Video",
        shape: "circularImage",
        image: data.nodes.find(n => n.id === videoId)?.image || "https://via.placeholder.com/150?text=No+Thumb",
        size: 30,
        color: {
          border: "#4361ee",
          background: "#4361ee",
          highlight: {
            border: "#4361ee",
            background: "#4895ef"
          }
        },
        font: {
          color: "#fff",
          size: 14,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#1b263b"
        }
      },
      // Similar videos
      ...data.nodes.filter(n => n.id !== videoId).map(node => ({
        id: node.id,
        label: node.label,
        title: node.title,
        shape: "circularImage",
        image: node.image,
        size: 25,
        color: {
          border: "#3a0ca3",
          background: "#3a0ca3",
          highlight: {
            border: "#3a0ca3",
            background: "#7209b7"
          }
        },
        font: {
          color: "#fff",
          size: 12,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#1b263b"
        }
      }))
    ]);

    // Create edges
    const edges = new DataSet(
      data.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        width: 2 + (edge.value / 25),
        color: {
          color: edge.color,
          highlight: edge.color,
          hover: edge.color
        },
        smooth: {
          type: "curvedCW",
          roundness: 0.2
        },
        font: {
          color: "#1b263b",
          size: 12,
          face: "arial",
          strokeWidth: 2,
          strokeColor: "#ffffff"
        }
      }))
    );

    // Network options
    const options = {
      nodes: {
        shadow: true,
        shapeProperties: {
          useBorderWithImage: true
        }
      },
      edges: {
        arrows: {
          to: {
            enabled: false
          }
        },
        selectionWidth: 2,
        hoverWidth: 2
      },
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4
        },
        solver: "forceAtlas2Based",
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        hideEdgesOnDrag: true,
        multiselect: true,
        navigationButtons: true
      }
    };

    // Initialize network
    const network = new Network(containerRef.current, { nodes, edges }, options);

    // Center on the main video
    network.focus(videoId, {
      scale: 1.2,
      animation: {
        duration: 1000,
        easingFunction: "easeInOutQuad"
      }
    });

    return () => network.destroy();
  }, [videoId, data]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "600px",
        width: "100%",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}
    />
  );
};

const VideoDetail = ({ video, onBack }) => {
  const [comments, setComments] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(null);
  const [graphError, setGraphError] = useState(null);

  const getPositivityPercentage = useCallback(() => {
    const positive = video.positive_comments_count || 0;
    const neutral = video.comments_count - positive || 0;
    const totalAnalyzed = positive + neutral;
    return totalAnalyzed > 0 ? Math.round((positive / totalAnalyzed) * 100) : 0;
  }, [video]);

  const getScoreColor = (percentage) => {
    if (percentage >= 70) return "#4cc9f0";
    if (percentage >= 50) return "#f8961e";
    return "#f94144";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setCommentsError(null);
        setGraphError(null);

        const [commentsResponse, graphResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/videos/${video.video_id}/comments/`).catch(err => {
            setCommentsError("Couldn't load comments. YouTube comments may be disabled for this video.");
            return { data: { comments: [] } };
          }),
          axios.get(`http://127.0.0.1:8000/api/videos/${video.video_id}/graph/`).catch(err => {
            setGraphError("Couldn't load video relationships. Showing alternative videos instead.");
            return axios.get('http://127.0.0.1:8000/api/videos/random/').then(res => {
              const fallbackVideos = res.data.videos || [];
              return {
                data: {
                  nodes: [
                    {
                      id: video.video_id,
                      label: video.title,
                      image: video.thumbnail,
                      title: video.title
                    },
                    ...fallbackVideos.slice(0, 5).map(v => ({
                      id: v.video_id,
                      label: v.title,
                      image: v.thumbnail,
                      title: v.title
                    }))
                  ],
                  edges: fallbackVideos.slice(0, 5).map(v => ({
                    from: video.video_id,
                    to: v.video_id,
                    label: "50%",
                    value: 50,
                    color: "#f8961e"
                  }))
                }
              };
            });
          })
        ]);

        setComments(commentsResponse.data.comments || []);
        setGraphData(graphResponse.data);
      } catch (err) {
        setCommentsError("An unexpected error occurred while loading comments.");
        setGraphError("An unexpected error occurred while loading video relationships.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [video.video_id]);

  return (
    <div className="video-detail-container">
      <button onClick={onBack} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Back to videos
      </button>
      
      <div className="video-player-section">
        <iframe
          src={video.embedded_link}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        ""
        <div className="video-metadata">
          <h2>{video.title}</h2>
          <div className="stats">
            <span><FontAwesomeIcon icon={faEye} /> {video.views?.toLocaleString() || '0'} views</span>
            <span><FontAwesomeIcon icon={faThumbsUp} /> {video.likes?.toLocaleString() || '0'} likes</span>
            <span><FontAwesomeIcon icon={faComment} /> {video.comments_count?.toLocaleString() || '0'} comments</span>
            <span style={{ color: getScoreColor(getPositivityPercentage()) }}>
              <FontAwesomeIcon icon={faPercentage} /> {getPositivityPercentage()}% positive
            </span>
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faLink} /> Watch on YouTube
            </a>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-section">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading video details...</p>
        </div>
      ) : (
        <>
          <div className="comments-section">
            <h3>Top Positive Comments</h3>
            {commentsError ? (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} /> {commentsError}
              </div>
            ) : comments.length > 0 ? (
              <ul className="comments-list">
                {comments.slice(0, 5).map(comment => (
                  <li key={comment.id || comment.comment_id} className="comment">
                    <p>{comment.text}</p>
                    <div className="comment-meta">
                      <span>By {comment.author}</span>
                      <span>{comment.like_count || comment.likes} likes</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No positive comments available</p>
            )}
          </div>
          
          <div className="graph-section">
            <h3>Video Relationship Network</h3>
            {graphError && (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} /> {graphError}
              </div>
            )}
            {graphData && (
              <VideoGraph 
                videoId={video.video_id} 
                data={graphData} 
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const Search = () => {
  const [prompt, setPrompt] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [debouncedPrompt, setDebouncedPrompt] = useState("");

  const processVideoData = useCallback((videos) => {
    return videos.map(video => {
      const positive = video.positive_comments_count || 0;
      const neutral = video.comments_count - positive || 0;
      const positivityPercentage = positive + neutral > 0 ? 
        Math.round((positive / (positive + neutral)) * 100) : 0;

      return {
        ...video,
        positive_comments_count: positive,
        neutral_comments_count: neutral,
        positivity_percentage: positivityPercentage
      };
    });
  }, []);

  const fetchRandomVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/videos/random/");
      const processedVideos = processVideoData(response.data.videos || []);
      setVideos(processedVideos);
      setError("");
    } catch (err) {
      setError("Failed to fetch high-quality videos. Please try again.");
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [processVideoData]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedPrompt(prompt);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [prompt]);

  useEffect(() => {
    if (!searchMode) {
      fetchRandomVideos();
    }
  }, [searchMode, fetchRandomVideos]);

  const handleSearch = useCallback(async () => {
    if (!debouncedPrompt.trim()) {
      setSearchMode(false);
      fetchRandomVideos();
      return;
    }

    setError("");
    setIsLoading(true);
    setSearchMode(true);
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/videos/", { 
        prompt: debouncedPrompt,
        quick_mode: true
      });
      
      const processedVideos = processVideoData(response.data.videos || []);
      setVideos(processedVideos);
      
      if (processedVideos.length < 20) {
        setError(`Found ${processedVideos.length} videos (showing all available)`);
      }
    } catch (err) {
      setError("Failed to fetch videos. Please try a different search term.");
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedPrompt, fetchRandomVideos, processVideoData]);

  const analyzeYoutubeUrl = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }
  
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/analyze-youtube/',
        { url: youtubeUrl }
      );
      
      if (response.data.video) {
        const processedVideo = processVideoData([response.data.video])[0];
        setVideos([processedVideo]);
        setSelectedVideo(processedVideo);
      } else {
        setError("No video data returned from analysis");
        setVideos([]);
        setSelectedVideo(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze YouTube video. Please check the URL and try again.");
      setVideos([]);
      setSelectedVideo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video || null);
  };

  const handleBack = () => {
    setSelectedVideo(null);
  };

  const handleBackToSearch = () => {
    setSearchMode(false);
    setPrompt("");
    fetchRandomVideos();
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 70) return "#4cc9f0";
    if (percentage >= 50) return "#f8961e";
    return "#f94144";
  };

  return (
    <div className="search-container">
      {selectedVideo ? (
        <VideoDetail video={selectedVideo} onBack={handleBack} />
      ) : (
        <>
          <div className="search-controls">
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
                <FontAwesomeIcon icon={faSearch} /> Search
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

            {searchMode && (
              <button className="back-to-trending" onClick={handleBackToSearch}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back to Trending Videos
              </button>
            )}
          </div>

          {isLoading && (
            <div className="loading-indicator">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Loading videos...</p>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="video-list">
            {videos.length > 0 ? (
              videos.map((video) => {
                const positivityPercentage = video.positivity_percentage || 0;
                const isHighQuality = positivityPercentage >= 70;
                const barColor = getScoreColor(positivityPercentage);

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
                      <h4 className="video-title">{video.title || 'Untitled Video'}</h4>
                      <div className="video-stats">
                        <span><FontAwesomeIcon icon={faEye} /> {video.views?.toLocaleString() || '0'} views</span>
                        <span><FontAwesomeIcon icon={faThumbsUp} /> {video.likes?.toLocaleString() || '0'} likes</span>
                        <span className="positivity-percentage">
                          {positivityPercentage}% positive
                        </span>
                      </div>
                      <div className="positivity-meter">
                        <div
                          className="positivity-bar"
                          style={{
                            width: `${positivityPercentage}%`,
                            backgroundColor: barColor,
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
                  <p>No videos found. {searchMode ? "Try a different search term." : ""}</p>
                  <button className="retry-button" onClick={fetchRandomVideos}>
                    Show Trending Videos
                  </button>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;

// CSS Styles
const styles = `
:root {
  --primary: #4361ee;
  --secondary: #3f37c9;
  --accent: #4895ef;
  --dark: #1b263b;
  --light: #f8f9fa;
  --success: #4cc9f0;
  --danger: #f72585;
  --gray: #adb5bd;
}

.search-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.search-controls {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box, .youtube-analyzer {
  display: flex;
  margin-bottom: 1.5rem;
}

.search-input, .youtube-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
}

.search-button, .analyze-button {
  padding: 0 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: 600;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.video-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.video-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.video-info {
  padding: 1.5rem;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
}

.error-message {
  color: var(--danger);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: #fff5f5;
  border: 1px solid #ffebee;
}

.video-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.video-player-section iframe {
  width: 100%;
  height: 600px;
  border-radius: 12px;
}

.comments-section, .graph-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
}

.graph-section {
  height: 700px;
}

.quality-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--success);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.positivity-meter {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.positivity-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.back-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-to-trending {
  background: var(--gray);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .video-player-section iframe {
    height: 400px;
  }
  
  .video-list {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from "./components/videoplayer";
import CommentsList from "./components/comments";
import VideoStatsChart from "./components/chart";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faEye, faThumbsUp, faComment } from "@fortawesome/free-solid-svg-icons";
import "./components/css/search.css";

const P = () => {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [comments, setComments] = useState([]);

    const programmingLanguages = [
        { id: 'all', name: 'All Languages' },
        { id: 'python', name: 'Python' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'java', name: 'Java' },
        { id: 'php', name: 'PHP' },
        { id: 'symfony', name: 'Symfony' },
        { id: 'reactjs', name: 'ReactJS' },
        { id: 'nodejs', name: 'NodeJS' }
    ];

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get('http://127.0.0.1:8000/api/p/');
                
                if (response.data && response.data.status === 'success' && response.data.videos) {
                    // Sort videos by positive comments percentage (highest first)
                    const sortedVideos = [...response.data.videos].sort((a, b) => {
                        const aPercentage = getPositivityPercentage(a);
                        const bPercentage = getPositivityPercentage(b);
                        return bPercentage - aPercentage;
                    });
                    setVideos(sortedVideos);
                    setFilteredVideos(sortedVideos);
                } else {
                    setError(response.data?.message || 'No videos found');
                }
            } catch (err) {
                console.error("Error fetching videos:", err);
                setError(err.response?.data?.message || err.message || "Failed to load videos");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    useEffect(() => {
        if (selectedLanguage === 'all') {
            setFilteredVideos([...videos]);
        } else {
            const filtered = videos.filter(video => 
                video.title.toLowerCase().includes(selectedLanguage) ||
                (video.tags && video.tags.some(tag => tag.toLowerCase().includes(selectedLanguage)))
            );
            setFilteredVideos(filtered);
        }
    }, [selectedLanguage, videos]);

    const handleLanguageFilter = (language) => {
        setSelectedLanguage(language);
    };

    const handleVideoClick = async (video) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/videos/${video.video_id}/comments/`
            );
            setComments(response.data.comments || []);
            setSelectedVideo(video);
        } catch (err) {
            setError("Failed to load comments. Please try again.");
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedVideo(null);
        setComments([]);
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

    if (loading) {
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
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p>Loading videos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="search-container">
                <Navbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
                    {/* Same Navbar as above */}
                </Navbar>
                <div className="error-message">
                    <p>{error}</p>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

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

            {selectedVideo ? (
                <div className="video-player-container">
                    <button className="back-button" onClick={handleBack}>
                        &larr; Back to Videos
                    </button>
                    
                    <VideoPlayer url={selectedVideo.embedded_link} />
                    
                    <div className="video-details">
                        <h3>{selectedVideo.title}</h3>
                        <div className="video-metrics">
                            <span><FontAwesomeIcon icon={faEye} /> {selectedVideo.views?.toLocaleString() || '0'}</span>
                            <span><FontAwesomeIcon icon={faThumbsUp} /> {selectedVideo.likes?.toLocaleString() || '0'}</span>
                            <span className="positive-comments">
                                <FontAwesomeIcon icon={faComment} /> {selectedVideo.positive_comments_count || '0'} ({getPositivityPercentage(selectedVideo)}% positive)
                            </span>
                        </div>
                    </div>

                    <div className="comments-section">
                        <h4>Positive Community Feedback:</h4>
                        {comments.length > 0 ? (
                            <CommentsList comments={comments} />
                        ) : (
                            <p>No positive comments available for this video.</p>
                        )}
                    </div>

                    <div className="video-stats-chart">
                        <VideoStatsChart
                            views={selectedVideo.views || 0}
                            likes={selectedVideo.likes || 0}
                            positiveComments={selectedVideo.positive_comments_count || 0}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="language-filter-container">
                        {programmingLanguages.map(lang => (
                            <button
                                key={lang.id}
                                className={`language-filter-btn ${selectedLanguage === lang.id ? 'active' : ''}`}
                                onClick={() => handleLanguageFilter(lang.id)}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>

                    <div className="video-list">
                        {filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => {
                                const positivityPercentage = getPositivityPercentage(video);
                                const isHighQuality = positivityPercentage >= 70;

                                return (
                                    <div
                                        key={video.video_id || video.id}
                                        className={`video-item ${isHighQuality ? 'high-quality' : ''}`}
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        {isHighQuality && (
                                            <div className="quality-badge">
                                                <FontAwesomeIcon icon={faCheckCircle} /> Highly Positive
                                            </div>
                                        )}
                                        <img
                                            src={video.thumbnail || 'https://via.placeholder.com/300x170'}
                                            alt={video.title}
                                            className="video-thumbnail"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x170?text=No+Thumbnail';
                                            }}
                                        />
                                        <div className="video-info">
                                            <h4 className="video-title">{video.title}</h4>
                                            <div className="video-stats">
                                                <span><FontAwesomeIcon icon={faEye} /> {video.views?.toLocaleString() || '0'}</span>
                                                <span><FontAwesomeIcon icon={faThumbsUp} /> {video.likes?.toLocaleString() || '0'}</span>
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
                            <div className="no-videos">
                                <p>No {selectedLanguage === 'all' ? '' : selectedLanguage + ' '}videos found</p>
                                <button className="retry-button" onClick={() => window.location.reload()}>
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default P;
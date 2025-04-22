import React from 'react';

const SentimentChart = ({ positive, negative, neutral }) => {
    return (
        <div className="sentiment-chart">
            <h4>Comment Sentiment Analysis</h4>
            <div className="chart-container">
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-color positive"></span>
                        <span>Positive: {positive}</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color negative"></span>
                        <span>Negative: {negative}</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color neutral"></span>
                        <span>Neutral: {neutral}</span>
                    </div>
                </div>
                <div className="chart-visual">
                    <div 
                        className="chart-segment positive" 
                        style={{ width: `${(positive / (positive + negative + neutral)) * 100}%` }}
                    ></div>
                    <div 
                        className="chart-segment negative" 
                        style={{ width: `${(negative / (positive + negative + neutral)) * 100}%` }}
                    ></div>
                    <div 
                        className="chart-segment neutral" 
                        style={{ width: `${(neutral / (positive + negative + neutral)) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default SentimentChart;
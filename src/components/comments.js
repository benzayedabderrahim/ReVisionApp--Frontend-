import React from "react";
import './css/caroussel.css';


const CommentsList = ({ comments }) => {
  return (
    <div className="comments-list">
      {comments.map((comment, index) => (
        <div key={index} className="comment-item">
          {/* Standard User Icon */}
          <div className="user-icon">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXmPuDRk-foHpYeZ2MOBxC8AGj9DQwkARDNg&s" // Standard icon for all users
              alt="User"
              className="user-icon-img"
            />
          </div>

          {/* Comment Content */}
          <div className="comment-content">
            <p className="comment-text">{comment.text}</p>
            {/* Date is hidden */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
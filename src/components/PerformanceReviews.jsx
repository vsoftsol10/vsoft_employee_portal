import React, { useState } from 'react';
import './PerformanceReviews.css'; // Import the CSS file for styling

const PerformanceReviews = () => {
  // Dummy data for demonstration
  const [reviews] = useState([
    { id: 1, date: '2024-06-15', rating: 'Excellent', feedback: 'Great performance throughout the year.', goals: [{ goal: 'Complete project X', progress: '80%' }] },
    { id: 2, date: '2024-12-15', rating: 'Good', feedback: 'Met most of the targets.', goals: [{ goal: 'Improve team collaboration', progress: '60%' }] },
  ]);

  return (
    <div className="performance-reviews">
      <h2>Performance Reviews</h2>
      <div className="review-summary">
        <h3>Review Summary</h3>
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <h4>Review Date: {review.date}</h4>
            <p><strong>Rating:</strong> {review.rating}</p>
            <p><strong>Feedback:</strong> {review.feedback}</p>
            <div className="goal-tracking">
              <h5>Goals</h5>
              <ul>
                {review.goals.map((goal, index) => (
                  <li key={index}>{goal.goal} - {goal.progress}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceReviews;

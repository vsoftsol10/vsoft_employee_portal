import React from 'react';
import './Leave.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom';

const LeaveCard = ({ title, text, buttonText, link }) => (
  <div className="card w-75">
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      <p className="card-text">{text}</p>
      <Link to={link} className="btn btn-primary">{buttonText}</Link>
    </div>
  </div>
);

const Leave = () => {
  return (
    <div className="leave-container">
      <LeaveCard
        title="Planned Leave"
        text="With supporting text below as a natural lead-in to additional content."
        buttonText="Apply Leave"
        link="/apply-planned-leave" // Adjust the route as needed
      />
      <LeaveCard
        title="Emergency Leave"
        text="With supporting text below as a natural lead-in to additional content."
        buttonText="Apply Leave"
        link="/apply-emergency-leave" // Adjust the route as needed
      />
    
    </div>
  );
};

export default Leave;

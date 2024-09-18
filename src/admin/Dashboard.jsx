import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  // Default data for 5 members
  const defaultUsers = [
    { userId: 1, fullName: 'John Doe', jobRole: 'Software Engineer', email: 'john.doe@example.com' },
    { userId: 2, fullName: 'Jane Smith', jobRole: 'Product Manager', email: 'jane.smith@example.com' },
    { userId: 3, fullName: 'Alice Johnson', jobRole: 'UI/UX Designer', email: 'alice.johnson@example.com' },
    { userId: 4, fullName: 'Robert Brown', jobRole: 'DevOps Engineer', email: 'robert.brown@example.com' },
    { userId: 5, fullName: 'Emily Davis', jobRole: 'QA Engineer', email: 'emily.davis@example.com' },
  ];

  return (
    <div className="dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
         
          <Link to="/admin/directory">Attendance</Link>
          <Link to="/admin/leaverequests">leave</Link>
          <Link to="/admin/teamassignment">Teams & Groups</Link>
          <Link to="/admin/tasks">Tasks & reviews</Link>
          <Link to="/admin/payroll">Payroll</Link>
          <Link to="/admin/faqs">Messages</Link>
        </nav>
      </header>

      <div className="user-grid">
        {defaultUsers.map((user) => (
          <div className="user-card" key={user.userId}>
            <h3>{user.fullName}</h3>
            <p>{user.jobRole}</p>
            <Link to={`/user/${user.userId}`}>
              <button className="details-btn">View Details</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

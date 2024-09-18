import React from 'react';
import { useParams } from 'react-router-dom';
import './UserDetails.css';

const defaultUsers = [
  { userId: 1, fullName: 'John Doe', jobRole: 'Software Engineer', email: 'john.doe@example.com' },
  { userId: 2, fullName: 'Jane Smith', jobRole: 'Product Manager', email: 'jane.smith@example.com' },
  { userId: 3, fullName: 'Alice Johnson', jobRole: 'UI/UX Designer', email: 'alice.johnson@example.com' },
  { userId: 4, fullName: 'Robert Brown', jobRole: 'DevOps Engineer', email: 'robert.brown@example.com' },
  { userId: 5, fullName: 'Emily Davis', jobRole: 'QA Engineer', email: 'emily.davis@example.com' },
];

const UserDetails = () => {
  const { userId } = useParams();
  const user = defaultUsers.find((u) => u.userId === parseInt(userId));

  return (
    <div className="user-details">
      <header>
        <h1>User Details</h1>
      </header>

      {user ? (
        <div className="details-card">
          <h3>{user.fullName}</h3>
          <p>Job Role: {user.jobRole}</p>
          <p>Email: {user.email}</p>
          <p>User ID: {user.userId}</p>
        </div>
      ) : (
        <p>User not found.</p>
      )}
    </div>
  );
};

export default UserDetails;

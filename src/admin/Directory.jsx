import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Directory.css';

const Directory = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', jobRole: 'Developer' },
    { id: 2, name: 'Jane Doe', jobRole: 'Designer' },
    // Add more users here
  ]);

  const handleAddUser = () => {
    // Logic for adding user after admin approves
  };

  return (
    <div className="directory">
      <h1>Employee Directory</h1>
      <button onClick={handleAddUser}>Add New User</button> {/* Add New User Button */}
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <p>{user.name} - {user.jobRole}</p>
            <Link to={`/directory/${user.id}`}>View Person</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Directory;

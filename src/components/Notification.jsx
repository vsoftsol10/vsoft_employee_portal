import React, { useState } from 'react';
import './Notification.css'; // Import the CSS file for styling

const Notification = () => {
  const [activeTab, setActiveTab] = useState('pending-approvals');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="notification-container">
      <header className="notification-header">
        <button
          className={`tab-button ${activeTab === 'pending-approvals' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending-approvals')}
        >
          Pending Approvals
        </button>
        <button
          className={`tab-button ${activeTab === 'latest-updates' ? 'active' : ''}`}
          onClick={() => handleTabChange('latest-updates')}
        >
          Latest Updates
        </button>
        <button
          className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
        >
          Announcements
        </button>
      </header>
      <div className="notification-content">
        {activeTab === 'pending-approvals' && (
          <div className="content-section active">
            <h2>Pending Approvals</h2>
            <p>No pending approvals at the moment.</p>
          </div>
        )}
        {activeTab === 'latest-updates' && (
          <div className="content-section active">
            <h2>Latest Updates</h2>
            <p>All updates will be shown here.</p>
          </div>
        )}
        {activeTab === 'announcements' && (
          <div className="content-section active">
            <h2>Announcements</h2>
            <p>Instructions and announcements provided by the admin will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;

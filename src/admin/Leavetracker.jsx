import React, { useState } from 'react';
import './Leavetracker.css'; // Import CSS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState('leaveRequests');
  const [selectedRequest, setSelectedRequest] = useState(null); // To hold selected request

  const leaveRequests = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Robert Johnson' },
  ];

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  const handleAccept = () => {
    alert('Leave Accepted');
    setSelectedRequest(null);
  };

  const handleReject = () => {
    alert('Leave Rejected');
    setSelectedRequest(null);
  };

  return (
    <div className="leavetracker-container">
      <div className="tabs">
        <button
          onClick={() => setActiveTab('leaveRequests')}
          className={activeTab === 'leaveRequests' ? 'active' : ''}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab('leaveRules')}
          className={activeTab === 'leaveRules' ? 'active' : ''}
        >
          Leave Rules
        </button>
      </div>

      <div className="content">
        {activeTab === 'leaveRequests' && (
          <>
            {selectedRequest ? (
              <div className="request-details">
                <h3>{selectedRequest.name}'s Leave Request</h3>
                <p><strong>Leave Type:</strong> Sick Leave</p>
                <p><strong>Date From:</strong> 2024-09-19</p>
                <p><strong>Date To:</strong> 2024-09-21</p>
                <p><strong>Reason:</strong> Not feeling well.</p>
                <div className="action-buttons">
                  <button onClick={handleAccept} className="neon-button accept">Accept</button>
                  <button onClick={handleReject} className="neon-button reject">Reject</button>
                </div>
              </div>
            ) : (
              <div className="request-list">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <span>{request.name}</span>
                    <button onClick={() => handleRequestClick(request)} className="neon-button">
                      See Requests
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'leaveRules' && (
          <div className="leave-rules">
            <div className="leave-rule">
              <h3>Sick Leave</h3>
              <p>Sick leave is granted to employees who are unable to work due to illness.</p>
              <input type="number" placeholder="Set no. of days" />
            </div>
            <div className="leave-rule">
              <h3>Casual Leave</h3>
              <p>Casual leave is for personal reasons like family events or emergencies.</p>
              <input type="number" placeholder="Set no. of days" />
            </div>
            <div className="leave-rule">
              <h3>Leave Without Pay</h3>
              <p>Leave without pay is granted when the employee has exhausted other leave options.</p>
              <input type="number" placeholder="Set no. of days" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leavetracker;

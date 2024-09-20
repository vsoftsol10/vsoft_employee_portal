import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Adjust the import based on your structure
import { doc, getDocs, collection, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Leavetracker.css'; // Import CSS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState('leaveRequests');
  const [selectedRequest, setSelectedRequest] = useState(null); // To hold selected request
  const [leaveRequests, setLeaveRequests] = useState([]); // To hold fetched leave requests
  const [userUid, setUserUid] = useState(''); // To hold user UID
  const [leaveDays, setLeaveDays] = useState({ sickLeave: 2, casualLeave: 2, leaveWithoutPay: 2 }); // Default values

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        await fetchLeaveRequests(user.uid);
        await fetchLeaveSettings(); // Fetch leave settings on user login
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLeaveRequests = async (uid) => {
    try {
      const leaveRequestsCollection = collection(firestore, 'oftenusers', uid, 'leaveformrequests');
      const leaveSnapshot = await getDocs(leaveRequestsCollection);
      const requests = leaveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchLeaveSettings = async () => {
    try {
      const settingsDoc = doc(firestore, 'leaveSettings', 'default');
      const settingsSnap = await getDoc(settingsDoc);
      if (settingsSnap.exists()) {
        setLeaveDays(settingsSnap.data());
      }
    } catch (error) {
      console.error('Error fetching leave settings:', error);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
  };

  const handleAccept = async () => {
    if (!selectedRequest) return;
    try {
      const leaveDocRef = doc(firestore, 'oftenusers', userUid, 'leaveformrequests', selectedRequest.id);
      await updateDoc(leaveDocRef, { status: 'accepted' });
      alert('Leave Accepted');
      setSelectedRequest(null);
      await fetchLeaveRequests(userUid); // Refresh leave requests
    } catch (error) {
      console.error('Error accepting leave:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      const leaveDocRef = doc(firestore, 'oftenusers', userUid, 'leaveformrequests', selectedRequest.id);
      await updateDoc(leaveDocRef, { status: 'rejected' });
      alert('Leave Rejected');
      setSelectedRequest(null);
      await fetchLeaveRequests(userUid); // Refresh leave requests
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const handleLeaveDaysChange = (e) => {
    const { name, value } = e.target;
    setLeaveDays(prev => ({ ...prev, [name]: Number(value) })); // Convert value to a number
  };

  const saveLeaveSettings = async () => {
    try {
      const settingsDocRef = doc(firestore, 'leaveSettings', 'default');
      await updateDoc(settingsDocRef, leaveDays);
      alert('Leave settings updated successfully!');
    } catch (error) {
      console.error('Error updating leave settings:', error);
    }
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
                <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
                <p><strong>Date From:</strong> {selectedRequest.start}</p>
                <p><strong>Date To:</strong> {selectedRequest.end}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <div className="action-buttons">
                  <button onClick={handleAccept} className="neon-button accept">Accept</button>
                  <button onClick={handleReject} className="neon-button reject">Reject</button>
                </div>
              </div>
            ) : (
              <div className="request-list">
                {leaveRequests.length > 0 ? (
                  leaveRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <span>{request.name}</span>
                      <button onClick={() => handleRequestClick(request)} className="neon-button">
                        See Requests
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No leave requests found.</p>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'leaveRules' && (
          <div className="leave-rules">
            <div className="leave-rule">
              <h3>Sick Leave</h3>
              <input 
                type="number" 
                name="sickLeave" 
                value={leaveDays.sickLeave} 
                onChange={handleLeaveDaysChange} 
                placeholder="Set no. of days" 
              />
            </div>
            <div className="leave-rule">
              <h3>Casual Leave</h3>
              <input 
                type="number" 
                name="casualLeave" 
                value={leaveDays.casualLeave} 
                onChange={handleLeaveDaysChange} 
                placeholder="Set no. of days" 
              />
            </div>
            <div className="leave-rule">
              <h3>Leave Without Pay</h3>
              <input 
                type="number" 
                name="leaveWithoutPay" 
                value={leaveDays.leaveWithoutPay} 
                onChange={handleLeaveDaysChange} 
                placeholder="Set no. of days" 
              />
            </div>
            <button onClick={saveLeaveSettings} className="neon-button save">Save Settings</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leavetracker;

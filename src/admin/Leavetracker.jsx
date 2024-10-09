import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { doc, getDocs, collection, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Leavetracker.css'; // Import CSS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState('latestRequests');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [userUid, setUserUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectionDescription, setRejectionDescription] = useState(''); // State for rejection description

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        setLoading(true);
        try {
          // Fetch leave requests specifically for the user
          await fetchLeaveRequests();
        } catch (e) {
          setError('Failed to load data.');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const leaveRequestsCollection = collection(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests');
      const leaveSnapshot = await getDocs(leaveRequestsCollection);
      const requests = leaveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests); // Store all leave requests
    } catch (error) {
      setError('Failed to fetch leave requests.');
    }
  };

  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
  };

  const handleRequestDecision = async (requestId, decision) => {
    const confirmDecision = window.confirm(`Are you sure you want to ${decision} this request?`);
    if (!confirmDecision) return;

    try {
      const requestDocRef = doc(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests', requestId);
      const requestSnapshot = await getDoc(requestDocRef);

      if (!requestSnapshot.exists()) {
        alert('Leave request not found.');
        return;
      }

      const requestData = requestSnapshot.data();
      const leaveDaysCount = calculateLeaveDays(requestData.start, requestData.end); // Calculate leave days

      // Update the request status
      await updateDoc(requestDocRef, { status: decision });

      const leaveBalanceRef = doc(firestore, 'leaverules', userUid);

      // Retrieve the current leave balances
      const leaveBalanceSnapshot = await getDoc(leaveBalanceRef);
      let sickLeave = Number(leaveBalanceSnapshot.data().sickLeave || 0);
      let casualLeave = Number(leaveBalanceSnapshot.data().casualLeave || 0);

      if (decision === 'rejected') {
        // Add leave days back if rejected
        if (requestData.type === 'Sick Leave') {
          sickLeave += leaveDaysCount;
        } else if (requestData.type === 'Casual Leave') {
          casualLeave += leaveDaysCount;
        }

        await updateDoc(leaveBalanceRef, {
          sickLeave: sickLeave.toString(),
          casualLeave: casualLeave.toString()
        });

        // Alert with the leave days count and rejection description
        alert(`Request has been rejected! ${leaveDaysCount} days added back to ${requestData.type}. Reason: ${rejectionDescription}`);
        setRejectionDescription(''); // Clear the description after rejection
      } else if (decision === 'accepted') {
        alert('Request has been accepted!');
      }

      fetchLeaveRequests(); // Refresh the leave requests
    } catch (error) {
      alert('Failed to update request: ' + error.message);
    }
  };

  const handleMarkAsPermission = async (requestId) => {
    const confirmDecision = window.confirm(`Are you sure you want to mark this request as Permission?`);
    if (!confirmDecision) return;

    try {
      const requestDocRef = doc(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests', requestId);
      await updateDoc(requestDocRef, { status: 'Permission' });
      alert('Request has been marked as Permission!');
      fetchLeaveRequests(); // Refresh the leave requests
    } catch (error) {
      alert('Failed to mark request as Permission: ' + error.message);
    }
  };

  const handleMarkAsLOP = async (requestId) => {
    const confirmDecision = window.confirm(`Are you sure you want to mark this request as LOP?`);
    if (!confirmDecision) return;

    try {
      const requestDocRef = doc(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests', requestId);
      await updateDoc(requestDocRef, { status: 'LOP' });
      alert('Request has been marked as LOP!');
      fetchLeaveRequests(); // Refresh the leave requests
    } catch (error) {
      alert('Failed to mark request as LOP: ' + error.message);
    }
  };

  // Filter latest and past requests
  const latestRequests = leaveRequests.filter(request => request.status.toLowerCase() === 'pending'); // Only include "pending" requests
  const pastRequests = leaveRequests.filter(request => request.status.toLowerCase() !== 'pending'); // All non-pending requests

  return (
    <div className="leavetracker-container">
      <div className="tabs">
        <button
          onClick={() => {
            setActiveTab('latestRequests');
            setSelectedRequest(null); // Clear selected request when switching tabs
          }}
          className={activeTab === 'latestRequests' ? 'active' : ''}
        >
          Latest Requests
        </button>
        <button
          onClick={() => {
            setActiveTab('pastRequests');
            setSelectedRequest(null); // Clear selected request when switching tabs
          }}
          className={activeTab === 'pastRequests' ? 'active' : ''}
        >
          Past Requests
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="content">
          {error && <p className="error">{error}</p>}

          {activeTab === 'latestRequests' && (
            <>
              {selectedRequest ? (
                <div className="request-details">
                  <h3>{selectedRequest.name}'s Leave Request</h3>
                  <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
                  <p><strong>Date From:</strong> {selectedRequest.start}</p>
                  <p><strong>Date To:</strong> {selectedRequest.end}</p>
                  <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <button onClick={() => setSelectedRequest(null)} className="neon-button back-button">
                    Back to Requests
                  </button>
                  <button onClick={() => handleRequestDecision(selectedRequest.id, 'accepted')} className="neon-button">
                    Accept
                  </button>
                  <button onClick={() => {
                    setRejectionDescription(''); // Clear any previous input
                    const rejection = prompt('Please provide a reason for rejection:');
                    if (rejection) {
                      setRejectionDescription(rejection);
                      handleRequestDecision(selectedRequest.id, 'rejected');
                    }
                  }} className="neon-button">
                    Reject
                  </button>
                  <button onClick={() => handleMarkAsPermission(selectedRequest.id)} className="neon-button">
                    Mark as Permission
                  </button>
                  <button onClick={() => handleMarkAsLOP(selectedRequest.id)} className="neon-button">
                    Mark as LOP
                  </button>
                </div>
              ) : (
                <div className="request-list">
                  {latestRequests.length > 0 ? (
                    latestRequests.map((request) => (
                      <div key={request.id} className="request-item">
                        <span>{request.name}</span>
                        <button onClick={() => setSelectedRequest(request)} className="neon-button">
                          See Request
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No latest requests found.</p>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'pastRequests' && (
            <div className="request-list">
              {pastRequests.length > 0 ? (
                pastRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <span>{request.name}</span>
                    <span>Status: {request.status}</span>
                  </div>
                ))
              ) : (
                <p>No past requests found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leavetracker;

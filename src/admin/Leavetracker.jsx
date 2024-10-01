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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        setLoading(true);
        try {
          await fetchLeaveRequests(user.uid);
        } catch (e) {
          setError('Failed to load data.');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLeaveRequests = async (uid) => {
    try {
      const leaveRequestsCollection = collection(firestore, 'leaverules', uid, 'leaveformrequests');
      const leaveSnapshot = await getDocs(leaveRequestsCollection);
      const requests = leaveSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
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
      const requestDocRef = doc(firestore, 'leaverules', userUid, 'leaveformrequests', requestId);
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

      // Convert current leave balances to numbers
      let sickLeave = Number(requestData.sickLeave) || 0;
      let casualLeave = Number(requestData.casualLeave) || 0;
      let leaveWithoutPay = Number(requestData.leaveWithoutPay) || 0;

      if (decision === 'rejected') {
        // Add leave days back if rejected
        if (requestData.type === 'Sick Leave') {
          sickLeave += leaveDaysCount;
        } else if (requestData.type === 'Casual Leave') {
          casualLeave += leaveDaysCount;
        } else if (requestData.type === 'Leave Without Pay') {
          leaveWithoutPay += leaveDaysCount;
        }
        await updateDoc(leaveBalanceRef, {
          sickLeave: sickLeave.toString(),
          casualLeave: casualLeave.toString(),
          leaveWithoutPay: leaveWithoutPay.toString()
        });
        alert(`Request has been rejected and ${leaveDaysCount} days added back to ${requestData.type}!`);
      } else if (decision === 'accepted') {
        // Subtract leave days if accepted
        if (requestData.type === 'Sick Leave') {
          sickLeave -= leaveDaysCount;
        } else if (requestData.type === 'Casual Leave') {
          casualLeave -= leaveDaysCount;
        } else if (requestData.type === 'Leave Without Pay') {
          leaveWithoutPay -= leaveDaysCount;
        }
        await updateDoc(leaveBalanceRef, {
          sickLeave: sickLeave.toString(),
          casualLeave: casualLeave.toString(),
          leaveWithoutPay: leaveWithoutPay.toString()
        });
        alert(`Request has been accepted and ${leaveDaysCount} days deducted from ${requestData.type}!`);
      }

      fetchLeaveRequests(userUid); // Refresh the leave requests
    } catch (error) {
      alert('Failed to update request: ' + error.message);
    }
  };

  const latestRequests = leaveRequests.filter(request => request.status === 'pending');
  const pastRequests = leaveRequests.filter(request => ['accepted', 'rejected'].includes(request.status));

  return (
    <div className="leavetracker-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('latestRequests')} className={activeTab === 'latestRequests' ? 'active' : ''}>
          Latest Requests
        </button>
        <button onClick={() => setActiveTab('pastRequests')} className={activeTab === 'pastRequests' ? 'active' : ''}>
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
                  <button onClick={() => handleRequestDecision(selectedRequest.id, 'rejected')} className="neon-button">
                    Reject
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
                    <p><strong>Status:</strong> {request.status}</p>
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

import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { doc, getDocs, collection, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import emailjs from 'emailjs-com'; // Import EmailJS
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

  const sendEmailNotification = async (requestData, decision, rejectionReason = '') => {
    // Prepare the template parameters
    const templateParams = {
      userName: requestData.name, // Ensure this matches the template variable
      submissionDate: new Date().toLocaleDateString(), // Ensure this matches the template variable
      status: decision.charAt(0).toUpperCase() + decision.slice(1), // Capitalize the first letter
      rejectionReason: rejectionReason ? rejectionReason : 'N/A', // Provide rejection reason, default to 'N/A' if not rejected
    };
  
    try {
      // Sending email using EmailJS
      await emailjs.send('acceptreject', 'accept', templateParams, 'HvP0VJwGrRXdPvlDg');
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };
  const handleRequestDecision = async (requestId, decision) => {
    const confirmDecision = window.confirm(`Are you sure you want to mark this request as ${decision.charAt(0).toUpperCase() + decision.slice(1)}?`);
    if (!confirmDecision) return;
  
    try {
      const requestDocRef = doc(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests', requestId);
      
      // Fetch the leave request to send email
      const requestSnapshot = await getDoc(requestDocRef);
      if (!requestSnapshot.exists()) {
        alert('Request does not exist!');
        return;
      }
  
      const requestData = requestSnapshot.data(); // Fetch request data here
  
      // Update the status of the leave request
      await updateDoc(requestDocRef, { status: decision.charAt(0).toUpperCase() + decision.slice(1) });
  
      let rejectionReason = '';
      if (decision.toLowerCase() === 'rejected') {
        // Prompt for the rejection reason if the request is being rejected
        rejectionReason = prompt('Please provide a reason for rejection:');
        if (!rejectionReason) {
          alert('Rejection reason is required!');
          return; // Exit if no reason is provided
        }
      }
  
      await sendEmailNotification(requestData, decision, rejectionReason); // Pass the requestData and rejection reason
  
      // Add leave type and status to the employeetimings collection
      const employeeTimingDocRef = doc(firestore, 'employeetimings', userUid); // Assuming userUid is set correctly
      await updateDoc(employeeTimingDocRef, {
        leaveType: requestData.type, // Use requestData.type now
        status: decision.charAt(0).toUpperCase() + decision.slice(1), // Update the status
      });
  
      alert(`Request has been marked as ${decision.charAt(0).toUpperCase() + decision.slice(1)}!`);
      fetchLeaveRequests(); // Refresh the leave requests
    } catch (error) {
      alert('Failed to mark request: ' + error.message);
    }
  };
  
  const handleMarkAsPermission = async (requestId) => {
    await handleRequestDecision(requestId, 'Permission');
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
                    const reason = prompt("Enter rejection reason:");
                    if (reason) {
                      handleRequestDecision(selectedRequest.id, 'rejected', reason); // Send rejection reason
                    }
                  }} className="neon-button">
                    Reject
                  </button>
                  <button onClick={() => handleMarkAsPermission(selectedRequest.id)} className="neon-button">
                    Mark as Permission
                  </button>
                </div>
              ) : (
                <div className="request-list">
                  {latestRequests.length === 0 ? (
                    <p>No pending requests.</p>
                  ) : (
                    latestRequests.map(request => (
                      <div key={request.id} className="request-item" onClick={() => setSelectedRequest(request)}>
                        <h4>{request.name}</h4>
                        <p>{request.type} - {request.start} to {request.end}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'pastRequests' && (
            <div className="request-list">
              {pastRequests.length === 0 ? (
                <p>No past requests.</p>
              ) : (
                pastRequests.map(request => (
                  <div key={request.id} className="request-item">
                    <h4>{request.name}</h4>
                    <p>{request.type} - {request.start} to {request.end} - Status: {request.status}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leavetracker;

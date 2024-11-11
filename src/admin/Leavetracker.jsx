// import React, { useState, useEffect } from 'react';
// import { firestore, auth } from '../firebaseConfig';
// import { doc, getDocs, collection, updateDoc, getDoc } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
// import emailjs from 'emailjs-com'; // Import EmailJS
// import './Leavetracker.css'; // Import CSS

// const Leavetracker = () => {
//   const [activeTab, setActiveTab] = useState('latestRequests');
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [userUid, setUserUid] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUserUid(user.uid);
//         setLoading(true);
//         try {
//           await fetchLeaveRequests();
//         } catch (e) {
//           setError('Failed to load data.');
//         } finally {
//           setLoading(false);
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   const fetchLeaveRequests = async () => {
//     try {
//       const leaveRequestsCollection = collection(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests');
//       const leaveSnapshot = await getDocs(leaveRequestsCollection);
//       const requests = leaveSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setLeaveRequests(requests); // Store all leave requests
//     } catch (error) {
//       setError('Failed to fetch leave requests.');
//     }
//   };

//   const sendEmailNotification = async (requestData, decision, rejectionReason = '') => {
//     // Prepare the template parameters
//     const templateParams = {
//       userName: requestData.name, // Ensure this matches the template variable
//       submissionDate: new Date().toLocaleDateString(), // Ensure this matches the template variable
//       status: decision.charAt(0).toUpperCase() + decision.slice(1), // Capitalize the first letter
//       rejectionReason: rejectionReason ? rejectionReason : 'N/A', // Provide rejection reason, default to 'N/A' if not rejected
//     };

//     try {
//       // Sending email using EmailJS
//       await emailjs.send('acceptreject', 'accept', templateParams, 'HvP0VJwGrRXdPvlDg');
//       console.log('Email sent successfully!');
//     } catch (error) {
//       console.error('Failed to send email:', error);
//     }
//   };
//   const handleRequestDecision = async (requestId, decision) => {
//     const confirmDecision = window.confirm(`Are you sure you want to mark this request as ${decision.charAt(0).toUpperCase() + decision.slice(1)}?`);
//     if (!confirmDecision) return;

//     try {
//       const requestDocRef = doc(firestore, 'leaverules', 'XZdb5au5FjabGTE9U7DAKpZQM902', 'leaveformrequests', requestId);

//       // Fetch the leave request to send email
//       const requestSnapshot = await getDoc(requestDocRef);
//       if (!requestSnapshot.exists()) {
//         alert('Request does not exist!');
//         return;
//       }

//       const requestData = requestSnapshot.data(); // Fetch request data here

//       // Update the status of the leave request
//       await updateDoc(requestDocRef, { status: decision.charAt(0).toUpperCase() + decision.slice(1) });

//       let rejectionReason = '';
//       if (decision.toLowerCase() === 'rejected') {
//         // Prompt for the rejection reason if the request is being rejected
//         rejectionReason = prompt('Please provide a reason for rejection:');
//         if (!rejectionReason) {
//           alert('Rejection reason is required!');
//           return; // Exit if no reason is provided
//         }
//       }

//       await sendEmailNotification(requestData, decision, rejectionReason); // Pass the requestData and rejection reason

//       // Add leave type and status to the employeetimings collection
//       const employeeTimingDocRef = doc(firestore, 'employeetimings', userUid); // Assuming userUid is set correctly
//       await updateDoc(employeeTimingDocRef, {
//         leaveType: requestData.type, // Use requestData.type now
//         status: decision.charAt(0).toUpperCase() + decision.slice(1), // Update the status
//       });

//       alert(`Request has been marked as ${decision.charAt(0).toUpperCase() + decision.slice(1)}!`);
//       fetchLeaveRequests(); // Refresh the leave requests
//     } catch (error) {
//       alert('Failed to mark request: ' + error.message);
//     }
//   };

//   const handleMarkAsPermission = async (requestId) => {
//     await handleRequestDecision(requestId, 'Permission');
//   };

//   // Filter latest and past requests
//   const latestRequests = leaveRequests.filter(request => request.status.toLowerCase() === 'pending'); // Only include "pending" requests
//   const pastRequests = leaveRequests.filter(request => request.status.toLowerCase() !== 'pending'); // All non-pending requests

//   return (
//     <div className="leavetracker-container">
//       <div className="tabs">
//         <button
//           onClick={() => {
//             setActiveTab('latestRequests');
//             setSelectedRequest(null); // Clear selected request when switching tabs
//           }}
//           className={activeTab === 'latestRequests' ? 'active' : ''}
//         >
//           Latest Requests
//         </button>
//         <button
//           onClick={() => {
//             setActiveTab('pastRequests');
//             setSelectedRequest(null); // Clear selected request when switching tabs
//           }}
//           className={activeTab === 'pastRequests' ? 'active' : ''}
//         >
//           Past Requests
//         </button>
//       </div>

//       {loading ? (
//         <div className="loading-spinner">Loading...</div>
//       ) : (
//         <div className="content">
//           {error && <p className="error">{error}</p>}

//           {activeTab === 'latestRequests' && (
//             <>
//               {selectedRequest ? (
//                 <div className="request-details">
//                   <h3>{selectedRequest.name}'s Leave Request</h3>
//                   <p><strong>Leave Type:</strong> {selectedRequest.type}</p>
//                   <p><strong>Date From:</strong> {selectedRequest.start}</p>
//                   <p><strong>Date To:</strong> {selectedRequest.end}</p>
//                   <p><strong>Reason:</strong> {selectedRequest.reason}</p>
//                   <p><strong>Status:</strong> {selectedRequest.status}</p>
//                   <button onClick={() => setSelectedRequest(null)} className="neon-button back-button">
//                     Back to Requests
//                   </button>
//                   <button onClick={() => handleRequestDecision(selectedRequest.id, 'accepted')} className="neon-button">
//                     Accept
//                   </button>
//                   <button onClick={() => {
//                     const reason = prompt("Enter rejection reason:");
//                     if (reason) {
//                       handleRequestDecision(selectedRequest.id, 'rejected', reason); // Send rejection reason
//                     }
//                   }} className="neon-button">
//                     Reject
//                   </button>
//                   <button onClick={() => handleMarkAsPermission(selectedRequest.id)} className="neon-button">
//                     Mark as Permission
//                   </button>
//                 </div>
//               ) : (
//                 <div className="request-list">
//                   {latestRequests.length === 0 ? (
//                     <p>No pending requests.</p>
//                   ) : (
//                     latestRequests.map(request => (
//                       <div key={request.id} className="request-item" onClick={() => setSelectedRequest(request)}>
//                         <h4>{request.name}</h4>
//                         <p>{request.type} - {request.start} to {request.end}</p>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </>
//           )}

//           {activeTab === 'pastRequests' && (
//             <div className="request-list">
//               {pastRequests.length === 0 ? (
//                 <p>No past requests.</p>
//               ) : (
//                 pastRequests.map(request => (
//                   <div key={request.id} className="request-item">
//                     <h4>{request.name}</h4>
//                     <p>{request.type} - {request.start} to {request.end} - Status: {request.status}</p>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Leavetracker;

import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebaseConfig";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Leavetracker.css"; // Import CSS
import emailjs from "emailjs-com"; // Import EmailJS

const Leavetracker = () => {
  const [activeTab, setActiveTab] = useState("latestRequests");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          await fetchAllLeaveRequests(); // Fetch all leave requests across all UIDs
        } catch (e) {
          setError("Failed to load data.");
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const db = getFirestore();

  // Function to calculate the number of leave days
  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = Math.abs(endDate - startDate);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include both start and end dates
  };

  // Function to send email notifications using EmailJS
  const sendEmailNotification = (requestData, decision, rejectionReason) => {
    const emailParams = {
      to_name: requestData.name,
      status: decision,
      reason: rejectionReason || "",
    };

    emailjs
      .send("acceptreject", "accept", emailParams, "HvP0VJwGrRXdPvlDg")
      .then(
        (response) => {
          console.log("Email sent successfully!", response.status, response.text);
        },
        (error) => {
          console.error("Failed to send email:", error);
        }
      );
  };

  // Fetch all leave requests across all user UIDs
  const fetchAllLeaveRequests = async () => {
    try {
      const usersCollection = collection(db, "leaverules");
      const usersSnapshot = await getDocs(usersCollection);

      let allRequests = [];

      // Loop through each UID and fetch leave requests
      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const leaveRequestsCollection = collection(
          firestore,
          `leaverules/${uid}/leaveformrequests`
        );
        const leaveSnapshot = await getDocs(leaveRequestsCollection);

        const requests = leaveSnapshot.docs.map((doc) => ({
          id: doc.id,
          uid, // Include UID to identify user for each request
          ...doc.data(),
        }));
        allRequests = allRequests.concat(requests);
      }

      setLeaveRequests(allRequests);
    } catch (error) {
      setError("Failed to fetch leave requests.");
    }
  };

  const handleRequestDecision = async (requestId, decision, uid) => {
    const confirmDecision = window.confirm(
      `Are you sure you want to ${decision} this request?`
    );

    if (!confirmDecision) return;

    try {
      const requestDocRef = doc(
        firestore,
        `leaverules/${uid}/leaveformrequests`,
        requestId
      );
      const requestSnapshot = await getDoc(requestDocRef);

      if (!requestSnapshot.exists()) {
        alert("Leave request not found.");
        return;
      }

      const requestData = requestSnapshot.data();
      const leaveDaysCount = calculateLeaveDays(
        requestData.start,
        requestData.end
      );

      let rejectionReason = "";
      if (decision.toLowerCase() === "rejected") {
        rejectionReason = prompt("Please provide a reason for rejection:");
        if (!rejectionReason) {
          alert("Rejection reason is required!");
          return;
        }
        // Add rejected days back to leave balance
        await updateLeaveBalance(uid, leaveDaysCount, "add");
      } else {
        // Subtract accepted leave days from leave balance
        await updateLeaveBalance(uid, leaveDaysCount, "subtract");
      }

      await updateDoc(requestDocRef, { status: decision });
      await sendEmailNotification(requestData, decision, rejectionReason);

      alert(`Request has been ${decision}.`);

      // Refresh leave requests
      fetchAllLeaveRequests();
    } catch (error) {
      alert("Failed to update request: " + error.message);
    }
  };

  // Function to update leave balance based on decision
  const updateLeaveBalance = async (uid, leaveDaysCount, action) => {
    const userDocRef = doc(firestore, `leaverules`, uid);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const currentLeaveBalance = userDocSnapshot.data().leaveBalance || 0;
      const updatedLeaveBalance =
        action === "subtract"
          ? currentLeaveBalance - leaveDaysCount
          : currentLeaveBalance + leaveDaysCount;

      await updateDoc(userDocRef, { leaveBalance: updatedLeaveBalance });
    } else {
      alert("User data not found.");
    }
  };

  const latestRequests = leaveRequests.filter(
    (request) => request.status === "pending"
  );
  const pastRequests = leaveRequests.filter((request) =>
    ["accepted", "rejected"].includes(request.status)
  );

  return (
    <div className="leavetracker-container">
      <div className="tabs">
        <button
          onClick={() => setActiveTab("latestRequests")}
          className={activeTab === "latestRequests" ? "active" : ""}
        >
          Latest Requests
        </button>
        <button
          onClick={() => setActiveTab("pastRequests")}
          className={activeTab === "pastRequests" ? "active" : ""}
        >
          Past Requests
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="content">
          {error && <p className="error">{error}</p>}

          {activeTab === "latestRequests" && (
            <div className="request-list">
              {latestRequests.length > 0 ? (
                latestRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <span>{request.name}</span>
                    <button
                      onClick={() => handleRequestDecision(request.id, "accepted", request.uid)}
                      className="neon-button"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestDecision(request.id, "rejected", request.uid)}
                      className="neon-button"
                    >
                      Reject
                    </button>
                  </div>
                ))
              ) : (
                <p>No latest requests found.</p>
              )}
            </div>
          )}

          {activeTab === "pastRequests" && (
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

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
  const [userUid, setUserUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);

        setLoading(true);
        try {
          await fetchUserData(user.uid);
          await fetchLeaveRequests(user.uid);
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

  const fetchUserData = async (uid) => {
    const docRef = doc(db, "employees", uid);
    const docSnap = await getDoc(docRef);
    console.log(uid, "UserData");
    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.log("No such document! UserData");
    }
  };

  const sendEmailNotification = async (
    requestData,
    decision,
    rejectionReason = ""
  ) => {
    // Prepare the template parameters
    const templateParams = {
      userName: requestData.name, // Ensure this matches the template variable
      submissionDate: new Date().toLocaleDateString(), // Ensure this matches the template variable
      status: decision.charAt(0).toUpperCase() + decision.slice(1), // Capitalize the first letter
      rejectionReason: rejectionReason ? rejectionReason : "N/A", // Provide rejection reason, default to 'N/A' if not rejected
    };

    try {
      // Sending email using EmailJS
      await emailjs.send(
        "acceptreject",
        "accept",
        templateParams,
        "HvP0VJwGrRXdPvlDg"
      );
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const fetchLeaveRequests = async (uid) => {
    try {
      const leaveRequestsCollection = collection(
        firestore,
        "leaverules",
        uid,
        "leaveformrequests"
      );
      const leaveSnapshot = await getDocs(leaveRequestsCollection);
      const requests = leaveSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaveRequests(requests);
    } catch (error) {
      setError("Failed to fetch leave requests.");
    }
  };

  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
  };

  const handleRequestDecision = async (requestId, decision) => {
    const confirmDecision = window.confirm(
      `Are you sure you want to ${decision} this request?`
    );

    if (!confirmDecision) return;

    try {
      const requestDocRef = doc(
        firestore,
        "leaverules",
        userUid,
        "leaveformrequests",
        requestId
      );
      const requestSnapshot = await getDoc(requestDocRef);
      const docRef = doc(db, "employees", userUid); // Reference to user's document
      if (!requestSnapshot.exists()) {
        alert("Leave request not found.");
        return;
      }

      const requestData = requestSnapshot.data();
      const leaveDaysCount = calculateLeaveDays(
        requestData.start,
        requestData.end
      ); // Calculate leave days

      let rejectionReason = "";
      if (decision.toLowerCase() === "rejected") {
        // Prompt for the rejection reason if the request is being rejected
        rejectionReason = prompt("Please provide a reason for rejection:");
        if (!rejectionReason) {
          alert("Rejection reason is required!");
          return; // Exit if no reason is provided
        }
      }

      // Update the request status
      await updateDoc(requestDocRef, { status: decision });
      await sendEmailNotification(requestData, decision, rejectionReason); // Pass the requestData and rejection reason

      // Convert current leave balances to numbers
      let sickLeave = parseFloat(userData.sickLeave) || 0;
      let casualLeave = parseFloat(userData.casualLeave) || 0;
      let leaveWithoutPay = parseFloat(userData.leaveWithoutPay) || 0;

      if (decision === "rejected") {
        alert(
          `Request has been rejected and ${leaveDaysCount} days added back to ${requestData.type}!`
        );
      } else if (decision === "accepted") {
        if (requestData.leaveType === "CASUAL_LEAVE") {
          await updateDoc(docRef, {
            casualLeave: casualLeave - requestData.daysCount, // Deduct based on leave type
          });
        } else if (requestData.leaveType === "SICK_LEAVE") {
          await updateDoc(docRef, {
            sickLeave: sickLeave - requestData.daysCount, // Deduct based on leave type
          });
        } else {
          await updateDoc(docRef, {
            leaveWithoutPay: leaveWithoutPay - requestData.daysCount, // Deduct based on leave type
          });
        }

        const startDate = new Date(requestData.start); // Leave start date
        const endDate = new Date(requestData.end); // Leave end date

        // Loop through all dates between start and end date
        let currentDate = startDate;
        while (currentDate <= endDate) {
          const dateString = currentDate.toDateString(); // Unique document for each day
          const attendanceRef = doc(
            db,
            `oftenusers/${userUid}/checkins`,
            dateString
          );

          const docSnap = await getDoc(attendanceRef);

          if (docSnap.exists()) {
            // If the document exists, update it
            await updateDoc(attendanceRef, {
              attendanceStatus: requestData.leaveDayType,
              halfDayPeriod: requestData.halfDayPeriod,
              leaveType: requestData.leaveType,
              leaveDescription: requestData.leaveDescription,
            });
          } else {
            // If the document does not exist, create it
            await setDoc(attendanceRef, {
              attendanceStatus: requestData.leaveDayType,
              halfDayPeriod: requestData.halfDayPeriod,
              leaveType: requestData.leaveType,
              leaveDescription: requestData.leaveDescription,
            });
          }

          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }

        alert(
          `Request has been accepted and ${leaveDaysCount} days deducted from ${requestData.type}!`
        );
      }

      fetchLeaveRequests(userUid); // Refresh the leave requests
    } catch (error) {
      alert("Failed to update request: " + error.message);
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
            <>
              {selectedRequest ? (
                <div className="request-details">
                  <h3>{selectedRequest.name}'s Leave Request</h3>
                  <p>
                    <strong>Leave Type:</strong> {selectedRequest.type}
                  </p>
                  <p>
                    <strong>Date From:</strong> {selectedRequest.start}
                  </p>
                  <p>
                    <strong>Date To:</strong> {selectedRequest.end}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedRequest.status}
                  </p>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="neon-button back-button"
                  >
                    Back to Requests
                  </button>
                  <button
                    onClick={() =>
                      handleRequestDecision(selectedRequest.id, "accepted")
                    }
                    className="neon-button"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRequestDecision(selectedRequest.id, "rejected")
                    }
                    className="neon-button"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="request-list">
                  {latestRequests.length > 0 ? (
                    latestRequests.map((request) => (
                      <div key={request.id} className="request-item">
                        <span>{request.name}</span>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="neon-button"
                        >
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

          {activeTab === "pastRequests" && (
            <div className="request-list">
              {pastRequests.length > 0 ? (
                pastRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <span>{request.name}</span>
                    <p>
                      <strong>Status:</strong> {request.status}
                    </p>
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

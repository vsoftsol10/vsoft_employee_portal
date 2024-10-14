// import React, { useState, useEffect } from 'react';
// import './LeaveTracker.css';
// import { firestore, auth } from '../firebaseConfig';
// import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
// import emailjs from 'emailjs-com';  // Import EmailJS

// const LeaveTracker = () => {
//   const [name, setName] = useState('');
//   const [leaveType, setLeaveType] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [reason, setReason] = useState('');
//   const [permissionHours, setPermissionHours] = useState('');
//   const [todayDate, setTodayDate] = useState('');
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [leaveBalance, setLeaveBalance] = useState({
//     casualLeave: 0,
//     sickLeave: 0,
//   });
//   const [uid, setUid] = useState(null);
//   const [activeTab, setActiveTab] = useState('leaveForm');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setUid(user.uid);
//         const userDoc = doc(firestore, 'employees', user.uid);
//         const userSnapshot = await getDoc(userDoc);
//         if (userSnapshot.exists()) {
//           setName(userSnapshot.data().name);
//         }

//         // Fetch leave balance for the user
//         const leaveBalanceRef = doc(firestore, 'leaverules', user.uid);
//         const leaveBalanceSnapshot = await getDoc(leaveBalanceRef);
//         if (leaveBalanceSnapshot.exists()) {
//           const currentBalances = leaveBalanceSnapshot.data();
//           setLeaveBalance({
//             casualLeave: Number(currentBalances.casualLeave || 0),
//             sickLeave: Number(currentBalances.sickLeave || 0),
//           });
//         }

//         // Fetch leave requests
//         const leaveCollection = collection(firestore, `leaverules/${user.uid}/leaveformrequests`);
//         const leaveSnapshot = await getDocs(leaveCollection);
//         setLeaveRequests(leaveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       } else {
//         setUid(null);
//         setName('');
//       }
//     });

//     return () => unsubscribe();
//   }, []);
//   const handleApplyLeave = async () => {
//     if (!uid) return;

//     try {
//       let leaveDays;
//       if (leaveType === 'Permission') {
//         leaveDays = permissionHours / 8; // Assuming 8 working hours in a day
//         if (permissionHours === '') {
//           alert('Please enter the number of hours for permission.');
//           return;
//         }
//       } else {
//         leaveDays = calculateLeaveDays(startDate, endDate);
//       }

//       // Date Validation: Check if end date is before start date for leave
//       if (leaveType !== 'Permission' && new Date(startDate) > new Date(endDate)) {
//         alert('End date cannot be before start date.');
//         return;
//       }

//       if (leaveType === '' || reason === '') {
//         alert('Please fill all the fields.');
//         return;
//       }

//       let newBalance = null;
//       const leaveRequestsRef = collection(firestore, `leaverules/${uid}/leaveformrequests`);

//       // Handle leave balance based on leave type
//       if (leaveType === 'Casual Leave') {
//         if (leaveDays > leaveBalance.casualLeave) {
//           alert('You do not have enough casual leave balance.');
//           return;
//         }
//         newBalance = leaveBalance.casualLeave - leaveDays;
//         const leaveBalanceRef = doc(firestore, 'leaverules', uid);
//         await updateDoc(leaveBalanceRef, { casualLeave: newBalance });
//       } else if (leaveType === 'Sick Leave') {
//         if (leaveDays > leaveBalance.sickLeave) {
//           alert('You do not have enough sick leave balance.');
//           return;
//         }
//         newBalance = leaveBalance.sickLeave - leaveDays;
//         const leaveBalanceRef = doc(firestore, 'leaverules', uid);
//         await updateDoc(leaveBalanceRef, { sickLeave: newBalance });
//       }

//       // Add leave request to Firestore
//       await addDoc(leaveRequestsRef, {
//         name,
//         type: leaveType,
//         reason,
//         start: leaveType === 'Permission' ? todayDate : startDate,
//         end: leaveType === 'Permission' ? todayDate : endDate,
//         hours: leaveType === 'Permission' ? permissionHours : null,
//         status: 'pending',
//       });

//       // Update the document in employeetimings with the leave details
//       const employeeTimingsRef = doc(firestore, `employeetimings/XZdb5au5FjabGTE9U7DAKpZQM902`);
//       await updateDoc(employeeTimingsRef, {
//         startDate: leaveType === 'Permission' ? todayDate : startDate,
//         endDate: leaveType === 'Permission' ? todayDate : endDate,
//       });

//       // Send email to admin using EmailJS
//       const emailParams = {
//         to_name: 'Admin',  // The recipient's name (admin)
//         from_name: name,   // The employee's name that you want to send
//         leaveType: leaveType,
//         reason: reason,
//         startDate: leaveType === 'Permission' ? todayDate : startDate,
//         endDate: leaveType === 'Permission' ? todayDate : endDate,
//         permissionHours: leaveType === 'Permission' ? permissionHours : 'N/A',
//         employee_name: name  // Add this line if your template expects {{name}} to work
//       };

//       emailjs.send(
//         'vijay',  // Replace with your EmailJS service ID
//         'leave',  // Replace with your EmailJS template ID
//         emailParams,
//         'XH1tJlK2k5wqCp5Qo'  // Replace with your EmailJS user ID (or public key)
//       )
//       .then((response) => {
//         console.log('Email successfully sent:', response.status, response.text);
//       })
//       .catch((err) => {
//         console.error('Error sending email:', err);
//       });

//       // Update local leave requests
//       setLeaveRequests(prevRequests => [
//         ...prevRequests,
//         {
//           name,
//           type: leaveType,
//           reason,
//           start: leaveType === 'Permission' ? todayDate : startDate,
//           end: leaveType === 'Permission' ? todayDate : endDate,
//           hours: leaveType === 'Permission' ? permissionHours : null,
//           status: 'pending'
//         }
//       ]);

//       // Reset form
//       setLeaveType('');
//       setStartDate('');
//       setEndDate('');
//       setReason('');
//       setPermissionHours('');
//     } catch (error) {
//       console.error('Error applying leave:', error.message);
//     }
//   };

//   const calculateLeaveDays = (start, end) => {
//     const startDate = new Date(start);
//     const endDate = new Date(end);
//     const diffTime = Math.abs(endDate - startDate);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   };

//   const handleLeaveTypeChange = (e) => {
//     setLeaveType(e.target.value);
//     if (e.target.value === 'Permission') {
//       const today = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-mm-dd format
//       setTodayDate(today);
//     }
//   };

//   return (
//     <div className="leave-tracker">
//       <h2>Leave Tracker</h2>

//       {/* Tab Navigation */}
//       <div className="tab-buttons">
//         <button
//           className={activeTab === 'leaveForm' ? 'active' : ''}
//           onClick={() => setActiveTab('leaveForm')}
//         >
//           Leave Form
//         </button>
//         <button
//           className={activeTab === 'pastSubmits' ? 'active' : ''}
//           onClick={() => setActiveTab('pastSubmits')}
//         >
//           Past Submits
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="tab-content">
//         {activeTab === 'leaveForm' && (
//           <form onSubmit={(e) => e.preventDefault()}>
//             <label>
//               Name:
//               <input type="text" value={name} disabled />
//             </label>
//             <label>
//               Leave Type:
//               <select value={leaveType} onChange={handleLeaveTypeChange}>
//                 <option value="">Select Leave Type</option>
//                 <option value="Casual Leave">Casual Leave</option>
//                 <option value="Sick Leave">Sick Leave</option>
//                 <option value="Permission">Permission</option>
//               </select>
//             </label>

//             {/* Show date inputs only if leave type is not 'Permission' */}
//             {leaveType !== 'Permission' && (
//               <>
//                 <label>
//                   Start Date:
//                   <input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                   />
//                 </label>
//                 <label>
//                   End Date:
//                   <input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                   />
//                 </label>
//               </>
//             )}

//             {/* Show hours input only if leave type is 'Permission' */}
//             {leaveType === 'Permission' && (
//               <>
//                 <label>
//                   Hours of Permission:
//                   <input
//                     type="number"
//                     value={permissionHours}
//                     onChange={(e) => setPermissionHours(e.target.value)}
//                     min="1"
//                     max="8"
//                   />
//                 </label>
//                 <label>
//                   Date:
//                   <input type="date" value={todayDate} disabled />
//                 </label>
//               </>
//             )}

//             <label>
//               Reason for Leave:
//               <textarea
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//               ></textarea>
//             </label>

//             <button onClick={handleApplyLeave}>Apply</button>
//           </form>
//         )}

//         {activeTab === 'pastSubmits' && (
//           <div>
//             <h3>Past Leave Requests</h3>
//             {leaveRequests.length === 0 ? (
//               <p>No leave requests found.</p>
//             ) : (
//               <ul>
//                 {leaveRequests.map((request, index) => (
//                   <li key={index}>
//                     <p>Leave Type: {request.type}</p>
//                     <p>Start Date: {request.start}</p>
//                     <p>End Date: {request.end}</p>
//                     <p>Reason: {request.reason}</p>
//                     <p>Status: {request.status}</p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeaveTracker;
import React, { useState, useEffect } from "react";
import "./LeaveTracker.css";
import { firestore, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  calculateFixedWorkingHours,
  getTimeFromHHMM,
} from "../helpers/helpers";
import emailjs from "emailjs-com";

const LeaveTracker = () => {
  const [userData, setUserData] = useState({});
  const [name, setName] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveDayType, setLeaveDayType] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 0,
    sickLeave: 0,
    leaveWithoutPay: 0,
  });
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState("leaveForm"); // State for active tab
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState("");
  const [permissionHours, setPermissionHours] = useState(""); // New state for permission hours

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDoc = doc(firestore, "employees", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setName(userSnapshot.data().name);
          setUserData(userSnapshot.data());
        }

        // Fetch leave balance for the user
        const leaveBalanceRef = doc(firestore, "leaverules", user.uid);
        const leaveBalanceSnapshot = await getDoc(leaveBalanceRef);
        if (leaveBalanceSnapshot.exists()) {
          const currentBalances = leaveBalanceSnapshot.data();
          // Convert balances from strings to numbers
          setLeaveBalance({
            casualLeave: Number(currentBalances.casualLeave || 0),
            sickLeave: Number(currentBalances.sickLeave || 0),
            leaveWithoutPay: Number(currentBalances.leaveWithoutPay || 0),
          });
        }

        // Fetch leave requests for the user from Firestore
        const leaveCollection = collection(
          firestore,
          `leaverules/${user.uid}/leaveformrequests`
        );
        const leaveSnapshot = await getDocs(leaveCollection);
        setLeaveRequests(
          leaveSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } else {
        setUid(null);
        setName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setToastOpen(true);
    setFadeOut(false);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setToastOpen(false), 500);
    }, 3000);
  };

  const handleApplyLeave = async () => {
    if (!uid) return;

    try {
      let leaveDays = calculateLeaveDays(startDate, endDate);
      const leaveBalanceRef = doc(firestore, "leaverules", uid);

      if (leaveDayType === "HALF_DAY_LEAVE") {
        leaveDays = leaveDays * 0.5;
      }

      const checkInEnds = getTimeFromHHMM(userData.checkInEnds);
      const checkOutEnds = getTimeFromHHMM(userData.checkOutEnds);

      const totalFixedHours = calculateFixedWorkingHours(
        checkInEnds,
        checkOutEnds
      );

      const casualLeaveCount = parseFloat(userData.casualLeave);
      const sickLeaveCount = parseFloat(userData.sickLeave);
      const currentDate = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        leaveType === "" ||
        reason === "" ||
        leaveDayType === "" ||
        (leaveDayType === "HALF_DAY_LEAVE" && halfDayPeriod === "")
      ) {
        showToastMessage("Please fill all the fields.");
        return;
      }

      if (start < currentDate || end < currentDate) {
        showToastMessage("Dates cannot be before the current date.");
        return;
      }

      if (leaveDayType === "PERMISSION" && permissionHours == "") {
        showToastMessage("Please provide hours for permission");
        return;
      }
      if (leaveDayType === "PERMISSION" && permissionHours <= 4) {
        showToastMessage("Please give hours below 4");
        return;
      }

      if (leaveDayType === "PERMISSION" && startDate !== endDate) {
        showToastMessage(
          "Start Date and End Date must be the same for permission."
        );
        return;
      }

      if (currentDate >= start && currentDate <= end) {
        const todayString = currentDate.toDateString();
        const attendanceRef = doc(`oftenusers/${uid}/checkins`, todayString);

        const docSnap = await getDoc(attendanceRef);

        // If user already checked out today, prevent further action
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.workedCompleted) {
            showToastMessage("You have already checked out today.");
            return; // Exit the function to prevent further execution
          } else if (
            data.attendanceStatus === "HALF_DAY_LEAVE" &&
            leaveDayType === "LEAVE"
          ) {
            showToastMessage(
              "ALready you check out for half day , you don't able to apply full day"
            );
            return; // Exit the function to prevent further execution
          }
        }
      }

      let newBalance;

      if (leaveType === "CASUAL_LEAVE") {
        if (casualLeaveCount <= 0 || leaveDays > casualLeaveCount) {
          showToastMessage("You do not have any casual leave left.");
          return;
        }
        newBalance = casualLeaveCount - leaveDays; // Deducting leave days from casual leave balance
      } else if (leaveType === "SICK_LEAVE") {
        if (sickLeaveCount <= 0 || leaveDays > sickLeaveCount) {
          showToastMessage("You do not have any sick leave left.");
          return;
        }
        newBalance = sickLeaveCount - leaveDays; // Deducting leave days from sick leave balance
      } else if (leaveType === "LEAVE_WITHOUT_PAY") {
        if (leaveDays > leaveBalance.leaveWithoutPay) {
          showToastMessage("You do not have enough leave without pay balance.");
          return;
        }
        newBalance = leaveBalance.leaveWithoutPay - leaveDays; // Deducting leave days from leave without pay balance
      }
      
      // Ensure newBalance is defined and a valid number
      if (newBalance !== undefined) {
        await updateDoc(leaveBalanceRef, {
          [leaveType]: newBalance.toString(),
        });
      }
      
      const emailParams = {
        to_name: "Admin", // The recipient's name (admin)
        from_name: name, // The employee's name that you want to send
        leaveType: leaveType,
        leaveDayType: leaveDayType,
        reason: reason,
        startDate: startDate,
        endDate: endDate,
        permissionHours:
          leaveDayType === "PERMISSION" ? permissionHours : "N/A",
        employee_name: name, // Add this line if your template expects {{name}} to work
      };

      emailjs
        .send(
          "vijay", // Replace with your EmailJS service ID
          "leave", // Replace with your EmailJS template ID
          emailParams,
          "XH1tJlK2k5wqCp5Qo" // Replace with your EmailJS user ID (or public key)
        )
        .then((response) => {
          console.log(
            "Email successfully sent:",
            response.status,
            response.text
          );
        })
        .catch((err) => {
          console.error("Error sending email:", err);
        });

      setLeaveRequests((prevRequests) => [
        ...prevRequests,
        {
          name,
          type: leaveType,
          reason,
          start: startDate,
          end: endDate,
          status: "pending",
        },
      ]);

      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error) {
      console.error("Error applying leave:", error.message);
    }
  };

  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="leave-tracker">
      <h2>Leave Tracker</h2>

      {/* Tab navigation */}
      <div className="tab-buttons">
        <button
          className={activeTab === "leaveForm" ? "active" : ""}
          onClick={() => setActiveTab("leaveForm")}
        >
          Leave Form
        </button>
        <button
          className={activeTab === "pastSubmits" ? "active" : ""}
          onClick={() => setActiveTab("pastSubmits")}
        >
          Past Submits
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "leaveForm" && (
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled
              />
            </label>

            <label className="label">
              Leave Day Type:
              <select
                name="attendanceStatus"
                onChange={(e) => {
                  setLeaveDayType(e.target.value);
                }}
              >
                <option value="HALF_DAY_LEAVE">Half Day</option>
                <option value="LEAVE">Full Day</option>
                <option value="PERMISSION">Permission</option>
              </select>
            </label>

            {leaveDayType === "HALF_DAY_LEAVE" && (
              <label className="label">
                Half Day Period:
                <select
                  name="halfDayPeriod"
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value)}
                >
                  <option value="">Select Half</option>
                  <option value="FIRST_HALF">First Half</option>
                  <option value="SECOND_HALF">Second Half</option>
                </select>
              </label>
            )}

            {leaveDayType === "PERMISSION" && (
              <label>
                Permission Hours:
                <input
                  type="number"
                  value={permissionHours}
                  onChange={(e) => setPermissionHours(e.target.value)}
                  placeholder="Enter hours (e.g., 2)"
                  min="1"
                  max="4"
                />
              </label>
            )}
            {leaveDayType !== "PERMISSION" && (
              <label>
                Leave Type:
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="">Select Leave Type</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="LEAVE_WITHOUT_PAY">Leave Without Pay</option>
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                </select>
              </label>
            )}
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <label>
              Reason:
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button type="button" onClick={handleApplyLeave}>
              Apply Leave
            </button>
          </form>
        )}

        {isToastOpen && (
          <div className={`toast ${fadeOut ? "fade-out" : ""}`}>
            {toastMessage}
          </div>
        )}

        {activeTab === "pastSubmits" && (
          <>
            <h3>Leave Requests</h3>
            <ul>
              {leaveRequests.map((request, index) => (
                <li key={index}>
                  {request.name} | {request.type} | {request.start} to{" "}
                  {request.end} | {request.reason} |
                  {request.status === "pending"
                    ? " Pending"
                    : request.status === "accepted"
                    ? " Accepted"
                    : " Rejected"}
                </li>
              ))}
            </ul>
            <h3>Leave Balances:</h3>
            <ul>
              <li>Casual Leave: {leaveBalance.casualLeave}</li>
              <li>Sick Leave: {leaveBalance.sickLeave}</li>
              <li>Leave Without Pay: {leaveBalance.leaveWithoutPay}</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveTracker;

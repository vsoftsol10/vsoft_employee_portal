// import React, { useState, useEffect } from 'react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './NonAttendance.css';
// import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';

// const Attendance = () => {
//   const [date, setDate] = useState(new Date());
//   const [attendanceHistory, setAttendanceHistory] = useState({});
//   const [isToastOpen, setToastOpen] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false);
//   const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const [attendanceForm, setAttendanceForm] = useState({
//     checkInStarts: '',
//     checkInEnds: '',
//     yourCheckIn: '',
//     checkOutStarts: '',
//     checkOutEnds: '',
//     yourCheckOut: '',
//     leaveType: '',
//     status: '',
//     startDate: '',
//     endDate: ''
//   });
//   const [leaveDescription, setLeaveDescription] = useState('');

//   const db = getFirestore();
//   const auth = getAuth();

//   const formatTime = (timeString) => {
//     if (!timeString) return 'N/A';
//     const date = new Date(`1970-01-01T${timeString}:00`);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const fetchAttendanceData = async (uid) => {
//     try {
//       const timingsRef = doc(db, `employeetimings/${uid}`);
//       const timingsSnapshot = await getDoc(timingsRef);

//       if (timingsSnapshot.exists()) {
//         const timingsData = timingsSnapshot.data();
//         setAttendanceForm((prevState) => ({
//           ...prevState,
//           checkInStarts: timingsData.checkInStarts || '',
//           checkInEnds: timingsData.checkInEnds || '',
//           checkOutStarts: timingsData.checkOutStarts || '',
//           checkOutEnds: timingsData.checkOutEnds || '',
//           yourCheckIn: timingsData.yourCheckIn
//             ? timingsData.yourCheckIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             : '',
//           yourCheckOut: timingsData.yourCheckOut
//             ? timingsData.yourCheckOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             : '',
//           leaveType: timingsData.leaveType || '',
//           status: timingsData.status || '',
//           startDate: timingsData.startDate || '',
//           endDate: timingsData.endDate || ''
//         }));
//       } else {
//         setToastMessage('No attendance timings found for this employee');
//         setToastOpen(true);
//       }
//     } catch (error) {
//       console.error('Error fetching attendance data: ', error);
//       setToastMessage('Error fetching attendance data. Please try again later.');
//       setToastOpen(true);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         fetchAttendanceData(currentUser.uid);
//       } else {
//         console.log('No user is signed in.');
//       }
//     });
//     return () => unsubscribe();
//   }, [auth]);

//   const handleAttendanceFormChange = (e) => {
//     const { name, value } = e.target;
//     setAttendanceForm((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };
//   const handleAttendanceSubmit = async () => {
//     const uid = user ? user.uid : null;
//     if (uid) {
//         try {
//             const {
//                 yourCheckIn,
//                 yourCheckOut,
//                 checkInStarts,
//                 checkInEnds,
//                 checkOutStarts,
//                 checkOutEnds,
//                 status,
//                 startDate,
//                 endDate,
//             } = attendanceForm;

//             const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
//             let mark = null;

//             // Check if yourCheckIn and yourCheckOut are present
//             if (yourCheckIn && yourCheckOut) {
//                 const yourCheckInTime = new Date(`1970-01-01T${yourCheckIn}:00`).getTime();
//                 const yourCheckOutTime = new Date(`1970-01-01T${yourCheckOut}:00`).getTime();
//                 const checkInStartTime = new Date(`1970-01-01T${checkInStarts}:00`).getTime();
//                 const checkInEndTime = new Date(`1970-01-01T${checkInEnds}:00`).getTime();
//                 const checkOutStartTime = new Date(`1970-01-01T${checkOutStarts}:00`).getTime();
//                 const checkOutEndTime = new Date(`1970-01-01T${checkOutEnds}:00`).getTime();

//                 // Check for Present or Late
//                 if (yourCheckInTime >= checkInStartTime && yourCheckInTime <= checkInEndTime &&
//                     yourCheckOutTime >= checkOutStartTime && yourCheckOutTime <= checkOutEndTime) {
//                     mark = 'present'; // Mark as present
//                 } else {
//                     mark = 'late'; // Mark as late
//                 }
//             }

//             // If yourCheckIn and yourCheckOut are not present, check leave conditions
//             if (!mark) {
//                 if (status === 'accepted' || status === 'permission' || status === 'lop') {
//                     // Check if the date falls within the leave period
//                     const startDateObj = new Date(startDate);
//                     const endDateObj = new Date(endDate);

//                     // If the startDate is today or within the range
//                     if (startDateObj.toDateString() === date.toDateString() ||
//                         (startDateObj <= date && endDateObj >= date)) {
//                         mark = status; // Use the status for leave type
//                     }
//                 }
//             }

//             // Update the attendance history with the appropriate mark
//             if (mark) {
//                 setAttendanceHistory((prev) => ({
//                     ...prev,
//                     [dateString]: mark // Ensure date is in YYYY-MM-DD format
//                 }));

//                 // Create a document in Firestore
//                 const attendanceRef = collection(db, 'allattendance', uid, 'attendance'); // Use a subcollection
//                 await setDoc(doc(attendanceRef, dateString), { status: mark }); // Store status with date as a sub-document

//                 setToastMessage(`Attendance marked as ${mark}!`);
//             } else {
//                 setToastMessage('No valid attendance or leave data found for today.');
//             }
//         } catch (error) {
//             setToastMessage('Error submitting attendance: ' + error.message);
//         }
//     } else {
//         setToastMessage('User not logged in');
//     }
//     setAttendanceFormOpen(false);
//     setToastOpen(true);
// };

// const tileContent = ({ date }) => {
//     const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
//     if (attendanceHistory[dateString] === 'present') {
//         return <div className="mark-attendance">&#10004;</div>; // Checkmark for present
//     } else if (attendanceHistory[dateString] === 'late') {
//         return <div className="mark-late">&#10008;</div>; // Crossmark for late
//     } else if (attendanceHistory[dateString] === 'leave') {
//         return <div className="mark-leave">&#10008;</div>; // Crossmark for leave
//     }
//     return null;
// };

//   const handleLeaveDescriptionChange = (e) => {
//     setLeaveDescription(e.target.value);
//   };

//   const handleLeaveSubmit = () => {
//     const dateString = date.toDateString();
//     setAttendanceHistory((prev) => ({
//       ...prev,
//       [dateString]: 'leave'
//     }));
//     console.log('Leave Submitted:', leaveDescription);
//     setLeaveFormOpen(false);
//     setToastMessage('Leave marked successfully!');
//     setToastOpen(true);
//   };

//   return (
//     <div className="attendance-page">
//       <h1>Attendance Calendar</h1>
//       <Calendar onChange={setDate} value={date} tileContent={tileContent} className="calendar" />

//       <button onClick={() => setAttendanceFormOpen(!isAttendanceFormOpen)} className="enter-attendance-btn">
//         Enter Attendance
//       </button>

//       {isAttendanceFormOpen && (
//         <div className="attendance-form">
//           <h3>Enter Attendance Details</h3>
//           {['checkInStarts', 'checkInEnds', 'yourCheckIn', 'checkOutStarts', 'checkOutEnds', 'yourCheckOut'].map((field) => (
//             <div key={field} className="form-group">
//               <label htmlFor={field}>{field}</label>
//               <input
//                 type="time"
//                 id={field}
//                 name={field}
//                 value={attendanceForm[field]}
//                 onChange={handleAttendanceFormChange}
//                 className="form-input"
//               />
//             </div>
//           ))}
//           <div className="form-group">
//             <label htmlFor="leaveType">Leave Type</label>
//             <input
//               type="text"
//               id="leaveType"
//               name="leaveType"
//               value={attendanceForm.leaveType}
//               onChange={handleAttendanceFormChange}
//               className="form-input"
//             />
//           </div>
//           <button onClick={handleAttendanceSubmit}>Submit Attendance</button>
//         </div>
//       )}

//       <button onClick={() => setLeaveFormOpen(!isLeaveFormOpen)} className="leave-btn">
//         Request Leave
//       </button>

//       {isLeaveFormOpen && (
//         <div className="leave-form">
//           <h3>Request Leave</h3>
//           <textarea
//             placeholder="Leave description"
//             value={leaveDescription}
//             onChange={handleLeaveDescriptionChange}
//             className="leave-description"
//           />
//           <button onClick={handleLeaveSubmit}>Submit Leave</button>
//         </div>
//       )}

//       {isToastOpen && (
//         <div className="toast">
//           {toastMessage}
//           <button onClick={() => setToastOpen(false)}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Attendance;

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./NonAttendance.css";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  calculateFixedWorkingHours,
  convertTo12HourFormat,
  formatTime,
  getTimeFromHHMM,
} from "../helpers/helpers";
import { firestore } from "../firebaseConfig";

const Attendance = ({ employeeData }) => {
  const [date, setDate] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [currentAttendance, setCurrentAttendance] = useState({});
  const [attendanceHistoryIn, setAttendanceHistoryIn] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const db = getFirestore();
  const auth = getAuth();

  const getUserUID = () => {
    const user = auth.currentUser;
    return user ? user.uid : null;
  };

  const fetchHolidays = async () => {
    const holidaysRef = collection(firestore, "holidays");
    const snapshot = await getDocs(holidaysRef);
    const holidayList = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const holidayDate = new Date(data.date); // Assume date is stored in the correct format
      const year = holidayDate.getFullYear();

      // Only add holidays that match the selected year
      if (year === selectedYear) {
        holidayList.push(holidayDate);
      }
    });

    setHolidays(holidayList);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setToastOpen(true);
    setFadeOut(false);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setToastOpen(false), 500);
    }, 3000);
  };

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

  console.log(attendanceHistory, "attendanceHistory");
  console.log(userData, "userData");

  const tileContent = ({ date }) => {
    const dateString = date.toDateString(); // Convert the date to a string format
    console.log("attendHistory1", dateString, attendanceHistoryIn);

    // Check if the date is a holiday
    const isHoliday = holidays.some(
      (holiday) => holiday.toDateString() === dateString
    );

    // Initialize a content array to hold the components we want to render
    const content = [];

    // If it's a holiday, add the holiday marker
    if (isHoliday) {
      content.push(
        <div
          key="holiday"
          style={{
            backgroundColor: "red",
            borderRadius: "50%",
            width: "100%",
            height: "100%",
            position: "absolute", // Ensure it overlays correctly
            top: "0",
            left: "0",
          }}
        >
          <span style={{ color: "white" }}>Holiday</span>
        </div>
      );
    }

    // Check attendance status for the current date
    if (attendanceHistoryIn[dateString]) {
      console.log("attendHistory", dateString);
      const status = attendanceHistoryIn[dateString];

      if (status.attendanceStatus === "VALID") {
        content.push(
          <div
            key="present"
            className="mark-attendance"
            style={{ marginTop: "-14px" }}
          >
            ✔️
          </div>
        ); // Mark as present
      } else if (
        status.attendanceStatus === "LEAVE" &&
        status.leaveType === "SICK_LEAVE"
      ) {
        content.push(
          <div
            key="sick-leave"
            className="mark-sick-leave"
            style={{ marginTop: "-14px" }}
          >
            🤒
          </div>
        ); // Mark as sick leave
      } else if (
        status.attendanceStatus === "LEAVE" &&
        status.leaveType === "CASUAL_LEAVE"
      ) {
        content.push(
          <div
            key="casual-leave"
            className="mark-casual-leave"
            style={{ marginTop: "-14px" }}
          >
            🏖️
          </div>
        ); // Mark as casual leave
      } else if (
        status.attendanceStatus === "LEAVE" &&
        status.leaveType === "LEAVE_WITHOUT_PAY"
      ) {
        content.push(
          <div
            key="leave-without-pay"
            className="mark-leave-without-pay"
            style={{ marginTop: "-14px" }}
          >
            💸
          </div>
        ); // Mark as unpaid leave
      } else if (status.attendanceStatus === "HALF_DAY_LEAVE") {
        content.push(
          <div
            key="half-day-leave"
            className="mark-half-day-leave"
            style={{ marginTop: "-14px" }}
          >
            🌗
          </div>
        ); // Mark as half-day leave
      }
    }

    // Return the combined content or null if nothing to display
    return content.length > 0 ? (
      <div style={{ position: "relative" }}>{content}</div>
    ) : null;
  };

  const handleCheckIn = async () => {
    const uid = getUserUID(); // Assume this function returns the current user's UID
    const currentDate = new Date();
    const dateString = currentDate.toDateString(); // Unique document for the day
    const attendanceRef = doc(db, `oftenusers/${uid}/checkins`, dateString); // Document for today's attendance

    try {
      const docSnap = await getDoc(attendanceRef);
      const data = docSnap.data();
      if (data) {
        if (data?.checkInTime) {
          console.log("Already checked in today");
          setToastMessage("Already checked in today");
        } else if (data.attendanceStatus === "LEAVE") {
          console.log("Already applied for Leave today");
          setToastMessage("Already applied for Leave today");
        } else if (data.attendanceStatus === "HALF_DAY_LEAVE") {
          const checkInEnds = getTimeFromHHMM(userData.checkInEnds);
          const checkOutEnds = getTimeFromHHMM(userData.checkOutEnds);

          if (
            data.halfDayPeriod === "FIRST_HALF" &&
            currentDate <= checkInEnds
          ) {
            console.log("Cannot check in during the first half of your leave.");
            setToastMessage(
              "Cannot check in during the first half of your leave."
            );
            return; // Exit if the user is on leave during the first half
          } else if (
            data.halfDayPeriod === "SECOND_HALF" &&
            currentDate >= checkOutEnds
          ) {
            console.log(
              "Cannot check in during the second half of your leave."
            );
            setToastMessage(
              "Cannot check in during the second half of your leave."
            );
            return; // Exit if the user is on leave during the second half
          }
          await updateDoc(attendanceRef, {
            checkInTime: Timestamp.fromDate(currentDate),
            checkOutTime: null, // Set to null for now; will be updated later
            status: "half_day", // Update status to half_day
            attendanceStatus: "HALF_DAY_LEAVE",
          });

          console.log("Half-day leave check-in recorded.");
          showToastMessage("Half-day leave check-in recorded.");
        }
        // Optionally: Show a message that the user has already checked in today
      } else {
        const checkInStarts = getTimeFromHHMM(userData.checkInStarts);
        const checkInEnds = getTimeFromHHMM(userData.checkInEnds);

        let checkinStatus = "on-time"; // Default status

        // Check if the current time is before the check-in start
        if (currentDate < checkInStarts) {
          checkinStatus = "early"; // Mark as early
        } else if (currentDate > checkInEnds) {
          checkinStatus = "late"; // Mark as late
        }

        await setDoc(attendanceRef, {
          checkInTime: Timestamp.fromDate(currentDate),
          checkOutTime: null, // Set to null for now; will be updated later
          status: checkinStatus, // Save the status (early, late, or on-time)
          attendanceStatus: "VALID",
        });

        const message =
          checkinStatus === "early"
            ? "Early check-in recorded."
            : checkinStatus === "late"
            ? "Late check-in recorded."
            : "Check-in time recorded.";

        console.log(message);
        showToastMessage(message);
        console.log("Check-in time recorded.");
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      showToastMessage("Error during check-in: " + error.message);
    }
  };

  const handleCheckOut = async () => {
    const uid = getUserUID();
    const currentDate = new Date();
    const dateString = currentDate.toDateString(); // Same document as check-in
    const attendanceRef = doc(db, `oftenusers/${uid}/checkins`, dateString); // Document for today's attendance

    try {
      const docSnap = await getDoc(attendanceRef);
      const data = docSnap.data();
      if (data.checkInTime) {
        if (data.checkOutTime) {
          console.log("Already checked out for today.");
          showToastMessage("You have already checked out for today.");
          return; // Exit the function to prevent further execution
        }

        const checkInTime = data.checkInTime.toDate(); //
        const checkInEnds = getTimeFromHHMM(userData.checkInEnds);
        console.log("test1", userData.checkInEnds);
        const checkOutStarts = getTimeFromHHMM(userData.checkOutStarts);
        console.log("test2", userData.checkOutStarts);
        const checkOutEnds = getTimeFromHHMM(userData.checkOutEnds);
        console.log("test3", userData.checkOutEnds);

        const totalFixedHours = calculateFixedWorkingHours(
          checkInEnds,
          checkOutEnds
        );
        console.log("test4", totalFixedHours);
        let checkoutStatus = "on-time"; // Default status
        const totalHoursWorked = (currentDate - checkInTime) / (1000 * 60 * 60);

        // Check if the current time is before the check-in start
        if (currentDate < checkOutStarts) {
          checkoutStatus = "early"; // Mark as early
        } else if (currentDate > checkOutEnds) {
          checkoutStatus = "overtime"; // Mark as late
        }

        let attendanceStatus = "LEAVE"; // Default to leave
        if (totalHoursWorked >= totalFixedHours) {
          attendanceStatus = "VALID"; // Full day
        } else if (totalHoursWorked >= totalFixedHours * 0.5) {
          // If hours worked are between 50% and 75% of totalFixedHours
          // attendanceStatus = "HALF_DAY_LEAVE"; // Half day
          // leaveType = "LEAVE_WITHOUT_PAY"; // Set leave type

          // showToastMessage(
          //   "You have not completed enough hours. Please apply for leave (half day) if necessary."
          // );
          await updateDoc(attendanceRef, {
            checkoutStatus: checkoutStatus,
            checkOutTime: Timestamp.fromDate(currentDate),
            totalHoursWorked: totalHoursWorked.toFixed(2),
            attendanceStatus: "HALF_DAY_LEAVE",
            workedCompleted: false,
          });
          return;
        } else {
          // Inform user they should apply for leave
          showToastMessage(
            "You have not completed enough hours. Please apply for leave if necessary."
          );
          return; // Exit the function if insufficient hours
        }

        await updateDoc(attendanceRef, {
          checkoutStatus: checkoutStatus,
          checkOutTime: Timestamp.fromDate(currentDate),
          totalHoursWorked: totalHoursWorked.toFixed(2),
          attendanceStatus: attendanceStatus,
          workedCompleted: attendanceStatus === "VALID" ? true : false,
        });

        const message =
          checkoutStatus === "early"
            ? "Early check-out recorded."
            : checkoutStatus === "late"
            ? "Over Time check-out recorded."
            : "Check-out time recorded.";
        console.log("Check-out time recorded.");
        showToastMessage(message);
      } else {
        console.log("No check-in record found for today.");
        showToastMessage("You need to check in first before checking out.");
      }
    } catch (error) {
      console.error("Error during check-out:", error);
      showToastMessage("Error during check-out: " + error.message);
    }
  };

  const getTodayAttendanceInfo = async (selectedDate) => {
    const uid = getUserUID(); // Assume this function returns the current user's UID
    const dateString = selectedDate.toDateString(); // Use the selected date
    const attendanceRef = doc(db, `oftenusers/${uid}/checkins`, dateString); // Document for the selected date's attendance

    try {
      const docSnap = await getDoc(attendanceRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Attendance Info for selected date:", data);
        setCurrentAttendance(data); // Store the attendance info in state
      } else {
        console.log("No attendance record found for the selected date.");
        setCurrentAttendance(null); // No record found
      }
    } catch (error) {
      console.error("Error fetching attendance info:", error);
    }
  };

  const getAttendanceHistory = async () => {
    const uid = getUserUID();
    const attendanceRef = collection(db, `oftenusers/${uid}/checkins`);
    const history = {};

    try {
      const querySnapshot = await getDocs(attendanceRef);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history[doc.id] = {
          ...data,
        };
      });
      setAttendanceHistoryIn(history);
      // return history; // Return the fetched attendance history
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      showToastMessage("Error fetching attendance history: " + error.message);
      setAttendanceHistoryIn({});
      return null; // Return null on error
    }
  };

  useEffect(() => {
    const uid = getUserUID();
    fetchUserData(uid);
  }, [db]);

  useEffect(() => {
    getTodayAttendanceInfo(date);
  }, [db, date]);

  useEffect(() => {
    getAttendanceHistory();
  }, [db]);

  console.log(currentAttendance, "currentAttendance");
  console.log(attendanceHistoryIn, "attendanceHistoryIn");

  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>

      <Calendar
        onChange={setDate}
        value={date}
        tileContent={tileContent}
        className="calendar"
      />
      <div className="attendance-info">
        <h3>Attendance Information</h3>
        {userData ? (
          <>
            <div className="time-info">
              <p>
                <strong>Check-in Window:</strong>{" "}
                {convertTo12HourFormat(userData?.checkInStarts)} -{" "}
                {convertTo12HourFormat(userData?.checkInEnds)}
              </p>
            </div>

            <div className="time-info">
              <p>
                <strong>Check-out Window:</strong>{" "}
                {convertTo12HourFormat(userData?.checkOutStarts)} -{" "}
                {convertTo12HourFormat(userData?.checkOutEnds)}
              </p>
            </div>
          </>
        ) : (
          <p>No user data available.</p>
        )}
      </div>

      {currentAttendance ? (
        <>
          <div className="time-info">
            <p>
              <strong>Check-in time:</strong>{" "}
              {formatTime(currentAttendance?.checkInTime)}
            </p>
          </div>

          <div className="time-info">
            <p>
              <strong>Check-out time:</strong>{" "}
              {formatTime(currentAttendance?.checkOutTime)}
            </p>
          </div>
        </>
      ) : (
        <p>No user data available.</p>
      )}

      {/* Check-in Button */}
      <button className="checkout-button" onClick={handleCheckIn}>
        {currentAttendance?.checkInTime ? "Already Checked IN" : "Check-in"}
      </button>

      {/* Check-out Button */}
      <button className="checkout-button" onClick={handleCheckOut}>
        {currentAttendance?.checkOutTime ? "Already Checked OUT" : "Check-out"}
      </button>

      {/* <button onClick={() => setAttendanceFormOpen(true)}>
        Add Attendance
      </button> */}

      {isToastOpen && (
        <div className={`toast ${fadeOut ? "fade-out" : ""}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Attendance;

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./NonAttendance.css";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
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
  getTimeFromHHMM,
} from "../helpers/helpers";

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

  const [attendanceForm, setAttendanceForm] = useState({
    checkInStarts: "",
    checkInEnds: "",
    yourCheckIn: "",
    checkOutStarts: "",
    checkOutEnds: "",
    yourCheckOut: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveDescription: "",
    leaveType: "Sick Leave",
  });

  const db = getFirestore();
  const auth = getAuth();

  const getUserUID = () => {
    const user = auth.currentUser;
    return user ? user.uid : null;
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

  const fetchAttendanceHistory = async (uid) => {
    const attendanceRef = collection(db, `oftenusers/${uid}/checkins`);
    try {
      const attendanceSnapshot = await getDocs(attendanceRef);
      const history = {};
      attendanceSnapshot.forEach((doc) => {
        const data = doc.data();
        const attendanceDate = new Date(
          data.checkInTime.seconds * 1000
        ).toDateString();
        history[attendanceDate] = data.leaveType || "valid";

        // Check for current day's document
        const currentDateString = date.toDateString();
        if (attendanceDate === currentDateString) {
          const checkIn = data.checkIn; // Check in timestamp
          const checkOut = data.checkOut; // Check out timestamp
          if (checkIn) {
            setAttendanceForm((prev) => ({
              ...prev,
              yourCheckIn: new Date(checkIn.seconds * 1000)
                .toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .slice(0, 5), // Ensure only HH:mm is set
            }));
          }
          if (checkOut) {
            setAttendanceForm((prev) => ({
              ...prev,
              yourCheckOut: new Date(checkOut.seconds * 1000)
                .toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .slice(0, 5), // Ensure only HH:mm is set
            }));
          }
        }
      });
      setAttendanceHistory(history);
      showToastMessage("Attendance and leave history loaded successfully");
    } catch (error) {
      showToastMessage("Error fetching attendance history: " + error.message);
    }
  };

  const fetchUserData = async (uid) => {
    const docRef = doc(db, "employees", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserData(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    const uid = getUserUID();
    console.log(uid, "uid");
    if (uid) {
      fetchAttendanceHistory(uid);
    } else {
      showToastMessage("User not logged in");
    }
  }, [auth, db, date]); // Fetch on date change

  console.log(attendanceHistory, "attendanceHistory");
  console.log(userData, "userData");

  const handleAttendanceFormChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkIfEventExists = (dateString) => {
    return attendanceHistory.hasOwnProperty(dateString);
  };

  const handleAttendanceSubmit = async () => {
    const uid = getUserUID();
    const dateString = date.toDateString();

    if (uid) {
      if (checkIfEventExists(dateString)) {
        showToastMessage("An event has already been recorded for this date.");
        return;
      }

      try {
        await addDoc(collection(db, `oftenusers/${uid}/checkins`), {
          checkInTime: new Date(
            date.setHours(
              attendanceForm.yourCheckIn.split(":")[0],
              attendanceForm.yourCheckIn.split(":")[1]
            )
          ),
          ...attendanceForm,
        });
        setAttendanceHistory((prev) => ({
          ...prev,
          [dateString]: "valid",
        }));
        showToastMessage("Attendance submitted successfully!");
      } catch (error) {
        showToastMessage("Error submitting attendance: " + error.message);
      }
    } else {
      showToastMessage("User not logged in");
    }
    setAttendanceFormOpen(false);
  };

  const handleLeaveSubmit = async () => {
    const uid = getUserUID(); // Get user UID
    const selectDate = date; // Selected date from the calendar
    const dateString = selectDate.toDateString(); // Unique document for the day
    const attendanceRef = doc(db, `oftenusers/${uid}/checkins`, dateString);
    const docRef = doc(db, "employees", uid); // Reference to user's document

    const currentDate = new Date(); // Get the current date
    if (selectDate < currentDate) {
      showToastMessage("You cannot submit leave for past dates."); // Show message if the date is in the past
      return; // Exit the function early
    }
    let leaveCount = leaveForm.attendanceStatus == "LEAVE" ? 1 : 0.5;
    const casualLeaveCount = parseFloat(userData.casualLeave); // Casual leave count
    const sickLeaveCount = parseFloat(userData.sickLeave); // Sick leave count

    if (
      leaveForm.leaveType === "CASUAL_LEAVE" &&
      casualLeaveCount <= 0 &&
      leaveCount <= casualLeaveCount
    ) {
      showToastMessage("You do not have any casual leave left.");
      return;
    }

    if (
      leaveForm.leaveType === "SICK_LEAVE" &&
      sickLeaveCount <= 0 &&
      leaveCount <= sickLeaveCount
    ) {
      showToastMessage("You do not have any sick leave left.");
      return;
    }

    if (uid) {
      const docSnap = await getDoc(attendanceRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let checkInEnds = getTimeFromHHMM(userData.checkInEnds);

        // Check if the attendance status is already set to LEAVE or HALF_DAY_LEAVE
        if (
          data.attendanceStatus === "LEAVE" ||
          data.attendanceStatus === "HALF_DAY_LEAVE"
        ) {
          showToastMessage("An event has already been recorded for this date.");
          return; // Exit if leave is already recorded
        } else if (data.checkOutTime) {
          showToastMessage("Already checkout ,won't apply for leave now");
          return; // Exit if leave is already recorded
        } else if (checkInEnds < currentDate) {
          showToastMessage("Already time up ,won't apply for leave now");
          return; // Exit if leave is already recorded
        }

        // If there's already an attendance record, update it
        try {
          await updateDoc(attendanceRef, {
            attendanceStatus: leaveForm.attendanceStatus, // Update the status to LEAVE
            leaveType: leaveForm.leaveType, // Update leave type
            leaveDescription: leaveForm.leaveDescription, // Update leave description
          });

          let leaveDeduction = 1; // Default deduction is 1 for full leave
          if (leaveForm.attendanceStatus === "HALF_DAY_LEAVE") {
            leaveDeduction = 0.5; // Deduct 0.5 for half-day leave
          }
          if (leaveForm.leaveType === "CASUAL_LEAVE") {
            await updateDoc(docRef, {
              casualLeave: casualLeaveCount - leaveDeduction, // Deduct based on leave type
            });
          } else if (leaveForm.leaveType === "SICK_LEAVE") {
            await updateDoc(docRef, {
              sickLeave: sickLeaveCount - leaveDeduction, // Deduct based on leave type
            });
          }

          setAttendanceHistoryIn((prev) => ({
            ...prev,
            [dateString]: {
              attendanceStatus: "LEAVE",
              leaveType: leaveForm.leaveType,
              leaveDescription: leaveForm.leaveDescription,
            },
          }));
          showToastMessage(`${leaveForm.leaveType} submitted successfully!`);
        } catch (error) {
          showToastMessage("Error submitting leave: " + error.message);
        }
      } else {
        // If no document exists for that date, create a new one
        try {
          await setDoc(attendanceRef, {
            attendanceStatus: "LEAVE",
            leaveType: leaveForm.leaveType,
            leaveDescription: leaveForm.leaveDescription,
          });

          let leaveDeduction = 1; // Default deduction is 1 for full leave
          if (leaveForm.attendanceStatus === "HALF_DAY_LEAVE") {
            leaveDeduction = 0.5; // Deduct 0.5 for half-day leave
          }
          if (leaveForm.leaveType === "CASUAL_LEAVE") {
            await updateDoc(docRef, {
              casualLeave: casualLeaveCount - leaveDeduction, // Deduct based on leave type
            });
          } else if (leaveForm.leaveType === "SICK_LEAVE") {
            await updateDoc(docRef, {
              sickLeave: sickLeaveCount - leaveDeduction, // Deduct based on leave type
            });
          }

          setAttendanceHistoryIn((prev) => ({
            ...prev,
            [dateString]: {
              attendanceStatus: "LEAVE",
              leaveType: leaveForm.leaveType,
              leaveDescription: leaveForm.leaveDescription,
            },
          }));
          showToastMessage(`${leaveForm.leaveType} submitted successfully!`);
        } catch (error) {
          showToastMessage("Error submitting leave: " + error.message);
        }
      }
    } else {
      showToastMessage("User not logged in");
    }

    setLeaveFormOpen(false); // Close the leave form
  };

  const handleDeleteEvent = async () => {
    const uid = getUserUID();
    const dateString = date.toDateString();

    if (uid) {
      const attendanceRef = collection(db, `oftenusers/${uid}/checkins`);
      const querySnapshot = await getDocs(attendanceRef);
      let eventToDelete = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const attendanceDate = new Date(
          data.checkInTime.seconds * 1000
        ).toDateString();
        if (attendanceDate === dateString) {
          eventToDelete = doc.id;
        }
      });

      if (eventToDelete) {
        try {
          await deleteDoc(doc(attendanceRef, eventToDelete));
          const newAttendanceHistory = { ...attendanceHistory };
          delete newAttendanceHistory[dateString];
          setAttendanceHistory(newAttendanceHistory);
          showToastMessage("Event deleted successfully!");
        } catch (error) {
          showToastMessage("Error deleting event: " + error.message);
        }
      } else {
        showToastMessage("No event found for this date.");
      }
    } else {
      showToastMessage("User not logged in");
    }
    setConfirmDeleteOpen(false);
  };

  // const tileContent = ({ date }) => {
  //   const dateString = date.toDateString();
  //   if (attendanceHistory[dateString] === "VALID") {
  //     return <div className="mark-attendance">✔️</div>;
  //   } else if (attendanceHistory[dateString] === "SICK_LEAVE") {
  //     return <div className="mark-sick-leave">🤒</div>;
  //   } else if (attendanceHistory[dateString] === "CASUAL_LEAVE") {
  //     return <div className="mark-casual-leave">🏖️</div>;
  //   } else if (attendanceHistory[dateString] === "LEAVE_WITHOUT_PAY") {
  //     return <div className="mark-leave-without-pay">💸</div>;
  //   }
  //   return null;
  // };

  const tileContent = ({ date }) => {
    const dateString = date.toDateString(); // Convert the date to a string format

    // Check attendance status for the current date
    if (attendanceHistoryIn[dateString]) {
      const status = attendanceHistoryIn[dateString];

      if (status.attendanceStatus === "VALID") {
        return <div className="mark-attendance">✔️</div>; // Mark as present
      } else if (
        (status.attendanceStatus = "LEAVE" && status.leaveType === "SICK_LEAVE")
      ) {
        return <div className="mark-sick-leave">🤒</div>; // Mark as sick leave
      } else if (
        (status.attendanceStatus =
          "LEAVE" && status.leaveType === "CASUAL_LEAVE")
      ) {
        return <div className="mark-casual-leave">🏖️</div>; // Mark as casual leave
      } else if (
        (status.attendanceStatus =
          "LEAVE" && status.leaveType === "LEAVE_WITHOUT_PAY")
      ) {
        return <div className="mark-leave-without-pay">💸</div>; // Mark as unpaid leave
      } else if ((status.attendanceStatus = "HALF_DAY_LEAVE")) {
        return <div className="mark-leave-without-pay">🌗</div>; // Mark as unpaid leave
      }
    }
    return null; // Return null if no status is found for the date
  };

  const handleDateClick = (date) => {
    setDate(date);
    const dateString = date.toDateString();
    if (checkIfEventExists(dateString)) {
      setConfirmDeleteOpen(true);
    } else {
      showToastMessage("No event found for this date.");
    }
  };

  const handleCheckIn = async () => {
    const uid = getUserUID(); // Assume this function returns the current user's UID
    const currentDate = new Date();
    const dateString = currentDate.toDateString(); // Unique document for the day
    const attendanceRef = doc(db, `oftenusers/${uid}/checkins`, dateString); // Document for today's attendance

    try {
      const docSnap = await getDoc(attendanceRef);
      if (docSnap.exists()) {
        console.log("Already checked in today");
        setToastMessage("Already checked in today");
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
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.checkOutTime) {
          console.log("Already checked out for today.");
          showToastMessage("You have already checked out for today.");
          return; // Exit the function to prevent further execution
        }

        const checkInTime = data.checkInTime.toDate(); //
        const checkInEnds = getTimeFromHHMM(userData.checkInEnds);
        const checkOutStarts = getTimeFromHHMM(userData.checkOutStarts);
        const checkOutEnds = getTimeFromHHMM(userData.checkOutEnds);

        const totalFixedHours = calculateFixedWorkingHours(
          checkInEnds,
          checkOutEnds
        );

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

          showToastMessage(
            "You have not completed enough hours. Please apply for leave (half day) if necessary."
          );
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
          checkInTime: data.checkInTime.toDate().toLocaleString(), // Convert to local string format
          checkOutTime: data.checkOutTime
            ? data.checkOutTime.toDate().toLocaleString()
            : null,
          totalHoursWorked: data.totalHoursWorked,
          checkoutStatus: data.checkoutStatus,
          attendanceStatus: data.attendanceStatus,
          leaveType: data?.leaveType,
          leaveDescription: data?.leaveDescription,
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

  console.log(currentAttendance, "getTodayAttendanceInfo");

  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>

      <Calendar
        onChange={handleDateClick}
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
                {convertTo12HourFormat(userData.checkInStarts)} -{" "}
                {convertTo12HourFormat(userData.checkInEnds)}
              </p>
            </div>

            <div className="time-info">
              <p>
                <strong>Check-out Window:</strong>{" "}
                {convertTo12HourFormat(userData.checkOutStarts)} -{" "}
                {convertTo12HourFormat(userData.checkOutEnds)}
              </p>
            </div>
          </>
        ) : (
          <p>No user data available.</p>
        )}
      </div>

      <button className="checkout-button" onClick={handleCheckIn}>
        Check-in
      </button>

      <button className="checkout-button" onClick={handleCheckOut}>
        Check-out
      </button>

      {/* <button onClick={() => setAttendanceFormOpen(true)}>
        Add Attendance
      </button> */}
      <button onClick={() => setLeaveFormOpen(true)}>Add Leave</button>

      {isToastOpen && (
        <div className={`toast ${fadeOut ? "fade-out" : ""}`}>
          {toastMessage}
        </div>
      )}
      {isAttendanceFormOpen && (
        <div className="attendance-form">
          <h2>Attendance Form</h2>
          <label className="label">
            Check In Starts:
            <input
              type="time"
              name="checkInStarts"
              onChange={handleAttendanceFormChange}
            />
          </label>
          <label className="label">
            Check In Ends:
            <input
              type="time"
              name="checkInEnds"
              onChange={handleAttendanceFormChange}
            />
          </label>
          <label className="label">
            Your Check In:
            <input
              type="time"
              name="yourCheckIn"
              value={attendanceForm.yourCheckIn}
              onChange={handleAttendanceFormChange}
            />
          </label>
          <label className="label">
            Check Out Starts:
            <input
              type="time"
              name="checkOutStarts"
              onChange={handleAttendanceFormChange}
            />
          </label>
          <label className="label">
            Check Out Ends:
            <input
              type="time"
              name="checkOutEnds"
              onChange={handleAttendanceFormChange}
            />
          </label>
          <label className="label">
            Your Check Out:
            <input
              type="time"
              name="yourCheckOut"
              value={attendanceForm.yourCheckOut}
              onChange={handleAttendanceFormChange}
            />
          </label>
          <button onClick={handleAttendanceSubmit}>Submit</button>
          <button onClick={() => setAttendanceFormOpen(false)}>Cancel</button>
        </div>
      )}

      {isLeaveFormOpen && (
        <div className="leave-form">
          <h2>Leave Form</h2>
          <label className="label">
            Leave Description:
            <input
              type="text"
              name="leaveDescription"
              onChange={handleLeaveFormChange}
            />
          </label>
          <label className="label">
            Leave Type:
            <select name="leaveType" onChange={handleLeaveFormChange}>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Leave Without Pay">Leave Without Pay</option>
            </select>
          </label>

          <label className="label">
            Leave Type:
            <select name="attendanceStatus" onChange={handleLeaveFormChange}>
              <option value="HALF_DAY_LEAVE">Half Day</option>
              <option value="LEAVE">Full Day</option>
            </select>
          </label>
          <button onClick={handleLeaveSubmit}>Submit Leave</button>
          <button onClick={() => setLeaveFormOpen(false)}>Cancel</button>
        </div>
      )}

      {isConfirmDeleteOpen && (
        <div className="confirm-delete">
          <h3>Confirm Delete Event</h3>
          <p>
            Are you sure you want to delete the event for {date.toDateString()}?
          </p>
          <button onClick={handleDeleteEvent}>Yes, Delete</button>
          <button onClick={() => setConfirmDeleteOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;

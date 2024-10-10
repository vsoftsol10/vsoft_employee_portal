import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './NonAttendance.css';
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    checkInStarts: '',
    checkInEnds: '',
    yourCheckIn: '',
    checkOutStarts: '',
    checkOutEnds: '',
    yourCheckOut: '',
    leaveType: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [leaveDescription, setLeaveDescription] = useState('');

  const db = getFirestore();
  const auth = getAuth();

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(`1970-01-01T${timeString}:00`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fetchAttendanceData = async (uid) => {
    try {
      const timingsRef = doc(db, `employeetimings/${uid}`);
      const timingsSnapshot = await getDoc(timingsRef);

      if (timingsSnapshot.exists()) {
        const timingsData = timingsSnapshot.data();
        setAttendanceForm((prevState) => ({
          ...prevState,
          checkInStarts: timingsData.checkInStarts || '',
          checkInEnds: timingsData.checkInEnds || '',
          checkOutStarts: timingsData.checkOutStarts || '',
          checkOutEnds: timingsData.checkOutEnds || '',
          yourCheckIn: timingsData.yourCheckIn
            ? timingsData.yourCheckIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          yourCheckOut: timingsData.yourCheckOut
            ? timingsData.yourCheckOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          leaveType: timingsData.leaveType || '',
          status: timingsData.status || '',
          startDate: timingsData.startDate || '',
          endDate: timingsData.endDate || ''
        }));
      } else {
        setToastMessage('No attendance timings found for this employee');
        setToastOpen(true);
      }
    } catch (error) {
      console.error('Error fetching attendance data: ', error);
      setToastMessage('Error fetching attendance data. Please try again later.');
      setToastOpen(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAttendanceData(currentUser.uid);
      } else {
        console.log('No user is signed in.');
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAttendanceFormChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleAttendanceSubmit = async () => {
    const uid = user ? user.uid : null;
    if (uid) {
        try {
            const {
                yourCheckIn,
                yourCheckOut,
                checkInStarts,
                checkInEnds,
                checkOutStarts,
                checkOutEnds,
                status,
                startDate,
                endDate,
            } = attendanceForm;

            const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            let mark = null;

            // Check if yourCheckIn and yourCheckOut are present
            if (yourCheckIn && yourCheckOut) {
                const yourCheckInTime = new Date(`1970-01-01T${yourCheckIn}:00`).getTime();
                const yourCheckOutTime = new Date(`1970-01-01T${yourCheckOut}:00`).getTime();
                const checkInStartTime = new Date(`1970-01-01T${checkInStarts}:00`).getTime();
                const checkInEndTime = new Date(`1970-01-01T${checkInEnds}:00`).getTime();
                const checkOutStartTime = new Date(`1970-01-01T${checkOutStarts}:00`).getTime();
                const checkOutEndTime = new Date(`1970-01-01T${checkOutEnds}:00`).getTime();

                // Check for Present or Late
                if (yourCheckInTime >= checkInStartTime && yourCheckInTime <= checkInEndTime &&
                    yourCheckOutTime >= checkOutStartTime && yourCheckOutTime <= checkOutEndTime) {
                    mark = 'present'; // Mark as present
                } else {
                    mark = 'late'; // Mark as late
                }
            }

            // If yourCheckIn and yourCheckOut are not present, check leave conditions
            if (!mark) {
                if (status === 'accepted' || status === 'permission' || status === 'lop') {
                    // Check if the date falls within the leave period
                    const startDateObj = new Date(startDate);
                    const endDateObj = new Date(endDate);

                    // If the startDate is today or within the range
                    if (startDateObj.toDateString() === date.toDateString() || 
                        (startDateObj <= date && endDateObj >= date)) {
                        mark = status; // Use the status for leave type
                    }
                }
            }

            // Update the attendance history with the appropriate mark
            if (mark) {
                setAttendanceHistory((prev) => ({
                    ...prev,
                    [dateString]: mark // Ensure date is in YYYY-MM-DD format
                }));

                // Create a document in Firestore
                const attendanceRef = collection(db, 'allattendance', uid, 'attendance'); // Use a subcollection
                await setDoc(doc(attendanceRef, dateString), { status: mark }); // Store status with date as a sub-document

                setToastMessage(`Attendance marked as ${mark}!`);
            } else {
                setToastMessage('No valid attendance or leave data found for today.');
            }
        } catch (error) {
            setToastMessage('Error submitting attendance: ' + error.message);
        }
    } else {
        setToastMessage('User not logged in');
    }
    setAttendanceFormOpen(false);
    setToastOpen(true);
};

const tileContent = ({ date }) => {
    const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
    if (attendanceHistory[dateString] === 'present') {
        return <div className="mark-attendance">&#10004;</div>; // Checkmark for present
    } else if (attendanceHistory[dateString] === 'late') {
        return <div className="mark-late">&#10008;</div>; // Crossmark for late
    } else if (attendanceHistory[dateString] === 'leave') {
        return <div className="mark-leave">&#10008;</div>; // Crossmark for leave
    }
    return null;
};

 

  const handleLeaveDescriptionChange = (e) => {
    setLeaveDescription(e.target.value);
  };

  const handleLeaveSubmit = () => {
    const dateString = date.toDateString();
    setAttendanceHistory((prev) => ({
      ...prev,
      [dateString]: 'leave'
    }));
    console.log('Leave Submitted:', leaveDescription);
    setLeaveFormOpen(false);
    setToastMessage('Leave marked successfully!');
    setToastOpen(true);
  };



  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>
      <Calendar onChange={setDate} value={date} tileContent={tileContent} className="calendar" />

      <button onClick={() => setAttendanceFormOpen(!isAttendanceFormOpen)} className="enter-attendance-btn">
        Enter Attendance
      </button>
      
      {isAttendanceFormOpen && (
        <div className="attendance-form">
          <h3>Enter Attendance Details</h3>
          {['checkInStarts', 'checkInEnds', 'yourCheckIn', 'checkOutStarts', 'checkOutEnds', 'yourCheckOut'].map((field) => (
            <div key={field} className="form-group">
              <label htmlFor={field}>{field}</label>
              <input
                type="time"
                id={field}
                name={field}
                value={attendanceForm[field]}
                onChange={handleAttendanceFormChange}
                className="form-input"
              />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="leaveType">Leave Type</label>
            <input
              type="text"
              id="leaveType"
              name="leaveType"
              value={attendanceForm.leaveType}
              onChange={handleAttendanceFormChange}
              className="form-input"
            />
          </div>
          <button onClick={handleAttendanceSubmit}>Submit Attendance</button>
        </div>
      )}

      <button onClick={() => setLeaveFormOpen(!isLeaveFormOpen)} className="leave-btn">
        Request Leave
      </button>
      
      {isLeaveFormOpen && (
        <div className="leave-form">
          <h3>Request Leave</h3>
          <textarea
            placeholder="Leave description"
            value={leaveDescription}
            onChange={handleLeaveDescriptionChange}
            className="leave-description"
          />
          <button onClick={handleLeaveSubmit}>Submit Leave</button>
        </div>
      )}

      {isToastOpen && (
        <div className="toast">
          {toastMessage}
          <button onClick={() => setToastOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;

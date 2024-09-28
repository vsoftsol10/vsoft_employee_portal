import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './NonAttendance.css';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Attendance = ({ employeeData }) => {
  const [date, setDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);

  const [attendanceForm, setAttendanceForm] = useState({
    checkInStarts: '',
    checkInEnds: '',
    yourCheckIn: '',
    checkOutStarts: '',
    checkOutEnds: '',
    yourCheckOut: ''
  });

  const [leaveDescription, setLeaveDescription] = useState('');

  const db = getFirestore();
  const auth = getAuth();

  // Fetching attendance data from Firestore
  const fetchAttendanceData = async (uid) => {
    const timingsRef = doc(db, `employeetimings/${uid}`);
    
    try {
      const timingsSnapshot = await getDoc(timingsRef);
      if (timingsSnapshot.exists()) {
        const timingsData = timingsSnapshot.data();
        
        // Update attendance form with fetched data
        setAttendanceForm((prevState) => ({
          ...prevState,
          checkInStarts: timingsData.checkInStarts || '',
          checkInEnds: timingsData.checkInEnds || '',
          checkOutStarts: timingsData.checkOutStarts || '',
          checkOutEnds: timingsData.checkOutEnds || ''
        }));

        setToastMessage('Attendance data loaded successfully');
      } else {
        setToastMessage('No attendance data found for this employee');
      }
    } catch (error) {
      setToastMessage('Error fetching attendance: ' + error.message);
    } finally {
      setToastOpen(true);
    }
  };

  const getUserUID = () => {
    const user = auth.currentUser;
    return user ? user.uid : null;
  };

  useEffect(() => {
    const uid = getUserUID();
    if (uid) {
      fetchAttendanceData(uid);
    } else {
      setToastMessage('User not logged in');
      setToastOpen(true);
    }
  }, [auth, db]);

  const handleAttendanceFormChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAttendanceSubmit = async () => {
    const uid = getUserUID();
    if (uid) {
      try {
        await addDoc(collection(db, `oftenusers/${uid}/checkins`), {
          checkInTime: new Date(date.setHours(attendanceForm.yourCheckIn.split(':')[0], attendanceForm.yourCheckIn.split(':')[1])),
          ...attendanceForm
        });

        // Mark attendance
        setAttendanceHistory((prev) => ({
          ...prev,
          [date.toDateString()]: 'valid' // Mark valid attendance
        }));

        setToastMessage('Attendance submitted successfully!');
      } catch (error) {
        setToastMessage('Error submitting attendance: ' + error.message);
      }
    } else {
      setToastMessage('User not logged in');
    }
    setAttendanceFormOpen(false);
    setToastOpen(true);
  };

  const handleLeaveDescriptionChange = (e) => {
    setLeaveDescription(e.target.value);
  };

  const handleLeaveSubmit = () => {
    // Mark leave
    setAttendanceHistory((prev) => ({
      ...prev,
      [date.toDateString()]: 'leave' // Mark leave
    }));

    console.log('Leave Submitted:', leaveDescription);
    setLeaveFormOpen(false);
  };

  // Custom tile content rendering
  const tileContent = ({ date }) => {
    const dateString = date.toDateString();
    if (attendanceHistory[dateString] === 'valid') {
      return <div className="mark-attendance">&#10004; </div>; // Checkmark for valid attendance
    } else if (attendanceHistory[dateString] === 'leave') {
      return <div className="mark-leave">&#10008; </div>; // Cross mark for leave
    }
    return null;
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
              <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
              <input
                type="time"
                name={field}
                value={attendanceForm[field]}
                onChange={handleAttendanceFormChange}
                className="form-input"
              />
            </div>
          ))}
          <button onClick={handleAttendanceSubmit} className="submit-btn">Submit</button>
        </div>
      )}

      <button onClick={() => setLeaveFormOpen(!isLeaveFormOpen)} className="enter-leave-btn">
        Enter Leave
      </button>
      
      {isLeaveFormOpen && (
        <div className="leave-form">
          <h3>Enter Leave Description</h3>
          <textarea
            name="leaveDescription"
            value={leaveDescription}
            onChange={handleLeaveDescriptionChange}
            placeholder="Describe the leave reason..."
            className="leave-textarea"
          />
          <button onClick={handleLeaveSubmit} className="submit-btn">Submit</button>
        </div>
      )}

      {isToastOpen && <div className="toast">{toastMessage}</div>}
      
      <h3>Attendance History</h3>
      <ul>
        {Object.keys(attendanceHistory).map((key) => (
          <li key={key}>
            {key}: {attendanceHistory[key] === 'valid' ? 'Valid Attendance' : 'Leave'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Attendance;

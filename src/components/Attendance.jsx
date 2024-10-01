import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './NonAttendance.css';
import { getFirestore, collection, addDoc, deleteDoc, getDocs, doc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';

const Attendance = ({ employeeData }) => {
  const [date, setDate] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [attendanceForm, setAttendanceForm] = useState({
    checkInStarts: '',
    checkInEnds: '',
    yourCheckIn: '',
    checkOutStarts: '',
    checkOutEnds: '',
    yourCheckOut: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveDescription: '',
    leaveType: 'Sick Leave'
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
        const attendanceDate = new Date(data.checkInTime.seconds * 1000).toDateString();
        history[attendanceDate] = data.leaveType || 'valid';
  
        // Check for current day's document
        const currentDateString = date.toDateString();
        if (attendanceDate === currentDateString) {
          const checkIn = data.checkIn; // Check in timestamp
          const checkOut = data.checkOut; // Check out timestamp
          if (checkIn) {
            setAttendanceForm(prev => ({
              ...prev,
              yourCheckIn: new Date(checkIn.seconds * 1000).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              }).slice(0, 5),  // Ensure only HH:mm is set
            }));
          }
          if (checkOut) {
            setAttendanceForm(prev => ({
              ...prev,
              yourCheckOut: new Date(checkOut.seconds * 1000).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              }).slice(0, 5),  // Ensure only HH:mm is set
            }));
          }
          
        }
      });
      setAttendanceHistory(history);
      showToastMessage('Attendance and leave history loaded successfully');
    } catch (error) {
      showToastMessage('Error fetching attendance history: ' + error.message);
    }
  };
  
  useEffect(() => {
    const uid = getUserUID();
    if (uid) {
      fetchAttendanceHistory(uid);
    } else {
      showToastMessage('User not logged in');
    }
  }, [auth, db, date]); // Fetch on date change

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
        showToastMessage('An event has already been recorded for this date.');
        return;
      }

      try {
        await addDoc(collection(db, `oftenusers/${uid}/checkins`), {
          checkInTime: new Date(date.setHours(attendanceForm.yourCheckIn.split(':')[0], attendanceForm.yourCheckIn.split(':')[1])),
          ...attendanceForm
        });
        setAttendanceHistory((prev) => ({
          ...prev,
          [dateString]: 'valid'
        }));
        showToastMessage('Attendance submitted successfully!');
      } catch (error) {
        showToastMessage('Error submitting attendance: ' + error.message);
      }
    } else {
      showToastMessage('User not logged in');
    }
    setAttendanceFormOpen(false);
  };

  const handleLeaveSubmit = async () => {
    const uid = getUserUID();
    const dateString = date.toDateString();

    if (uid) {
      if (checkIfEventExists(dateString)) {
        showToastMessage('An event has already been recorded for this date.');
        return;
      }

      try {
        await addDoc(collection(db, `oftenusers/${uid}/checkins`), {
          checkInTime: date,
          leaveType: leaveForm.leaveType,
          leaveDescription: leaveForm.leaveDescription
        });
        setAttendanceHistory((prev) => ({
          ...prev,
          [dateString]: leaveForm.leaveType
        }));
        showToastMessage(`${leaveForm.leaveType} submitted successfully!`);
      } catch (error) {
        showToastMessage('Error submitting leave: ' + error.message);
      }
    } else {
      showToastMessage('User not logged in');
    }
    setLeaveFormOpen(false);
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
        const attendanceDate = new Date(data.checkInTime.seconds * 1000).toDateString();
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
          showToastMessage('Event deleted successfully!');
        } catch (error) {
          showToastMessage('Error deleting event: ' + error.message);
        }
      } else {
        showToastMessage('No event found for this date.');
      }
    } else {
      showToastMessage('User not logged in');
    }
    setConfirmDeleteOpen(false);
  };

  const tileContent = ({ date }) => {
    const dateString = date.toDateString();
    if (attendanceHistory[dateString] === 'valid') {
      return <div className="mark-attendance">✔️</div>;
    } else if (attendanceHistory[dateString] === 'Sick Leave') {
      return <div className="mark-sick-leave">🤒</div>;
    } else if (attendanceHistory[dateString] === 'Casual Leave') {
      return <div className="mark-casual-leave">🏖️</div>;
    } else if (attendanceHistory[dateString] === 'Leave Without Pay') {
      return <div className="mark-leave-without-pay">💸</div>;
    }
    return null;
  };

  const handleDateClick = (date) => {
    setDate(date);
    const dateString = date.toDateString();
    if (checkIfEventExists(dateString)) {
      setConfirmDeleteOpen(true);
    } else {
      showToastMessage('No event found for this date.');
    }
  };

  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>
      <Calendar onChange={handleDateClick} value={date} tileContent={tileContent} className="calendar" />

      <button onClick={() => setAttendanceFormOpen(true)}>Add Attendance</button>
      <button onClick={() => setLeaveFormOpen(true)}>Add Leave</button>

      {isToastOpen && <div className={`toast ${fadeOut ? 'fade-out' : ''}`}>{toastMessage}</div>}
      {isAttendanceFormOpen && (
  <div className="attendance-form">
    <h2>Attendance Form</h2>
    <label className="label">
      Check In Starts:
      <input type="time" name="checkInStarts" onChange={handleAttendanceFormChange} />
    </label>
    <label className="label">
      Check In Ends:
      <input type="time" name="checkInEnds" onChange={handleAttendanceFormChange} />
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
      <input type="time" name="checkOutStarts" onChange={handleAttendanceFormChange} />
    </label>
    <label className="label">
      Check Out Ends:
      <input type="time" name="checkOutEnds" onChange={handleAttendanceFormChange} />
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
      <input type="text" name="leaveDescription" onChange={handleLeaveFormChange} />
    </label>
    <label className="label">
      Leave Type:
      <select name="leaveType" onChange={handleLeaveFormChange}>
        <option value="Sick Leave">Sick Leave</option>
        <option value="Casual Leave">Casual Leave</option>
        <option value="Leave Without Pay">Leave Without Pay</option>
      </select>
    </label>
    <button onClick={handleLeaveSubmit}>Submit Leave</button>
    <button onClick={() => setLeaveFormOpen(false)}>Cancel</button>
  </div>
)}

      {isConfirmDeleteOpen && (
        <div className="confirm-delete">
          <h3>Confirm Delete Event</h3>
          <p>Are you sure you want to delete the event for {date.toDateString()}?</p>
          <button onClick={handleDeleteEvent}>Yes, Delete</button>
          <button onClick={() => setConfirmDeleteOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './NonAttendance.css';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Attendance = ({ employeeData }) => {
  const [date, setDate] = useState(new Date());
  const [attendanceHistory, setAttendanceHistory] = useState({});
  const [isToastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [user, setUser] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    checkInStarts: '',
    checkInEnds: '',
    yourCheckIn: '',
    checkOutStarts: '',
    checkOutEnds: '',
    yourCheckOut: ''
  });
  const [leaveDescription, setLeaveDescription] = useState('');
  const [isAttendanceFormOpen, setAttendanceFormOpen] = useState(false); // To toggle attendance form
  const [isLeaveFormOpen, setLeaveFormOpen] = useState(false); // To toggle leave form

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
          yourCheckIn: timingsData.yourCheckIn ? timingsData.yourCheckIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          yourCheckOut: timingsData.yourCheckOut ? timingsData.yourCheckOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
      } else {
        setToastMessage('No attendance timings found for this employee');
      }
    } catch (error) {
      console.error('Error fetching attendance data: ', error);
      setToastMessage('Error fetching attendance data. Please try again later.');
    } finally {
      setToastOpen(true);
      setTimeout(() => setToastOpen(false), 3000); // Automatically close toast after 3 seconds
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
      const { checkInStarts, checkInEnds, yourCheckIn, checkOutStarts, checkOutEnds, yourCheckOut } = attendanceForm;

      const checkInTime = new Date(`1970-01-01T${yourCheckIn}:00`);
      const checkOutTime = new Date(`1970-01-01T${yourCheckOut}:00`);
      const startCheckInTime = new Date(`1970-01-01T${checkInStarts}:00`);
      const endCheckInTime = new Date(`1970-01-01T${checkInEnds}:00`);
      const startCheckOutTime = new Date(`1970-01-01T${checkOutStarts}:00`);
      const endCheckOutTime = new Date(`1970-01-01T${checkOutEnds}:00`);

      let attendanceStatus = 'absent'; // Default to absent

      // Check for attendance based on check-in and check-out times
      if (yourCheckIn && yourCheckOut) {
        if (checkInTime >= startCheckInTime && checkInTime <= endCheckInTime) {
          attendanceStatus = 'present';
        } else if (checkInTime > endCheckInTime) {
          attendanceStatus = 'late';
        }

        if (checkOutTime >= startCheckOutTime && checkOutTime <= endCheckOutTime) {
          attendanceStatus = attendanceStatus === 'present' ? 'present' : attendanceStatus; // Only mark as present if it's valid
        }
      }

      // Update the attendance history
      setAttendanceHistory((prev) => ({
        ...prev,
        [date.toDateString()]: attendanceStatus
      }));

      setToastMessage('Attendance submitted successfully!');
      setAttendanceFormOpen(false);
    } else {
      setToastMessage('User not logged in');
    }
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3000); // Automatically close toast after 3 seconds
  };

  const handleLeaveDescriptionChange = (e) => {
    setLeaveDescription(e.target.value);
  };

  const handleLeaveSubmit = () => {
    setAttendanceHistory((prev) => ({
      ...prev,
      [date.toDateString()]: 'leave'
    }));
    console.log('Leave Submitted:', leaveDescription);
    setLeaveFormOpen(false);
    setToastMessage('Leave submitted successfully!');
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 3000); // Automatically close toast after 3 seconds
  };

  const tileContent = ({ date }) => {
    const dateString = date.toDateString();
    if (attendanceHistory[dateString] === 'present') {
      return <div className="mark-attendance">&#10004;</div>;
    } else if (attendanceHistory[dateString] === 'late') {
      return <div className="mark-late">Late</div>;
    } else if (attendanceHistory[dateString] === 'leave') {
      return <div className="mark-leave">&#10008;</div>;
    } else if (attendanceHistory[dateString] === 'absent') {
      return <div className="mark-absent">Absent</div>;
    }
    return null;
  };

  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>
      <Calendar onChange={setDate} value={date} tileContent={tileContent} className="calendar" />

      <button onClick={handleAttendanceSubmit} className="submit-btn">
        Submit Attendance
      </button>

      {/* Removed the attendance form UI elements */}
      
      {isToastOpen && (
        <div className="toast-message">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Attendance;

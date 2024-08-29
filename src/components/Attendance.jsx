import React, { useState, useEffect } from 'react';
import './Attendance.css'; // Add CSS for styling

const Attendance = ({ onClose }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    setCheckInTime(time);
  };

  const handleCheckOut = () => {
    setCheckOutTime(time);
  };

  return (
    <div className="attendance-modal">
      <h2>Attendance Management</h2>
      <p>Current Time: {time}</p>
      <button onClick={handleCheckIn}>Check In</button>
      <button onClick={handleCheckOut}>Check Out</button>
      {checkInTime && <p>Check-In Time: {checkInTime}</p>}
      {checkOutTime && <p>Check-Out Time: {checkOutTime}</p>}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Attendance;

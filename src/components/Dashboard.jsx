import React, { useState, useEffect } from 'react';
import Header from './Header';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebaseConfig'; // Import Firestore and Auth instances
import { collection, addDoc, Timestamp } from 'firebase/firestore'; // Firestore functions

const Dashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [checkInTime, setCheckInTime] = useState(null);
  const navigate = useNavigate();

  // Timer effect for the check-in/out functionality
  useEffect(() => {
    let interval;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else if (!isCheckedIn && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, timer]);

  // Format the timer into hours, minutes, and seconds
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to log attendance (Check-in and Check-out)
  const logAttendance = async (userId, type, checkInTimestamp = null) => {
    try {
      const attendanceRef = collection(firestore, `users/${userId}/attendance`);
      const timestamp = Timestamp.now();
      const data = {
        type: type,
        timestamp: timestamp,
      };

      if (type === 'check-out') {
        data.checkInTime = checkInTimestamp;
        data.checkOutTime = timestamp;
        data.totalDuration = timer; // Track total time during check-out
      }

      await addDoc(attendanceRef, data);
      console.log(`${type} recorded in Firestore`);
    } catch (error) {
      console.error(`Error logging ${type}: `, error);
    }
  };

  // Handle check-in and check-out with authentication check
  const handleCheckInOut = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error('User not authenticated');
      navigate('/login'); // Redirect to login if the user is not authenticated
      return;
    }

    const userId = user.uid;

    try {
      if (!isCheckedIn) {
        const checkInTimestamp = Timestamp.now();
        setCheckInTime(checkInTimestamp);
        await logAttendance(userId, 'check-in');
        setIsCheckedIn(true);
      } else {
        await logAttendance(userId, 'check-out', checkInTime);
        setIsCheckedIn(false);
        setTimer(0);
        setCheckInTime(null);
      }
    } catch (error) {
      console.error('Error processing check-in/check-out: ', error);
      // Optionally show a user-friendly message on the UI
    }
  };

  return (
    <div>
      <Header />

      <div className="box-wrapper">
        {/* Check-in/Check-out Card */}
        <figure className="shape-box shape-box_half">
          <img
            src="https://img.freepik.com/premium-photo/sand-timer-background-trending-hd-wallpaper-8k4k2k-wallpaper_1073814-5335.jpg"
            alt="Check-in"
          />
          <figcaption>
            <div className="show-cont">
              <h3 className="card-no">01</h3>
              <h4 className="card-main-title">Check In/Check Out</h4>
            </div>
            <p className="card-content">Timer: {formatTime(timer)}</p>
            <button
              className={`check-in-btn ${isCheckedIn ? 'red-btn' : 'green-btn'}`}
              onClick={handleCheckInOut}
            >
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </button>
          </figcaption>
        </figure>

        {/* Leave Balance Card */}
        <figure className="shape-box shape-box_half">
          <img
            src="https://www.shutterstock.com/image-photo/beautiful-panoramic-sea-sand-sky-260nw-2466899247.jpg"
            alt="Leave Balance"
          />
          <figcaption>
            <div className="show-cont">
              <h3 className="card-no">02</h3>
              <h4 className="card-main-title">Leave Balance</h4>
            </div>
            <p className="card-content">Leave Balance: 5 days</p>
            <button
              className="leave-btn"
              onClick={() => navigate('/leavetracker')}
            >
              Apply Leave
            </button>
          </figcaption>
        </figure>

        {/* Tasks Card */}
        <figure className="shape-box shape-box_half">
          <img
            src="https://images.unsplash.com/photo-1498075702571-ecb018f3752d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=757&q=80"
            alt="Tasks"
          />
          <figcaption>
            <div className="show-cont">
              <h3 className="card-no">03</h3>
              <h4 className="card-main-title">Tasks</h4>
            </div>
            <p className="card-content">Pending Tasks: 3</p>
            <button className="task-btn" onClick={() => navigate('/tasks')}>
              See Tasks
            </button>
          </figcaption>
        </figure>

        {/* Deadlines Card */}
        <figure className="shape-box shape-box_half">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpOzB1SFFwef_DrqNUQWwf_Z1Cqlxp_4QUjQ&s"
            alt="Deadlines"
          />
          <figcaption>
            <div className="show-cont">
              <h3 className="card-no">04</h3>
              <h4 className="card-main-title">Deadlines</h4>
            </div>
            <p className="card-content">Upcoming Deadline: Project X (2 days left)</p>
            <button className="task-btn" onClick={() => navigate('/tasks')}>
              See Tasks
            </button>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import Header from './Header';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebaseConfig';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  // Existing state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [checkInTime, setCheckInTime] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(10); // Initial leave balance

  // New state for leave and task-related information
  const [sickLeave, setSickLeave] = useState(5); // Example sick leave balance
  const [casualLeave, setCasualLeave] = useState(5); // Example casual leave balance
  const [leaveWithoutPay, setLeaveWithoutPay] = useState(0); // Example leave without pay balance
  const [pendingTasks, setPendingTasks] = useState(3); // Example pending tasks count
  const [upcomingDeadline, setUpcomingDeadline] = useState(null); // Default as null

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

  const logAttendance = async (type) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user authenticated');
      return;
    }
    const userId = user.uid;
    try {
      await logAttendanceToFirestore(userId, type);
    } catch (error) {
      console.error('Error logging attendance:', error);
    }
  };

  const handleCheckInOut = () => {
    if (isCheckedIn) {
      logAttendance('check-out');
    } else {
      logAttendance('check-in');
    }
  };

  const logAttendanceToFirestore = async (userId, type) => {
    try {
      const userRef = doc(firestore, `rareusers/${userId}`);
      const userDoc = await getDoc(userRef);
  
      const currentTimestamp = Timestamp.now();
      const formattedDuration = type === 'check-out' ? formatTime(timer) : null;
  
      let updatedDashboard = {};
      let updatedAttendance = [];
  
      if (userDoc.exists()) {
        // If user document exists, get current data
        const userData = userDoc.data();
        updatedDashboard = { ...userData.dashboard };
        updatedAttendance = [...(userData.attendance?.events || [])];
      } else {
        // If user document does not exist, create a new one
        console.log('User not found, creating a new user document');
        updatedDashboard = {
          checkIn: currentTimestamp,
          checkOut: null,
          duration: null,
        };
        updatedAttendance = [];
      }
  
      if (type === 'check-in') {
        updatedDashboard.checkIn = currentTimestamp;
        setCheckInTime(currentTimestamp);
        setIsCheckedIn(true);
      } else if (type === 'check-out') {
        updatedDashboard.checkOut = currentTimestamp;
        updatedDashboard.duration = formattedDuration;
        updatedAttendance.push({
          date: currentTimestamp,
          status: 'Present',
        });
        setIsCheckedIn(false);
        setTimer(0);
        setCheckInTime(null);
      }
  
      // Update or create the user document with new check-in/out data
      await setDoc(
        userRef,
        {
          dashboard: updatedDashboard,
          attendance: { events: updatedAttendance },
        },
        { merge: true }
      );
  
      const formattedDate = new Date().toISOString().split('T')[0];
  
      if (type === 'check-in') {
        await setDoc(
          doc(firestore, `oftenusers/${userId}/attendance/${formattedDate}`),
          {
            checkIn: currentTimestamp,
          },
          { merge: true }
        );
      } else if (type === 'check-out') {
        await setDoc(
          doc(firestore, `oftenusers/${userId}/attendance/${formattedDate}`),
          {
            checkOut: currentTimestamp,
            duration: formattedDuration,
          },
          { merge: true }
        );
      }
  
      console.log(`${type} recorded in Firestore`);
    } catch (error) {
      console.error(`Error logging ${type}: `, error.message);
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
            <p className="card-content">Sick Leave: {sickLeave} days</p>
            <p className="card-content">Casual Leave: {casualLeave} days</p>
            <p className="card-content">Leave Without Pay: {leaveWithoutPay} days</p>
            <button className="leave-btn" onClick={() => navigate('/leave-tracker')}>
              Apply Leave
            </button>
          </figcaption>
        </figure>

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
            <p className="card-content">Pending Tasks: {pendingTasks}</p>
            <button className="task-btn" onClick={() => navigate('/tasks')}>
              See Tasks
            </button>
          </figcaption>
        </figure>

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
            <p className="card-content">
              {upcomingDeadline
                ? `Upcoming Deadline: ${upcomingDeadline.name} (${upcomingDeadline.deadline.toDate().toLocaleDateString()})`
                : 'No upcoming deadlines.'}
            </p>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

export default Dashboard;
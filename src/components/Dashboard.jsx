import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebaseConfig';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';


const Dashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sickLeave, setSickLeave] = useState(5);
  const [casualLeave, setCasualLeave] = useState(5);
  const [leaveWithoutPay, setLeaveWithoutPay] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(3);
  const [upcomingDeadline, setUpcomingDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = auth.currentUser; // Get the current user

  const fetchLeaveData = useCallback(async () => {
    if (!user) return;

    const leaveRef = doc(firestore, `leaverules/${user.uid}`);
    const leaveDoc = await getDoc(leaveRef);
    if (leaveDoc.exists()) {
      const leaveData = leaveDoc.data();
      setSickLeave(leaveData.sickLeave || 0);
      setCasualLeave(leaveData.casualLeave || 0);
      setLeaveWithoutPay(leaveData.leaveWithoutPay || 0);
    } else {
      console.error('Leave data not found');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  useEffect(() => {
    let interval;
    if (isCheckedIn) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCheckInOut = useCallback(async () => {
    const type = isCheckedIn ? 'check-out' : 'check-in';
    if (!user) {
      console.error('No user authenticated');
      return;
    }
    await logAttendanceToFirestore(type, user.uid); // Pass uid to the function
  }, [isCheckedIn, user]);

  const logAttendanceToFirestore = useCallback(async (type, uid) => {
    if (!uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userRef = doc(firestore, `rareusers/${uid}`);
      const userDoc = await getDoc(userRef);
      const currentTimestamp = Timestamp.now();
      const formattedDuration = type === 'check-out' ? formatTime(timer) : null;

      let updatedDashboard = {};
      let updatedAttendance = [];

      if (userDoc.exists()) {
        const userData = userDoc.data();
        updatedDashboard = { ...userData.dashboard };
        updatedAttendance = [...(userData.attendance?.events || [])];
      } else {
        updatedDashboard = { checkIn: null, checkOut: null, duration: null };
      }

      if (type === 'check-in') {
        updatedDashboard.checkIn = currentTimestamp;
        setIsCheckedIn(true);
        setTimer(0);
      } else {
        updatedDashboard.checkOut = currentTimestamp;
        updatedDashboard.duration = formattedDuration;
        updatedAttendance.push({ date: currentTimestamp, status: 'Present' });
        setIsCheckedIn(false);
      }

      await setDoc(userRef, { dashboard: updatedDashboard, attendance: { events: updatedAttendance } }, { merge: true });

      const attendanceTypeRef = doc(firestore, `employeetimings/${uid}`);
      const checkInCheckOutData = {
        yourCheckIn: type === 'check-in' ? currentTimestamp : updatedDashboard.checkIn,
        yourCheckOut: type === 'check-out' ? currentTimestamp : updatedDashboard.checkOut,
        checkInStarts: "09:23",
        checkInEnds: "09:30",
        checkOutStarts: "18:31",
        checkOutEnds: "19:38"
      };

      await setDoc(attendanceTypeRef, checkInCheckOutData, { merge: true });

      console.log(`${type} recorded.`);
    } catch (error) {
      console.error(`Error logging ${type}: `, error);
    }
  }, [timer]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="box-wrapper">
        <figure className="shape-box shape-box_half">
          <img src="https://img.freepik.com/premium-photo/sand-timer-background-trending-hd-wallpaper-8k4k2k-wallpaper_1073814-5335.jpg" alt="Check-in" />
          <figcaption>
            <h3 className="card-no">01</h3>
            <h4 className="card-main-title">Check In/Check Out</h4>
            <p className="card-content">Timer: {formatTime(timer)}</p>
            <button className={`check-in-btn ${isCheckedIn ? 'red-btn' : 'green-btn'}`} onClick={handleCheckInOut}>
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </button>
          </figcaption>
        </figure>
        <figure className="shape-box shape-box_half">
          <img src="https://www.shutterstock.com/image-photo/beautiful-panoramic-sea-sand-sky-260nw-2466899247.jpg" alt="Leave Balance" />
          <figcaption>
            <h3 className="card-no">02</h3>
            <h4 className="card-main-title">Leave Balance</h4>
            <p className="card-content">Sick Leave: {sickLeave} days</p>
            <p className="card-content">Casual Leave: {casualLeave} days</p>
            <p className="card-content">Leave Without Pay: {leaveWithoutPay} days</p>
            <button className="leave-btn" onClick={() => navigate('/leave-tracker')}>Apply Leave</button>
          </figcaption>
        </figure>
        <figure className="shape-box shape-box_half">
          <img src="https://images.unsplash.com/photo-1498075702571-ecb018f3752d?ixlib=rb-1.2.1&auto=format&fit=crop&w=757&q=80" alt="Tasks" />
          <figcaption>
            <h3 className="card-no">03</h3>
            <h4 className="card-main-title">Tasks</h4>
            <p className="card-content">Pending Tasks: {pendingTasks}</p>
            <button className="task-btn" onClick={() => navigate('/tasks')}>See Tasks</button>
          </figcaption>
        </figure>
        <figure className="shape-box shape-box_half">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpOzB1SFFwef_DrqNUQWwf_Z1Cqlxp_4QUjQ&s" alt="Deadlines" />
          <figcaption>
            <h3 className="card-no">04</h3>
            <h4 className="card-main-title">Deadlines</h4>
            <p className="card-content">
              {upcomingDeadline 
                ? `Upcoming Deadline: ${upcomingDeadline.name} (${upcomingDeadline.deadline.toDate().toLocaleDateString()})` 
                : 'No upcoming deadlines.'
              }
            </p>
          </figcaption>
        </figure>
      </div>
    </div>
  );
};

export default Dashboard;

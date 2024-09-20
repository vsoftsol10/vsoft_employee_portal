import React, { useState, useEffect } from 'react';
import Header from './Header';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from '../firebaseConfig'; // Import Firestore instance
import { doc,addDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'; // Import setDoc

const Dashboard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sickLeave, setSickLeave] = useState(0);
  const [casualLeave, setCasualLeave] = useState(0);
  const [leaveWithoutPay, setLeaveWithoutPay] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [upcomingDeadline, setUpcomingDeadline] = useState(null);
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

  // Fetch leave balance (sickLeave, casualLeave, leaveWithoutPay), tasks, and deadline data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.error('User not authenticated');
          return;
        }

        // Fetch leave types (sickLeave, casualLeave, leaveWithoutPay) from leaveSettings/default
        const leaveSettingsRef = doc(firestore, 'leaveSettings', 'default');
        const leaveSettingsSnap = await getDoc(leaveSettingsRef);

        if (leaveSettingsSnap.exists()) {
          const leaveData = leaveSettingsSnap.data();
          setSickLeave(leaveData.sickLeave || 0);
          setCasualLeave(leaveData.casualLeave || 0);
          setLeaveWithoutPay(leaveData.leaveWithoutPay || 0);
        }

        // Fetch tasks count from groups/id/tasks
        const tasksCollectionRef = collection(firestore, `groups/${user.uid}/tasks`);
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        setPendingTasks(tasksSnapshot.size); // Count the number of tasks

        // Find task with the nearest deadline
        let tasksWithDeadlines = [];
        tasksSnapshot.forEach((doc) => {
          const taskData = doc.data();
          if (taskData.deadline) {
            tasksWithDeadlines.push(taskData);
          }
        });

        // Sort tasks by deadline and get the nearest one
        tasksWithDeadlines.sort((a, b) => a.deadline.toMillis() - b.deadline.toMillis());
        if (tasksWithDeadlines.length > 0) {
          setUpcomingDeadline(tasksWithDeadlines[0]);
        }
      } catch (error) {
        console.error('Error fetching data: ', error.message);
      }
    };

    fetchData();
  }, []);

  // Format the timer into hours, minutes, and seconds
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const handleCheckInOut = async () => {
    const user = auth.currentUser; // Get the current authenticated user
  
    if (!user) {
      console.error('User not authenticated');
      return;
    }
  
    try {
      const userRef = doc(firestore, 'oftenusers', user.uid); // Reference to the user's document in Firestore
      const userSnap = await getDoc(userRef);
  
      // If user document doesn't exist, create it
      if (!userSnap.exists()) {
        await setDoc(userRef, { isCheckedIn: false, checkInTime: null });
      }
  
      const userData = userSnap.data();
  
      if (!isCheckedIn) {
        // Check In
        await setDoc(userRef, {
          isCheckedIn: true,
          checkInTime: new Date(),
        }, { merge: true }); // Merge with existing data
        setIsCheckedIn(true);
        setTimer(0); // Reset the timer when checking in
  
        // Store check-in data in oftenusers/uid/checkins
        const checkinsRef = collection(userRef, 'checkins');
        await addDoc(checkinsRef, {
          checkInTime: new Date(),
          // You can add more data here if needed
        });
      } else {
        // Check Out
        const checkInTime = userData.checkInTime?.toDate(); // Firestore stores date in Timestamp, so convert it back to Date object
        const checkOutTime = new Date();
  
        const durationInSeconds = Math.floor((checkOutTime - checkInTime) / 1000);
  
        await setDoc(userRef, {
          isCheckedIn: false,
          checkOutTime,
        }, { merge: true });
  
        // Store check-out data in oftenusers/uid/checkouts
        const checkoutsRef = collection(userRef, 'checkouts');
        await addDoc(checkoutsRef, {
          checkOutTime,
          totalDuration: durationInSeconds,
          // You can add more data here if needed
        });
  
        setIsCheckedIn(false);
        setTimer(0); // Reset the timer after checking out
      }
    } catch (error) {
      console.error('Error checking in/out: ', error.message);
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
            <p className="card-content">Sick Leave: {sickLeave} days</p>
            <p className="card-content">Casual Leave: {casualLeave} days</p>
            <p className="card-content">Leave Without Pay: {leaveWithoutPay} days</p>
            <button className="leave-btn" onClick={() => navigate('/leave-tracker')}>
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
            <p className="card-content">Pending Tasks: {pendingTasks}</p>
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

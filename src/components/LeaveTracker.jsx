import React, { useState, useEffect } from 'react';
import './LeaveTracker.css'; // Import the CSS file for styling
import { firestore, auth } from '../firebaseConfig'; // Adjust the path to your firebaseConfig file
import { collection, addDoc, updateDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore'; // Import getDocs
import { onAuthStateChanged } from 'firebase/auth';

const LeaveTracker = () => {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0); // Track leave balance
  const [uid, setUid] = useState(null); // User ID

  // Function to initialize the leave balance in Firestore for a user
  const initializeLeaveBalance = async (uid) => {
    try {
      const userDoc = doc(firestore, 'users', uid);
      const docSnap = await getDoc(userDoc);
      
      if (!docSnap.exists()) {
        // If the user document does not exist, set leave balance to 5
        await setDoc(userDoc, {
          leaveBalance: 5 // Initial leave balance
        });
        setLeaveBalance(5); // Set balance in state as well
      } else {
        // If the user document exists, fetch and set the leave balance
        setLeaveBalance(docSnap.data().leaveBalance || 5); // Set to 5 if not found
      }
    } catch (error) {
      console.error('Error initializing leave balance:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        // Initialize or fetch leave balance for the current user
        await initializeLeaveBalance(user.uid);
        // Fetch leave requests for the current user
        const leaveCollection = collection(firestore, 'users', user.uid, 'leaveRequests');
        const leaveSnapshot = await getDocs(leaveCollection);
        setLeaveRequests(leaveSnapshot.docs.map((doc) => doc.data()));
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApplyLeave = async () => {
    if (!uid) return;

    try {
      const leaveDays = calculateLeaveDays(startDate, endDate);
      if (leaveDays > leaveBalance) {
        alert('You do not have enough leave balance.');
        return;
      }

      // Add the leave request to Firestore
      await addDoc(collection(firestore, 'users', uid, 'leaveRequests'), {
        type: leaveType,
        start: startDate,
        end: endDate,
        reason,
        status: 'pending', // You can update this status as needed
        createdAt: new Date() // Optional: store the creation time
      });

      // Update leave balance in Firestore
      const leaveDoc = doc(firestore, 'users', uid);
      await updateDoc(leaveDoc, {
        leaveBalance: leaveBalance - leaveDays
      });

      // Add the leave request to local state for immediate UI update
      setLeaveRequests([...leaveRequests, {
        type: leaveType,
        start: startDate,
        end: endDate,
        reason,
        status: 'pending'
      }]);

      // Update local state for leave balance
      setLeaveBalance(leaveBalance - leaveDays);

      // Clear form fields after submission
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      console.error('Error applying leave:', error.message);
    }
  };

  // Helper function to calculate leave days
  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="leave-tracker">
      <h2>Leave Tracker</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Leave Type:
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Select Leave Type</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Leave Without Pay">Leave Without Pay</option>
            <option value="Casual Leave">Casual Leave</option>
            {/* Add more options here if needed */}
          </select>
        </label>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Reason:
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleApplyLeave}>
          Apply Leave
        </button>
      </form>

      <h3>Leave Requests</h3>
      <ul>
        {leaveRequests.map((request, index) => (
          <li key={index}>
            {request.type} | {request.start} to {request.end} | {request.reason} | {request.status}
          </li>
        ))}
      </ul>
      <h3>Leave Balance: {leaveBalance} days</h3>
    </div>
  );
};

export default LeaveTracker;

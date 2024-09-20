import React, { useState, useEffect } from 'react';
import './LeaveTracker.css'; // Import the CSS file for styling
import { firestore, auth } from '../firebaseConfig'; // Adjust the path to your firebaseConfig file
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Import Firestore methods
import { onAuthStateChanged } from 'firebase/auth';

const LeaveTracker = () => {
  const [name, setName] = useState(''); // New state for name
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 2,
    sickLeave: 2,
    leaveWithoutPay: 2,
  });
  const [uid, setUid] = useState(null); // User ID

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        // Fetch leave requests for the current user
        const leaveCollection = collection(firestore, 'oftenusers', user.uid, 'leaveformrequests');
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
      if (leaveDays > leaveBalance[leaveType]) {
        alert('You do not have enough leave balance for this type.');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be before start date.');
        return;
      }

      if (leaveType === '' || reason === '' || name === '') {
        alert('Please fill all the fields.');
        return;
      }

      // Add the leave request to Firestore
      await addDoc(collection(firestore, 'oftenusers', uid, 'leaveformrequests'), {
        name, // Store the name
        type: leaveType,
        start: startDate,
        end: endDate,
        reason,
        status: 'pending', // You can update this status as needed
        createdAt: new Date() // Optional: store the creation time
      });

      // Update local state for leave requests
      setLeaveRequests([...leaveRequests, {
        name, // Add the name to the state
        type: leaveType,
        start: startDate,
        end: endDate,
        reason,
        status: 'pending'
      }]);

      // Clear form fields after submission
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setName(''); // Clear the name field
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
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </label>
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
            {request.name} | {request.type} | {request.start} to {request.end} | {request.reason} | 
            {request.status === 'pending' ? ' Pending' : 
             request.status === 'accepted' ? ' Accepted' : ' Rejected'}
          </li>
        ))}
      </ul>
      <h3>Leave Balances:</h3>
      <ul>
        <li>Casual Leave: {leaveBalance.casualLeave}</li>
        <li>Sick Leave: {leaveBalance.sickLeave}</li>
        <li>Leave Without Pay: {leaveBalance.leaveWithoutPay}</li>
      </ul>
    </div>
  );
};

export default LeaveTracker;

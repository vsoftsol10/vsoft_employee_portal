import React, { useState, useEffect } from 'react';
import './LeaveTracker.css';
import { firestore, auth } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const LeaveTracker = () => {
  const [name, setName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 0,
    sickLeave: 0,
    leaveWithoutPay: 0,
  });
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState('leaveForm'); // State for active tab

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const userDoc = doc(firestore, 'employees', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setName(userSnapshot.data().name);
        }

        // Fetch leave balance for the user
        const leaveBalanceRef = doc(firestore, 'leaverules', user.uid);
        const leaveBalanceSnapshot = await getDoc(leaveBalanceRef);
        if (leaveBalanceSnapshot.exists()) {
          const currentBalances = leaveBalanceSnapshot.data();
          // Convert balances from strings to numbers
          setLeaveBalance({
            casualLeave: Number(currentBalances.casualLeave || 0),
            sickLeave: Number(currentBalances.sickLeave || 0),
            leaveWithoutPay: Number(currentBalances.leaveWithoutPay || 0),
          });
        }

        // Fetch leave requests for the user from Firestore
        const leaveCollection = collection(firestore, `leaverules/${user.uid}/leaveformrequests`);
        const leaveSnapshot = await getDocs(leaveCollection);
        setLeaveRequests(leaveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setUid(null);
        setName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApplyLeave = async () => {
    if (!uid) return;

    try {
      const leaveDays = calculateLeaveDays(startDate, endDate);
      const leaveBalanceRef = doc(firestore, 'leaverules', uid);

      // Check if enough balance is available and calculate new balance
      let newBalance;
      if (leaveType === "Casual Leave") {
        if (leaveDays > leaveBalance.casualLeave) {
          alert('You do not have enough casual leave balance.');
          return;
        }
        newBalance = leaveBalance.casualLeave - leaveDays;
      } else if (leaveType === "Sick Leave") {
        if (leaveDays > leaveBalance.sickLeave) {
          alert('You do not have enough sick leave balance.');
          return;
        }
        newBalance = leaveBalance.sickLeave - leaveDays;
      } else if (leaveType === "Leave Without Pay") {
        if (leaveDays > leaveBalance.leaveWithoutPay) {
          alert('You do not have enough leave without pay balance.');
          return;
        }
        newBalance = leaveBalance.leaveWithoutPay - leaveDays;
      }

      if (new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be before start date.');
        return;
      }

      if (leaveType === '' || reason === '') {
        alert('Please fill all the fields.');
        return;
      }

      // Update the leave balance directly with the new value
      await updateDoc(leaveBalanceRef, {
        [leaveType]: newBalance.toString() // Store as string
      });

      // Store the leave request in the corrected path
      await addDoc(collection(firestore, `leaverules/${uid}/leaveformrequests`), {
        name,
        type: leaveType,
        reason,
        start: startDate,
        end: endDate,
        status: 'pending',
        createdAt: new Date(),
      });

      // Update the local state to include the new leave request
      setLeaveRequests(prevRequests => [
        ...prevRequests,
        {
          name,
          type: leaveType,
          reason,
          start: startDate,
          end: endDate,
          status: 'pending'
        }
      ]);

      // Reset form fields
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      console.error('Error applying leave:', error.message);
    }
  };

  const calculateLeaveDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="leave-tracker">
      <h2>Leave Tracker</h2>

      {/* Tab navigation */}
      <div className="tab-buttons">
        <button
          className={activeTab === 'leaveForm' ? 'active' : ''}
          onClick={() => setActiveTab('leaveForm')}
        >
          Leave Form
        </button>
        <button
          className={activeTab === 'pastSubmits' ? 'active' : ''}
          onClick={() => setActiveTab('pastSubmits')}
        >
          Past Submits
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'leaveForm' && (
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)} // Change handler added here
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
        )}

        {activeTab === 'pastSubmits' && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveTracker;

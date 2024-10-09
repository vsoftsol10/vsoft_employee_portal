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
  const [permissionHours, setPermissionHours] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casualLeave: 0,
    sickLeave: 0,
  });
  const [uid, setUid] = useState(null);
  const [activeTab, setActiveTab] = useState('leaveForm');

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
          setLeaveBalance({
            casualLeave: Number(currentBalances.casualLeave || 0),
            sickLeave: Number(currentBalances.sickLeave || 0),
          });
        }

        // Fetch leave requests
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
      let leaveDays;
      if (leaveType === 'Permission') {
        leaveDays = permissionHours / 8; // Assuming 8 working hours in a day
        if (permissionHours === '') {
          alert('Please enter the number of hours for permission.');
          return;
        }
      } else {
        leaveDays = calculateLeaveDays(startDate, endDate);
      }
  
      // Date Validation: Check if end date is before start date for leave
      if (leaveType !== 'Permission' && new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be before start date.');
        return;
      }
  
      if (leaveType === '' || reason === '') {
        alert('Please fill all the fields.');
        return;
      }
  
      let newBalance = null; // Initialize newBalance
      const leaveRequestsRef = collection(firestore, `leaverules/${uid}/leaveformrequests`);
  
      if (leaveType === 'Casual Leave') {
        if (leaveDays > leaveBalance.casualLeave) {
          alert('You do not have enough casual leave balance.');
          return;
        }
        newBalance = leaveBalance.casualLeave - leaveDays;
        // Update the leave balance in Firestore
        const leaveBalanceRef = doc(firestore, 'leaverules', uid);
        await updateDoc(leaveBalanceRef, {
          casualLeave: newBalance // Keep it as a number
        });
      } else if (leaveType === 'Sick Leave') {
        if (leaveDays > leaveBalance.sickLeave) {
          alert('You do not have enough sick leave balance.');
          return;
        }
        newBalance = leaveBalance.sickLeave - leaveDays;
        // Update the leave balance in Firestore
        const leaveBalanceRef = doc(firestore, 'leaverules', uid);
        await updateDoc(leaveBalanceRef, {
          sickLeave: newBalance // Keep it as a number
        });
      }
  
      // Add leave request to Firestore
      await addDoc(leaveRequestsRef, {
        name,
        type: leaveType,
        reason,
        start: leaveType === 'Permission' ? todayDate : startDate,
        end: leaveType === 'Permission' ? todayDate : endDate,
        hours: leaveType === 'Permission' ? permissionHours : null,
        status: 'pending'
      });
  
      // Update local leave requests
      setLeaveRequests(prevRequests => [
        ...prevRequests,
        {
          name,
          type: leaveType,
          reason,
          start: leaveType === 'Permission' ? todayDate : startDate,
          end: leaveType === 'Permission' ? todayDate : endDate,
          hours: leaveType === 'Permission' ? permissionHours : null,
          status: 'pending'
        }
      ]);
  
      // Reset form
      setLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setPermissionHours('');
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

  const handleLeaveTypeChange = (e) => {
    setLeaveType(e.target.value);
    if (e.target.value === 'Permission') {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in yyyy-mm-dd format
      setTodayDate(today);
    }
  };

  return (
    <div className="leave-tracker">
      <h2>Leave Tracker</h2>

      {/* Tab Navigation */}
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
              <input type="text" value={name} disabled />
            </label>
            <label>
              Leave Type:
              <select value={leaveType} onChange={handleLeaveTypeChange}>
                <option value="">Select Leave Type</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Permission">Permission</option>
              </select>
            </label>

            {/* Show date inputs only if leave type is not 'Permission' */}
            {leaveType !== 'Permission' && (
              <>
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
              </>
            )}

            {/* Show today's date and permission hours input if leave type is 'Permission' */}
            {leaveType === 'Permission' && (
              <>
                <label>
                  Today's Date:
                  <input type="date" value={todayDate} disabled />
                </label>
                <label>
                  Hours of Permission:
                  <input
                    type="number"
                    value={permissionHours}
                    onChange={(e) => setPermissionHours(e.target.value)}
                    placeholder="Enter hours"
                  />
                </label>
              </>
            )}

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
                  {request.status === 'pending' ? ' Pending' : request.status === 'accepted' ? ' Accepted' : ' Rejected'}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveTracker;

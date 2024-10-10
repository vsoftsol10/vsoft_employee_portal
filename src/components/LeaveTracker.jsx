import React, { useState, useEffect } from 'react';
import './LeaveTracker.css';
import { firestore, auth } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import emailjs from 'emailjs-com';  // Import EmailJS

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
  
      let newBalance = null;
      const leaveRequestsRef = collection(firestore, `leaverules/${uid}/leaveformrequests`);
  
      // Handle leave balance based on leave type
      if (leaveType === 'Casual Leave') {
        if (leaveDays > leaveBalance.casualLeave) {
          alert('You do not have enough casual leave balance.');
          return;
        }
        newBalance = leaveBalance.casualLeave - leaveDays;
        const leaveBalanceRef = doc(firestore, 'leaverules', uid);
        await updateDoc(leaveBalanceRef, { casualLeave: newBalance });
      } else if (leaveType === 'Sick Leave') {
        if (leaveDays > leaveBalance.sickLeave) {
          alert('You do not have enough sick leave balance.');
          return;
        }
        newBalance = leaveBalance.sickLeave - leaveDays;
        const leaveBalanceRef = doc(firestore, 'leaverules', uid);
        await updateDoc(leaveBalanceRef, { sickLeave: newBalance });
      }
  
      // Add leave request to Firestore
      await addDoc(leaveRequestsRef, {
        name,
        type: leaveType,
        reason,
        start: leaveType === 'Permission' ? todayDate : startDate,
        end: leaveType === 'Permission' ? todayDate : endDate,
        hours: leaveType === 'Permission' ? permissionHours : null,
        status: 'pending',
      });
  
      // Update the document in employeetimings with the leave details
      const employeeTimingsRef = doc(firestore, `employeetimings/XZdb5au5FjabGTE9U7DAKpZQM902`);
      await updateDoc(employeeTimingsRef, {
        startDate: leaveType === 'Permission' ? todayDate : startDate,
        endDate: leaveType === 'Permission' ? todayDate : endDate,
      });
  
      // Send email to admin using EmailJS
      const emailParams = {
        to_name: 'Admin',  // The recipient's name (admin)
        from_name: name,   // The employee's name that you want to send
        leaveType: leaveType,
        reason: reason,
        startDate: leaveType === 'Permission' ? todayDate : startDate,
        endDate: leaveType === 'Permission' ? todayDate : endDate,
        permissionHours: leaveType === 'Permission' ? permissionHours : 'N/A',
        employee_name: name  // Add this line if your template expects {{name}} to work
      };
  
      emailjs.send(
        'vijay',  // Replace with your EmailJS service ID
        'leave',  // Replace with your EmailJS template ID
        emailParams,
        'XH1tJlK2k5wqCp5Qo'  // Replace with your EmailJS user ID (or public key)
      )
      .then((response) => {
        console.log('Email successfully sent:', response.status, response.text);
      })
      .catch((err) => {
        console.error('Error sending email:', err);
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

            {/* Show hours input only if leave type is 'Permission' */}
            {leaveType === 'Permission' && (
              <>
                <label>
                  Hours of Permission:
                  <input
                    type="number"
                    value={permissionHours}
                    onChange={(e) => setPermissionHours(e.target.value)}
                    min="1"
                    max="8"
                  />
                </label>
                <label>
                  Date:
                  <input type="date" value={todayDate} disabled />
                </label>
              </>
            )}

            <label>
              Reason for Leave:
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </label>

            <button onClick={handleApplyLeave}>Apply</button>
          </form>
        )}

        {activeTab === 'pastSubmits' && (
          <div>
            <h3>Past Leave Requests</h3>
            {leaveRequests.length === 0 ? (
              <p>No leave requests found.</p>
            ) : (
              <ul>
                {leaveRequests.map((request, index) => (
                  <li key={index}>
                    <p>Leave Type: {request.type}</p>
                    <p>Start Date: {request.start}</p>
                    <p>End Date: {request.end}</p>
                    <p>Reason: {request.reason}</p>
                    <p>Status: {request.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveTracker;

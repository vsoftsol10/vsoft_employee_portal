import React, { useState, useEffect } from 'react';
import './LeaveRequests.css';
import { firestore } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const LeaveRequests = () => {
  const [sickLeaveDays, setSickLeaveDays] = useState('');
  const [casualLeaveDays, setCasualLeaveDays] = useState('');
  const [leaveWithoutPayDays, setLeaveWithoutPayDays] = useState('');

  // Fetch current leave settings from Firestore when the component loads
  useEffect(() => {
    const fetchLeaveSettings = async () => {
      try {
        const docRef = doc(firestore, 'leaveSettings', 'default');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setSickLeaveDays(data.sickLeaveDays || '');
          setCasualLeaveDays(data.casualLeaveDays || '');
          setLeaveWithoutPayDays(data.leaveWithoutPayDays || '');
        } else {
          console.log('No leave settings found');
        }
      } catch (error) {
        console.error('Error fetching leave settings:', error);
      }
    };

    fetchLeaveSettings();
  }, []);

  // Update the leave settings in Firestore
  const handleSave = async () => {
    try {
      const leaveSettings = {
        sickLeaveDays: Number(sickLeaveDays),
        casualLeaveDays: Number(casualLeaveDays),
        leaveWithoutPayDays: Number(leaveWithoutPayDays),
      };

      // Save the leave settings to Firestore
      await setDoc(doc(firestore, 'leaveSettings', 'default'), leaveSettings);

      alert('Leave settings updated successfully!');
    } catch (error) {
      console.error('Error updating leave settings:', error);
      alert('Failed to update leave settings.');
    }
  };

  return (
    <div className="leave-requests">
      <h1>Admin: Leave Settings</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Sick Leave Days:
          <input
            type="number"
            value={sickLeaveDays}
            onChange={(e) => setSickLeaveDays(e.target.value)}
            placeholder="Enter number of sick leave days"
          />
        </label>
        <label>
          Casual Leave Days:
          <input
            type="number"
            value={casualLeaveDays}
            onChange={(e) => setCasualLeaveDays(e.target.value)}
            placeholder="Enter number of casual leave days"
          />
        </label>
        <label>
          Leave Without Pay Days:
          <input
            type="number"
            value={leaveWithoutPayDays}
            onChange={(e) => setLeaveWithoutPayDays(e.target.value)}
            placeholder="Enter number of leave without pay days"
          />
        </label>
        <button type="button" onClick={handleSave}>
          Save Leave Settings
        </button>
      </form>
    </div>
  );
};

export default LeaveRequests;

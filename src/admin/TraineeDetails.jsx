import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Import useParams
import './TraineeDetails.css'; // Import the CSS file

const TraineeDetails = () => {
  const { traineeId } = useParams(); // Get traineeId from URL
  const [formData, setFormData] = useState({
    name: '',
    aadhar: '',
    fatherName: '',
    motherName: '',
    role: '',
    dob: '',
    address: '',
    email: '',
    mobile: '',
    emergencyContact: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // State to manage active tab

  const [checkInData, setCheckInData] = useState({
    checkInStarts: '',
    checkInEnds: '',
    checkOutStarts: '',
    checkOutEnds: '',
  });

  const [leaveData, setLeaveData] = useState({
    sickLeave: '',
    casualLeave: '',
    leaveWithoutPay: '',
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);

  // Fetch trainee details on component mount
  useEffect(() => {
    const fetchTraineeData = async () => {
      try {
        const docRef = doc(firestore, 'trainees', traineeId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          setError('Trainee not found.');
        }
      } catch (err) {
        console.error('Error fetching trainee data:', err);
        setError('Failed to fetch trainee data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTraineeData();
  }, [traineeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = doc(firestore, 'trainees', traineeId);
    
    try {
      setLoadingSubmit(true);
      await setDoc(docRef, {
        ...formData,
        dateUpdated: Timestamp.fromDate(new Date()),
      });
      alert('Trainee details updated successfully!');
    } catch (err) {
      console.error('Error updating trainee data:', err);
      setError('Failed to update trainee data.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCheckInChange = (e) => {
    const { name, value } = e.target;
    setCheckInData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoadingCheckIn(true);
    try {
      const checkInRef = doc(firestore, `traineeCheckIns/${traineeId}`);
      await setDoc(checkInRef, checkInData, { merge: true });
      alert('Check-in times set successfully.');
      setCheckInData({ checkInStarts: '', checkInEnds: '', checkOutStarts: '', checkOutEnds: '' }); // Reset check-in data
    } catch (err) {
      console.error('Error setting check-in times:', err);
      alert('Could not set check-in times. Please try again later.');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoadingLeave(true);
    try {
      const leaveRef = doc(firestore, `leaveRules/${traineeId}`);
      await setDoc(leaveRef, leaveData, { merge: true });
      alert('Leave rules set successfully.');
      setLeaveData({ sickLeave: '', casualLeave: '', leaveWithoutPay: '' }); // Reset leave data
    } catch (err) {
      console.error('Error setting leave rules:', err);
      alert('Could not set leave rules. Please try again later.');
    } finally {
      setLoadingLeave(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="trainee-details-container">
      <h2>Trainee Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Aadhar:</label>
          <input type="text" name="aadhar" value={formData.aadhar} onChange={handleChange} required />
        </div>
        <div>
          <label>Father's Name:</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
        </div>
        <div>
          <label>Mother's Name:</label>
          <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required />
        </div>
        <div>
          <label>Role:</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} required />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </div>
        <div>
          <label>Address:</label>
          <textarea name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Mobile:</label>
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>
        <div>
          <label>Emergency Contact:</label>
          <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={loadingSubmit}>
          {loadingSubmit ? 'Saving...' : 'Update Details'}
        </button>
      </form>

      {/* Tabs for Check-in and Leave Rules */}
      <div className="tabs">
        <button onClick={() => setActiveTab('checkIn')} className={activeTab === 'checkIn' ? 'active' : ''}>Check-in Times</button>
        <button onClick={() => setActiveTab('leaveRules')} className={activeTab === 'leaveRules' ? 'active' : ''}>Leave Rules</button>
      </div>

      {activeTab === 'checkIn' && (
        <form onSubmit={handleCheckInSubmit} className="checkin-form">
          <h3>Set Check-in Times</h3>
          <div>
            <label>Check-in Starts:</label>
            <input type="time" name="checkInStarts" value={checkInData.checkInStarts} onChange={handleCheckInChange} required />
          </div>
          <div>
            <label>Check-in Ends:</label>
            <input type="time" name="checkInEnds" value={checkInData.checkInEnds} onChange={handleCheckInChange} required />
          </div>
          <div>
            <label>Check-out Starts:</label>
            <input type="time" name="checkOutStarts" value={checkInData.checkOutStarts} onChange={handleCheckInChange} required />
          </div>
          <div>
            <label>Check-out Ends:</label>
            <input type="time" name="checkOutEnds" value={checkInData.checkOutEnds} onChange={handleCheckInChange} required />
          </div>
          <button type="submit" disabled={loadingCheckIn}>
            {loadingCheckIn ? 'Setting...' : 'Set Check-in Times'}
          </button>
        </form>
      )}

      {activeTab === 'leaveRules' && (
        <form onSubmit={handleLeaveSubmit} className="leave-rules-form">
          <h3>Set Leave Rules</h3>
          <div>
            <label>Sick Leave:</label>
            <input type="number" name="sickLeave" value={leaveData.sickLeave} onChange={handleLeaveChange} required />
          </div>
          <div>
            <label>Casual Leave:</label>
            <input type="number" name="casualLeave" value={leaveData.casualLeave} onChange={handleLeaveChange} required />
          </div>
          <div>
            <label>Leave Without Pay:</label>
            <input type="number" name="leaveWithoutPay" value={leaveData.leaveWithoutPay} onChange={handleLeaveChange} required />
          </div>
          <button type="submit" disabled={loadingLeave}>
            {loadingLeave ? 'Setting...' : 'Set Leave Rules'}
          </button>
        </form>
      )}
    </div>
  );
};

export default TraineeDetails;

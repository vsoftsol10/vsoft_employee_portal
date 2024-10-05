import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Import useParams
import './EmployeeDetails.css'; // Import the CSS file

const EmployeeDetails = () => {
  const { employeeId } = useParams(); // Get employeeId from URL
  const [formData, setFormData] = useState({
    name: '',
    aadharNumber: '',
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
  const [activeTab, setActiveTab] = useState('employeeDetails'); // State to manage active tab

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

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!employeeId) {
        setError('Invalid employee ID.');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(firestore, 'employees', employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Fetched Employee Data:', data);
          setFormData({
            name: data.name || '',
            aadharNumber: data.aadharNumber || '',
            fatherName: data.fatherName || '',
            motherName: data.motherName || '',
            role: data.role || '',
            dob: data.dob ? (data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob) : '',
            address: data.address || '',
            email: data.email || '',
            mobile: data.mobile || '',
            emergencyContact: data.emergencyContact || '',
          });
        } else {
          setError('No such employee document!');
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError('Could not fetch employee details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckInChange = (e) => {
    const { name, value } = e.target;
    setCheckInData({ ...checkInData, [name]: value });
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveData({ ...leaveData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true); // Start loading state
    try {
      const docRef = doc(firestore, 'employees', employeeId);
      await setDoc(docRef, {
        ...formData,
        dob: Timestamp.fromDate(new Date(formData.dob))
      }, { merge: true });
      alert('Employee details updated successfully.');
    } catch (err) {
      console.error('Error updating employee details:', err);
      alert('Could not update employee details. Please try again later.');
    } finally {
      setLoadingSubmit(false); // End loading state
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoadingCheckIn(true); // Start loading state
    try {
      const checkInRef = doc(firestore, `employeetimings/${employeeId}`); // Directly refer to the document
      await setDoc(checkInRef, checkInData, { merge: true }); // Use setDoc instead of addDoc
      alert('Check-in times set successfully.');
      setCheckInData({ checkInStarts: '', checkInEnds: '', checkOutStarts: '', checkOutEnds: '' }); // Reset check-in data
    } catch (err) {
      console.error('Error setting check-in times:', err);
      alert('Could not set check-in times. Please try again later.');
    } finally {
      setLoadingCheckIn(false); // End loading state
    }
  };
  
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoadingLeave(true); // Start loading state
    try {
      const leaveRef = doc(firestore, `leaverules/${employeeId}`); // Directly refer to the document
      await setDoc(leaveRef, leaveData, { merge: true }); // Use setDoc instead of addDoc
      alert('Leave rules set successfully.');
      setLeaveData({ sickLeave: '', casualLeave: '', leaveWithoutPay: '' }); // Reset leave data
    } catch (err) {
      console.error('Error setting leave rules:', err);
      alert('Could not set leave rules. Please try again later.');
    } finally {
      setLoadingLeave(false); // End loading state
    }
  };
  
  return (
    <div className="employee-details-container">
      <h2>Edit Employee Details</h2>
      {loading ? (
        <p>Loading employee details...</p>
      ) : (
        <div>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="employee-form">
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input name="aadharNumber" placeholder="Aadhar Number" value={formData.aadharNumber} onChange={handleChange} required />
            <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required />
            <input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleChange} required />
            <input name="role" placeholder="Job Role" value={formData.role} onChange={handleChange} required />
            <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email ID" value={formData.email} onChange={handleChange} required autoComplete="email" />
            <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
            <input name="emergencyContact" placeholder="Emergency Contact No." value={formData.emergencyContact} onChange={handleChange} required />

            <button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? 'Saving...' : 'Edit and Save'}
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
              <input name="checkInStarts" type="time" value={checkInData.checkInStarts} onChange={handleCheckInChange} required placeholder="Check-In Starts" />
              <input name="checkInEnds" type="time" value={checkInData.checkInEnds} onChange={handleCheckInChange} required placeholder="Check-In Ends" />
              <input name="checkOutStarts" type="time" value={checkInData.checkOutStarts} onChange={handleCheckInChange} required placeholder="Check-Out Starts" />
              <input name="checkOutEnds" type="time" value={checkInData.checkOutEnds} onChange={handleCheckInChange} required placeholder="Check-Out Ends" />
              <button type="submit" disabled={loadingCheckIn}>
                {loadingCheckIn ? 'Saving...' : 'Save Check-in Times'}
              </button>
            </form>
          )}

          {activeTab === 'leaveRules' && (
            <form onSubmit={handleLeaveSubmit} className="leave-form">
              <h3>Set Leave Rules</h3>
              <input name="sickLeave" type="number" value={leaveData.sickLeave} onChange={handleLeaveChange} required placeholder="Sick Leave" />
              <input name="casualLeave" type="number" value={leaveData.casualLeave} onChange={handleLeaveChange} required placeholder="Casual Leave" />
              <input name="leaveWithoutPay" type="number" value={leaveData.leaveWithoutPay} onChange={handleLeaveChange} required placeholder="Leave Without Pay" />
              <button type="submit" disabled={loadingLeave}>
                {loadingLeave ? 'Saving...' : 'Save Leave Rules'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;

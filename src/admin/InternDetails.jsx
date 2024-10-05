import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Import useParams
import './InternDetails.css'; // Import the CSS file

const InternDetails = () => {
  const { uid } = useParams(); // Get uid from URL
  const [formData, setFormData] = useState({
    name: '',
    aadharNumber: '',
    mentorName: '',
    role: '',
    dob: '',
    address: '',
    email: '',
    mobile: '',
    emergencyContact: '',
    fatherName: '',
    motherName: '',
    department: '',
    employmentStatus: '',
    sickLeave: '',
    casualLeave: '',
    leaveWithoutPay: '',
    dateJoined: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [checkInData, setCheckInData] = useState({
    checkInStarts: '',
    checkInEnds: '',
    checkOutStarts: '',
    checkOutEnds: '',
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);

  useEffect(() => {
    const fetchInternDetails = async () => {
      if (!uid) {
        setError('Invalid intern ID.');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(firestore, 'interns', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Fetched Intern Data:', data);
          setFormData({
            name: data.name || '',
            aadharNumber: data.aadharNumber || '',
            mentorName: data.mentorName || '',
            role: data.role || '',
            dob: data.dob ? (data.dob instanceof Timestamp ? data.dob.toDate().toISOString().split('T')[0] : data.dob) : '',
            address: data.address || '',
            email: data.email || '',
            mobile: data.mobile || '',
            emergencyContact: data.emergencyContact || '',
            fatherName: data.fatherName || '',
            motherName: data.motherName || '',
            department: data.department || '',
            employmentStatus: data.employmentStatus || '',
            sickLeave: data.sickLeave || 0, // Default to 0 if not provided
            casualLeave: data.casualLeave || 0,
            leaveWithoutPay: data.leaveWithoutPay || 0,
            dateJoined: data.dateJoined ? (data.dateJoined instanceof Timestamp ? data.dateJoined.toDate().toISOString().split('T')[0] : data.dateJoined) : '',
          });

          // Set check-in data if available
          setCheckInData({
            checkInStarts: data.checkInStarts || '',
            checkInEnds: data.checkInEnds || '',
            checkOutStarts: data.checkOutStarts || '',
            checkOutEnds: data.checkOutEnds || '',
          });
        } else {
          setError('No such intern document!');
        }
      } catch (err) {
        console.error('Error fetching intern details:', err);
        setError('Could not fetch intern details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInternDetails();
  }, [uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckInChange = (e) => {
    const { name, value } = e.target;
    setCheckInData({ ...checkInData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true); // Start loading state
    try {
      const docRef = doc(firestore, 'interns', uid);
      await setDoc(docRef, {
        ...formData,
        dob: Timestamp.fromDate(new Date(formData.dob)),
        dateJoined: Timestamp.fromDate(new Date(formData.dateJoined)), // Ensure dateJoined is saved as a Timestamp
      }, { merge: true });
      alert('Intern details updated successfully.');
    } catch (err) {
      console.error('Error updating intern details:', err);
      alert('Could not update intern details. Please try again later.');
    } finally {
      setLoadingSubmit(false); // End loading state
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoadingCheckIn(true); // Start loading state
    try {
      const docRef = doc(firestore, 'interns', uid);
      await setDoc(docRef, {
        ...checkInData, // Save check-in data
      }, { merge: true });
      alert('Check-in times updated successfully.');
    } catch (err) {
      console.error('Error updating check-in times:', err);
      alert('Could not update check-in times. Please try again later.');
    } finally {
      setLoadingCheckIn(false); // End loading state
    }
  };

  return (
    <div className="intern-details-container">
      <h2>Edit Intern Details</h2>
      {loading ? (
        <p>Loading intern details...</p>
      ) : (
        <div>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="intern-form">
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input name="aadharNumber" placeholder="Aadhar Number" value={formData.aadharNumber} onChange={handleChange} required />
            <input name="mentorName" placeholder="Mentor's Name" value={formData.mentorName} onChange={handleChange} required />
            <input name="role" placeholder="Intern Role" value={formData.role} onChange={handleChange} required />
            <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email ID" value={formData.email} onChange={handleChange} required autoComplete="email" />
            <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
            <input name="emergencyContact" placeholder="Emergency Contact No." value={formData.emergencyContact} onChange={handleChange} required />
            <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required />
            <input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleChange} required />
            <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
            <input name="employmentStatus" placeholder="Employment Status" value={formData.employmentStatus} onChange={handleChange} required />
            <input name="sickLeave" type="number" placeholder="Sick Leave" value={formData.sickLeave} onChange={handleChange} required />
            <input name="casualLeave" type="number" placeholder="Casual Leave" value={formData.casualLeave} onChange={handleChange} required />
            <input name="leaveWithoutPay" type="number" placeholder="Leave Without Pay" value={formData.leaveWithoutPay} onChange={handleChange} required />
            <input name="dateJoined" type="date" value={formData.dateJoined} onChange={handleChange} required />

            <button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? 'Saving...' : 'Edit and Save'}
            </button>
          </form>

          {/* Check-in times form */}
          <form onSubmit={handleCheckInSubmit} className="checkin-form">
            <h3>Set Check-in Times</h3>
            <input name="checkInStarts" type="time" value={checkInData.checkInStarts} onChange={handleCheckInChange} required placeholder="Check-In Starts" />
            <input name="checkInEnds" type="time" value={checkInData.checkInEnds} onChange={handleCheckInChange} required placeholder="Check-In Ends" />
            <input name="checkOutStarts" type="time" value={checkInData.checkOutStarts} onChange={handleCheckInChange} required placeholder="Check-Out Starts" />
            <input name="checkOutEnds" type="time" value={checkInData.checkOutEnds} onChange={handleCheckInChange} required placeholder="Check-Out Ends" />
            <button type="submit" disabled={loadingCheckIn}>
              {loadingCheckIn ? 'Saving...' : 'Save Check-In Times'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InternDetails;

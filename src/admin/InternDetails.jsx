import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
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
    motherName: '',
    department: '',
    employmentStatus: '',
    sickLeave: '',
    casualLeave: '',
    dateJoined: '', // Removed leaveWithoutPay
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

  // Function to convert fractional day to "HH:MM" format
  const convertFractionToTime = (fraction) => {
    const totalMinutes = Math.round(fraction * 24 * 60); // Convert fraction to minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Function to convert number timestamp (days since Unix Epoch) to a date string
  const convertNumberToDate = (timestamp) => {
    const epoch = new Date(0);
    epoch.setUTCDate(epoch.getUTCDate() + timestamp);
    return epoch.toISOString().split('T')[0];
  };

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
            dob: data.dob ? convertNumberToDate(data.dob) : '', // Convert number to date
            address: data.address || '',
            email: data.email || '',
            mobile: data.mobile || '',
            emergencyContact: data.emergencyContact || '',
            fatherName: data.fatherName || '',
            motherName: data.motherName || '',
            department: data.department || '',
            employmentStatus: data.employmentStatus || '',
            sickLeave: data.sickLeave || 0,
            casualLeave: data.casualLeave || 0,
            dateJoined: data.dateJoined ? (data.dateJoined instanceof Timestamp ? data.dateJoined.toDate().toISOString().split('T')[0] : data.dateJoined) : '',
          });

          // Set check-in data if available
          setCheckInData({
            checkInStarts: data.checkInStarts ? convertFractionToTime(data.checkInStarts) : '',
            checkInEnds: data.checkInEnds ? convertFractionToTime(data.checkInEnds) : '',
            checkOutStarts: data.checkOutStarts ? convertFractionToTime(data.checkOutStarts) : '',
            checkOutEnds: data.checkOutEnds ? convertFractionToTime(data.checkOutEnds) : '',
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
    setLoadingSubmit(true);
    try {
      const docRef = doc(firestore, 'interns', uid);
      await setDoc(docRef, {
        ...formData,
        dob: Timestamp.fromDate(new Date(formData.dob)),
        dateJoined: Timestamp.fromDate(new Date(formData.dateJoined)),
      }, { merge: true });
      alert('Intern details updated successfully.');
    } catch (err) {
      console.error('Error updating intern details:', err);
      alert('Could not update intern details. Please try again later.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setLoadingCheckIn(true);
    try {
      const docRef = doc(firestore, 'interns', uid);
      await setDoc(docRef, {
        ...checkInData,
      }, { merge: true });
      alert('Check-in times updated successfully.');
    } catch (err) {
      console.error('Error updating check-in times:', err);
      alert('Could not update check-in times. Please try again later.');
    } finally {
      setLoadingCheckIn(false);
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
            <input name="dateJoined" type="date" value={formData.dateJoined} onChange={handleChange} required />

            <button type="submit" disabled={loadingSubmit}>
              {loadingSubmit ? 'Updating...' : 'Update Details'}
            </button>
          </form>

          <h3>Update Check-in and Check-out Times</h3>
          <form onSubmit={handleCheckInSubmit} className="checkin-form">
            <input name="checkInStarts" placeholder="Check-In Starts" value={checkInData.checkInStarts} onChange={handleCheckInChange} />
            <input name="checkInEnds" placeholder="Check-In Ends" value={checkInData.checkInEnds} onChange={handleCheckInChange} />
            <input name="checkOutStarts" placeholder="Check-Out Starts" value={checkInData.checkOutStarts} onChange={handleCheckInChange} />
            <input name="checkOutEnds" placeholder="Check-Out Ends" value={checkInData.checkOutEnds} onChange={handleCheckInChange} />

            <button type="submit" disabled={loadingCheckIn}>
              {loadingCheckIn ? 'Updating...' : 'Update Check-in Times'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InternDetails;


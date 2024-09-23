import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import './EmployeeDetails.css'; // Import the CSS file

const EmployeeDetails = ({ employeeId }) => {
  const [formData, setFormData] = useState({
    name: '',
    aadharNumber: '',
    fatherName: '',
    motherName: '',
    role: '',
    dob: '',
    address: '',
    email: '',
    password: '',
    mobile: '',
    emergencyContact: '',
    checkIn: '',
    checkOut: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setFormData({
            name: data.name || '',
            aadharNumber: data.aadharNumber || '',
            fatherName: data.fatherName || '',
            motherName: data.motherName || '',
            role: data.role || '',
            dob: data.dob ? data.dob.toDate().toISOString().split('T')[0] : '',
            address: data.address || '',
            email: data.email || '',
            password: data.password || '',
            mobile: data.mobile || '',
            emergencyContact: data.emergencyContact || '',
            checkIn: data.checkIn || '',
            checkOut: data.checkOut || '',
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, aadharNumber, fatherName, motherName, role, dob, address, email, password, mobile, emergencyContact, checkIn, checkOut } = formData;

    // Basic validation
    if (!name || !aadharNumber || !fatherName || !motherName || !role || !dob || !address || !email || !password || !mobile || !emergencyContact || !checkIn || !checkOut) {
      setError('All fields are required.');
      return;
    }

    try {
      const docRef = doc(firestore, 'employees', employeeId);
      await setDoc(docRef, {
        ...formData,
        dob: Timestamp.fromDate(new Date(dob)),
        dateJoined: Timestamp.now(),
        department: 'HR',
        employmentStatus: 'Active',
        profilePic: '', // Optional: add logic to upload and set profile picture
      });
      alert('Employee details updated successfully');
    } catch (err) {
      console.error('Error saving employee details:', err);
      setError('Could not save employee details. Please try again later.');
    }
  };

  return (
    <div className="employee-details-container">
      <h2>Edit Employee Details</h2>
      {loading ? (
        <p>Loading employee details...</p>
      ) : (
        <form onSubmit={handleSubmit} className="employee-form">
          {error && <p className="error">{error}</p>}
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
<input name="aadharNumber" placeholder="Aadhar Number" value={formData.aadharNumber} onChange={handleChange} required />
<input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required />
<input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleChange} required />
<input name="role" placeholder="Job Role" value={formData.role} onChange={handleChange} required />
<input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
<input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
<input name="email" type="email" placeholder="Email ID" value={formData.email} onChange={handleChange} required autoComplete="email" />
<input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="current-password" />
<input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
<input name="emergencyContact" placeholder="Emergency Contact No." value={formData.emergencyContact} onChange={handleChange} required />
<input name="checkIn" type="time" value={formData.checkIn} onChange={handleChange} required />
<input name="checkOut" type="time" value={formData.checkOut} onChange={handleChange} required />

          <button type="submit">Edit and Save</button>
        </form>
      )}
    </div>
  );
};

export default EmployeeDetails;

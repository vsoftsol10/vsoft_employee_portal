import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp, getDocs, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Directory.css';

const Directory = () => {
  const [activeTab, setActiveTab] = useState('addEmployee');
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
    aadhar: '',
    fatherName: '',
    motherName: '',
    dob: '',
    address: '',
    emergencyContact: '',
    checkInTime: '',
    checkOutTime: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name, email, password, role, department, aadhar, fatherName, motherName, dob, address, emergencyContact, checkInTime, checkOutTime
    } = formData;
  
    if (!name || !email || !password || !role || !department || !aadhar || !fatherName || !motherName || !dob || !address || !emergencyContact || !checkInTime || !checkOutTime) {
      setError('All fields are required.');
      return;
    }
  
    setLoading(true);
    setError('');
  
 try {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Save employee details to Firestore
  await setDoc(doc(firestore, `employees/${user.uid}`), {
    name,
    email,
    role,
    department,
    aadhar,
    fatherName,
    motherName,
    dob,
    address,
    emergencyContact,
    checkInTime,
    checkOutTime,
    employmentStatus: 'Active',
    dateJoined: Timestamp.fromDate(new Date()),
  });
} catch (error) {
  if (error.code === 'auth/email-already-in-use') {
    setError('This email address is already in use. Please use a different email.');
  } else {
    console.error('Error adding employee:', error.message);
    setError('Error adding employee: ' + error.message);
  }
}
  };
  
  return (
    <div className="directory-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('addEmployee')} className={activeTab === 'addEmployee' ? 'active' : ''}>
          Add Employee
        </button>
        <button onClick={() => setActiveTab('workingEmployee')} className={activeTab === 'workingEmployee' ? 'active' : ''}>
          Working Employee
        </button>
      </div>

      <div className="content">
        {activeTab === 'addEmployee' && (
          <form onSubmit={handleSubmit} className="employee-form">
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <input name="role" placeholder="Role" value={formData.role} onChange={handleChange} required />
            <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} required />
            <input name="aadhar" placeholder="Aadhar Number" value={formData.aadhar} onChange={handleChange} required />
            <input name="fatherName" placeholder="Father's Name" value={formData.fatherName} onChange={handleChange} required />
            <input name="motherName" placeholder="Mother's Name" value={formData.motherName} onChange={handleChange} required />
            <input name="dob" type="date" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required />
            <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
            <input name="emergencyContact" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={handleChange} required />
            <input name="checkInTime" type="time" placeholder="Check-In Time" value={formData.checkInTime} onChange={handleChange} required />
            <input name="checkOutTime" type="time" placeholder="Check-Out Time" value={formData.checkOutTime} onChange={handleChange} required />
            <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Employee'}</button>
            {error && <p className="error">{error}</p>}
          </form>
        )}

        {activeTab === 'workingEmployee' && (
          <div className="employee-list">
            {employees.map(employee => (
              <div className="employee-card" key={employee.id}>
                <span>{employee.name}</span>
                <button onClick={() => navigate(`/admin/employee-details/${employee.id}`)} className="view-details">
                  View Details
                </button>
                <span className={`status ${employee.employmentStatus === 'Active' ? 'present' : 'absent'}`}>
                  {employee.employmentStatus === 'Active' ? 'Present' : 'Absent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;

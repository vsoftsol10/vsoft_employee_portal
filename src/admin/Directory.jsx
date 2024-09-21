import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp, getDocs, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Directory.css'; // Import the CSS

const Directory = () => {
  const [activeTab, setActiveTab] = useState('addEmployee');
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

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
    const { name, email, password, role, department } = formData;

    if (!name || !email || !password || !role || !department) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, 'employees', user.uid), {
        name,
        email,
        role,
        department,
        profilePic: '',
        employmentStatus: 'Active',
        dateJoined: Timestamp.fromDate(new Date()),
      });

      alert('Employee added successfully');
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        password: '',
      });
    } catch (error) {
      console.error('Error adding employee:', error.message);
      setError('Error adding employee: ' + error.message);
    } finally {
      setLoading(false);
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

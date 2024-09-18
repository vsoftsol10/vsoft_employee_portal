import React, { useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
  });

  const [error, setError] = useState(''); // State to manage errors
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role, department } = formData;

    // Basic validation
    if (!name || !email || !password || !role || !department) {
      setError('All fields are required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user details in Firestore
      await setDoc(doc(firestore, 'employees', user.uid), {
        name,
        email,
        role,
        department,
        profilePic: '', // Optional
        employmentStatus: 'Active',
        dateJoined: Timestamp.fromDate(new Date()),
      });

      alert('Employee added successfully');
      // Reset form and error state
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        password: '',
      });
    } catch (error) {
      console.error('Error adding employee: ', error);

      // Set error message based on error code
      if (error.code === 'auth/email-already-in-use') {
        setError('The email address is already in use by another account.');
      } else if (error.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else if (error.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else {
        setError('Failed to add employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        type="email"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <input
        name="role"
        placeholder="Role"
        value={formData.role}
        onChange={handleChange}
        required
      />
      <input
        name="department"
        placeholder="Department"
        value={formData.department}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Employee'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddEmployee;

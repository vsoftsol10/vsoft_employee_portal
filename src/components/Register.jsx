import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await addDoc(collection(firestore, 'users'), {
        uid: user.uid,
        name,
        email,
        role,
      });

      alert('Registration Successful');
      navigate('/login');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Registration failed! Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="header">
        <h1>Vsoft Solutions</h1>
      </div>
      <div className="login-container">
        <div className="login-left">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgAsi4AJpnBnlcV26BnNpvrW6FHGtLGX5mCQ&s"
            alt="Register"
            className="login-image"
          />
        </div>
        <div className="login-right">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Set Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Set Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Select Employment Role</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
            </select>
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

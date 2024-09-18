import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the updated CSS file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to user dashboard on successful login
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <img src="/assets/login.jpg" alt="Login" className="login-image" />
        </div>
        <div className="login-right">
          <div className="logo-container">
            <img src="/assets/logo1.png" alt="Logo" className="logo" />
          </div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="submit">Login</button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;

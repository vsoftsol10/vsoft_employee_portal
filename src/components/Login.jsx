import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Updated CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false); // State to toggle between user and admin login
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (isAdminLogin) {
        navigate('/admin-dashboard'); // Redirect to admin dashboard for admin login
      } else {
        navigate('/dashboard'); // Redirect to user dashboard on successful login
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const toggleTab = (isAdmin) => {
    setIsAdminLogin(isAdmin);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/assets/logo.png" alt="Logo" className="logo" />

        {/* Tabs for User/Admin Login */}
        <div className="tabs">
          <div
            className={`tab ${!isAdminLogin ? 'active' : ''}`}
            onClick={() => toggleTab(false)}
          >
            User Login
          </div>
          <div
            className={`tab ${isAdminLogin ? 'active' : ''}`}
            onClick={() => toggleTab(true)}
          >
            Admin Login
          </div>
        </div>

        <h2>{isAdminLogin ? 'Admin Login' : 'User Login'}</h2>
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
          <button type="submit">{isAdminLogin ? 'Admin Login' : 'Login'}</button>
        </form>

        {/* Animated Text */}
        <h1 className="animated-text">Welcome to Vsoft solutions.....</h1>
      </div>
    </div>
  );
};

export default Login;

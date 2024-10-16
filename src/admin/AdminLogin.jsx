import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg'; // Import the profile icon
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Attempt to sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      // Navigate to the admin dashboard after successful login
      navigate('/admin/dashboard'); // Update this line to navigate to the correct admin route
    } catch (error) {
      alert('Login failed. Please try again later');
    }
  };

  return (
    <div className="login-content">
      <div className="login-right-body">
        <div className="rightloginrectangle">
          <div className="rightloginrectangletwo">
            <p style={{ color: "white", fontSize: "50px" }}>Welcome!</p>
            <div className="rightloginimage">
              <img src="/assets/adminlogin.png" alt="img" className="imglogin" />
            </div>
          </div>
        </div>
      </div>

      <div className="login-body-left">
        <div className="Vsoftlogo">
          <img src="/assets/Vsoft_Logo-removebg-preview.png" alt="logo" className="logoright" />
        </div>
        <div className="employeeloginword">Admin Login</div>
        <div className="profile-icon-container">
          <CgProfile className="profile-icon" />
        </div>

        <form className="loginform" onSubmit={handleLogin}>
          <div className="input-container">
            <label htmlFor="email" className='adminemailinputmobile'>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="input-icon"></div> {/* Profile icon for email */}
          </div>
          <div className="input-container">
            <label htmlFor="password" className='adminpasswordinputmobile'>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="input-icon"></div> {/* Key icon for password */}
          </div>
          <button type="submit" className="login-submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
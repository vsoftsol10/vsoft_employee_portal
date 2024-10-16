import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg'; // Profile icon
import { FiKey } from 'react-icons/fi'; // Key icon
import './UserLogin.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed. Please try again later');
    }
  };

  return (
    <div className="login-content"> {/* Main container for both sides */}
      {/* Left Side Content */}
      <div className="login-body-left">
        <div className="Vsoftlogo">
          <img src="/assets/Vsoft_Logo-removebg-preview.png" alt="logo" className="logoleft" />
        </div>
        <div className="employeeloginword">Employee Login</div>
        <div className="profile-icon-container">
          <CgProfile className="profile-icon" /> {/* Use the profile icon */}
        </div>
       
        <div className="loginform">
          <div className="input-container">
            <label htmlFor="email" className='emailinputmobile'>Email</label> {/* Label for Email */}
            <div className="input-wrapper">
            <CgProfile className="input-icon" /> {/* FontAwesome icon for user */}
              <input
                type="email"
                id="email"
                placeholder="Enter your Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="input-container">
          
            <label htmlFor="password" className="passwordinputmobile">Password</label> {/* Label for Password */}
            <div className="input-wrapper">
            <FiKey className="input-icon" /> {/* FontAwesome icon for lock */}
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="login-submit" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      
      {/* Right Side Content */}
      <div className="login-right-body">
        <div className="rightloginrectangle">
          <div className="rightloginrectangletwo">
            <p style={{ color: "white", fontSize: "50px" }}>Welcome!</p> {/* Corrected inline style */}
            <div className="rightloginimage">
              <img src="/assets/loginimgright.png" alt="img" className="imglogin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;

import React, { useState } from 'react';
import './ChangePassword.css'; // Import CSS file for styling

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    // Basic validation logic
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      setSuccessMessage('');
      return;
    }

    // Logic to change the password (API call or Firebase authentication)
    // For example, call your backend or authentication system here.

    setSuccessMessage('Password successfully changed!');
    setErrorMessage('');
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <div className="form-group">
          <label>Old Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit" className="change-password-btn">Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;

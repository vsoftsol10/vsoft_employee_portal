import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // Changed icon here
import './Header.css'; // Ensure to have appropriate styles

const Header = () => {
  const [profileImage, setProfileImage] = useState('https://via.placeholder.com/40');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const storedImage = localStorage.getItem('profileImage');
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    navigate('/notification');
  };

  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfileOptionClick = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <div className="header">
      <div className="header-content">
      
          <div className="profile-container" ref={profileRef}>
          <div className="header-right">
          <FontAwesomeIcon
            icon={faBell}
            className="notification-icon"
            onClick={handleNotificationClick}
          />
            <FontAwesomeIcon
              icon={faUserCircle} // Updated icon here
              className="profile-icon"
              onClick={handleProfileClick}
              size="2x" // Adjust size as needed
            />
            {dropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => handleProfileOptionClick('/profile')}>
                  My Profile
                </button>
                <button onClick={() => handleProfileOptionClick('/login')}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;


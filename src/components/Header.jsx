import React, { useState, useEffect } from 'react';
import './Header.css';
import { FiBell } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { firestore } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(firestore, 'rareusers', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileImage(userData.profileImage);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    fetchProfileImage();
  }, []);

  const toggleNotificationDropdown = () => {
    setNotificationOpen(!isNotificationOpen);
    setProfileOpen(false); // Close profile dropdown if open
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!isProfileOpen);
    setNotificationOpen(false); // Close notification dropdown if open
  };

  const handleLogout = () => {
    // Add your logout logic here, then navigate to login
    auth.signOut();
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="header">
   <div className="logo">
  <a href="/">
    <img src="/assets/logo.png" alt="Logo" className="logo-image" />
  </a>
</div>
      <nav className="navigation">
        <div className="icon" onClick={toggleNotificationDropdown}>
          <FiBell className="notification-icon" />
          {isNotificationOpen && (
            <div className="dropdown notification-dropdown">
              <ul>
                <li>Notification 1</li>
                <li>Notification 2</li>
                <li>Notification 3</li>
              </ul>
              <div className="show-all">Show all</div>
            </div>
          )}
        </div>

        <div className="icon" onClick={toggleProfileDropdown}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <FaUserCircle className="default-avatar" />
          )}
          {isProfileOpen && (
            <div className="dropdown profile-dropdown">
              <ul>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
                <li onClick={handleLogout}>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

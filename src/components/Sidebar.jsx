import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCalendarAlt, faClipboardList, faDollarSign, faFolder, faTasks, faEnvelope, faQuestionCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS for styling

const Sidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); // Toggle the sidebar visibility
  };

  return (
    <>
      {/* Sidebar for both desktop and mobile */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-container">
          <img src="/assets/vsoftlogo.png" alt="Logo" className="sidebar-logo-image" />
          <p style={{ fontFamily: 'Poppins, sans-serif', color: '#793A71' }}>VSOFT</p>
        </div>

        <div className="sidebar-links">
          <NavLink to="/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/attendance">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Attendance</span>
          </NavLink>
          <NavLink to="/leave-tracker">
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Leave Tracker</span>
          </NavLink>
          <NavLink to="/payroll">
            <FontAwesomeIcon icon={faDollarSign} />
            <span>Payroll</span>
          </NavLink>
          <NavLink to="/files">
            <FontAwesomeIcon icon={faFolder} />
            <span>Files</span>
          </NavLink>
          <NavLink to="/tasks">
            <FontAwesomeIcon icon={faTasks} />
            <span>Tasks</span>
          </NavLink>
          <NavLink to="/message">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Message</span>
          </NavLink>
          <NavLink to="/faqs">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>FAQs</span>
          </NavLink>
        </div>
      </div>

      {/* Hamburger Button for mobile */}
      <button className="hamburger" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </>
  );
};

export default Sidebar;

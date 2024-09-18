import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCalendarAlt, faClipboardList, faDollarSign, faFolder, faTasks, faEnvelope, faQuestionCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Import the CSS for styling

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar visibility

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close the sidebar when a link is clicked
  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/assets/logo1.png" alt="Logo" />
          <div className="sidebar-text">
            <h1>Vsoft</h1>
            <h2>Solutions</h2>
          </div>
        </div>
        <ul>
          <li>
            <Link to="/dashboard" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/attendance" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Attendance</span>
            </Link>
          </li>
          <li>
            <Link to="/leave-tracker" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Leave Tracker</span>
            </Link>
          </li>
          <li>
            <Link to="/payroll" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faDollarSign} />
              <span>Payroll</span>
            </Link>
          </li>
          <li>
            <Link to="/files" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faFolder} />
              <span>Files</span>
            </Link>
          </li>
          <li>
            <Link to="/tasks" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faTasks} />
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link to="/message" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Message</span>
            </Link>
          </li>
          <li>
            <Link to="/faqs" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span>FAQs</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Hamburger Button */}
      <button className="hamburger" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </>
  );
};

export default Sidebar;

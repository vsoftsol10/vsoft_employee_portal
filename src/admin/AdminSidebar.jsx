import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClipboardList, faTasks, faUsers, faFolder, faBars, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import './AdminSidebar.css'; // Import the CSS for styling

const AdminSidebar = () => {
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
            <h1>Admin</h1>
            <h2>Panel</h2>
          </div>
        </div>
        <ul>
          {/* New Dashboard Link */}
          <li>
            <Link to="/admin/dashboard" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faTasks} /> {/* You can choose a different icon if needed */}
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/directory" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faUsers} />
              <span>Directory</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/attendance" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Attendance</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/leavetracker" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Leave Tracker</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/tasks" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faTasks} />
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/files" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faFolder} />
              <span>Files</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/payrollupload" onClick={closeSidebar}>
              <FontAwesomeIcon icon={faDollarSign} />
              <span>Payroll</span>
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

export default AdminSidebar;

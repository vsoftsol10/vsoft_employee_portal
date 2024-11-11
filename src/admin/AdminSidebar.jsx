import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faAddressBook, // Directory icon
  faCalendarAlt, 
  faClipboardList, 
  faDollarSign, 
  faFolder, 
  faTasks, 
  faBars 
} from '@fortawesome/free-solid-svg-icons';
import './AdminSidebar.css'; // Import the CSS for styling

const AdminSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); // Toggle the sidebar visibility
  };

  return (
    <>
      {/* Sidebar for both desktop and mobile */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo-container">
          <img src="/assets/vsoftlogo.png" alt="Logo" className="admin-sidebar-logo-image" />
          <p style={{ fontFamily: 'Poppins, sans-serif', color: '#793A71' }}>VSOFT</p>
        </div>

        <div className="admin-sidebar-links">
          <NavLink to="/admin/dashboard">
            <FontAwesomeIcon icon={faTachometerAlt} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/directory">
            <FontAwesomeIcon icon={faAddressBook} /> {/* Correct icon for Directory */}
            <span>Directory</span>
          </NavLink>
          <NavLink to="/admin/attendance">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Attendance</span>
          </NavLink>
          <NavLink to="/admin/leavetracker">
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Leave Tracker</span>
          </NavLink>
          <NavLink to="/admin/payrollupload">
            <FontAwesomeIcon icon={faDollarSign} />
            <span>Payroll</span>
          </NavLink>
          <NavLink to="/admin/files">
            <FontAwesomeIcon icon={faFolder} />
            <span>Files</span>
          </NavLink>
          <NavLink to="/admin/tasks">
            <FontAwesomeIcon icon={faTasks} />
            <span>Tasks</span>
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

export default AdminSidebar;

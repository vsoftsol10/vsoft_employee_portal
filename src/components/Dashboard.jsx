import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const user = auth.currentUser; // Get the current user
  useEffect(() => {
    if (user) {
      const uid = user.uid;
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/check-d47d2.appspot.com/o/users%2F${uid}%2Fprofile.jpg?alt=media`;
      console.log(imageUrl); // Check the URL in the console
      setProfileImage(imageUrl);
    } else {
      navigate('/login');
    }
  }, [user, navigate]);
  

  // Handle logout function
  const handleLogout = () => {
    auth.signOut();
    navigate('/login'); // Redirect to login page after logout
  };

  // Update doughnut chart data
  const chartData = {
    labels: ['Sick Leave', 'Casual Leave'],
    datasets: [
      {
        label: 'Leave Types',
        data: [2, 2], // Data for sick leave and casual leave
        backgroundColor: ['#FF6384', '#36A2EB'], // Colors for the chart
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* Profile Card Section */}
      <div className="dashboard-profile-card">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="dashboard-profile-img"
          />
        ) : (
          <div className="dashboard-placeholder-img">No Image Available</div> // Placeholder if no image
        )}

        {/* View Profile Button */}
        <Link to="/profile">
          <button className="dashboard-btn dashboard-profile-btn">View Profile</button>
        </Link>

        {/* Logout Button */}
        <button
          className="dashboard-btn dashboard-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Doughnut Chart Section */}
      <div className="dashboard-chart-section">
        <Doughnut data={chartData} />
      </div>

      {/* Notifications Section */}
      <div className="dashboard-notification-section">
        <h2 className="dashboard-notification-heading">Notifications</h2>
        <marquee
          direction="up"
          scrollamount="3"
          className="dashboard-notification-marquee"
        >
          <p>You have a new message from Vijay!</p>
          <p>Your project deadline is tomorrow!</p>
          <p>Update your profile picture!</p>
          <p>Your report has been submitted successfully!</p>
        </marquee>
      </div>
    </div>
  );
};

export default Dashboard;

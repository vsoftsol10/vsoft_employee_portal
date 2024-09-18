import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import Firebase config

// User components
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import LeaveTracker from './components/LeaveTracker';
import UserPayroll from './components/Payroll';
import Tasks from './components/Tasks';
import PerformanceReviews from './components/PerformanceReviews';
import Files from './components/Files';
import Message from './components/Message';
import FAQs from './components/FAQs';
import Notification from './components/Notification';
import Profile from './components/Profile';
import ChangePassword from './components/ChangePassword';

// Admin components
import AdminDashboard from './admin/Dashboard';
import AdminTeams from './admin/Teams';
import AdminTasks from './admin/Tasks';
import AdminTeamAssignment from './admin/TeamAssignment';
import AdminReviews from './admin/Reviews';
import AdminPayroll from './admin/Payroll';
import AdminFAQs from './admin/FAQs';
import AdminLeaveRequests from './admin/LeaveRequests';
import Directory from './admin/Directory';
import PersonDetails from './admin/PersonDetails';
import UserDetails from './admin/UserDetails'; // UserDetails page for users
import AddEmployee from './admin/AddEmployee'; // Import AddEmployee component

import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Initial role is null

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Example: Fetch and set the user role
        // Replace this with your actual role-checking logic
        setUserRole('admin'); // Replace with actual role-fetching logic
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loader"></div>;
  }

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-tracker"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <LeaveTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <UserPayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Files />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Message />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faqs"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <FAQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <Sidebar role={userRole} />
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team-assignment"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminTeamAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payroll"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminFAQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-requests"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLeaveRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/directory"
            element={
              <ProtectedRoute requiredRole="admin">
                <Directory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/person-details"
            element={
              <ProtectedRoute requiredRole="admin">
                <PersonDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-employee"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddEmployee />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown route to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

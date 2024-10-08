import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig"; // Import Firebase config

// User components
import UserSidebar from "./components/Sidebar"; // User Sidebar
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/Dashboard";
import UserAttendance from "./components/Attendance"; // Renamed to UserAttendance
import LeaveTracker from "./components/LeaveTracker";
import UserPayroll from "./components/Payroll";
import Tasks from "./components/Tasks";
import PerformanceReviews from "./components/PerformanceReviews";
import Files from "./components/Files";
import Message from "./components/Message";
import FAQs from "./components/FAQs";
import Notification from "./components/Notification";
import Profile from "./components/Profile";
import ChangePassword from "./components/ChangePassword";
import DurationPage from "./components/DurationPage";
// Admin components
import AdminSidebar from "./admin/AdminSidebar"; // Admin Sidebar
import AdminDashboard from "./admin/Dashboard";
import AdminTasksAndGroups from "./admin/TasksAndGroups";
import AdminFiles from "./admin/Files"; // Import AdminFiles component
import AdminReviews from "./admin/Reviews";
import AdminPayroll from "./admin/Payroll";
import CheckInOuts from "./admin/CheckInOuts";
import AdminLeaveTracker from "./admin/Leavetracker"; // Renamed to AdminLeaveTracker
import Directory from "./admin/Directory";
import AdminAttendance from "./admin/Attendance"; // Renamed to AdminAttendance
import TraineeDetails from "./admin/TraineeDetails";
import AddEmployee from "./admin/AddEmployee"; // Import AddEmployee component
import EmployeeDetails from "./admin/EmployeeDetails"; // Import EmployeeDetails component
import EmployeeDocs from "./admin/EmployeeDocs";
import PayrollUpload from "./admin/PayrollUpload";
import "./App.css";
import InternDetails from "./admin/InternDetails";

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
        setUserRole("admin"); // Replace with actual role-fetching logic
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
                <UserSidebar />
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <UserAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-tracker"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <LeaveTracker />
              </ProtectedRoute>
            }
          />
            <Route
            path="/DurationPage"
            element={
              <ProtectedRoute>
                <DurationPage />
                
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <UserPayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <Files />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <Message />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faqs"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <FAQs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <UserSidebar />
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checkinouts/:uid"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <CheckInOuts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminDashboard />{" "}
                {/* Or another component handling the FAQ section */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminTasksAndGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/files"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/:employeeId"
            element={
              <ProtectedRoute>
                <EmployeeDocs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payroll"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminPayroll />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/leavetracker"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminLeaveTracker />
              </ProtectedRoute>
            }
          />
     <Route
          path="/admin/directory"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSidebar />
              <Directory />
            </ProtectedRoute>
          }
        />
       <Route
  path="/admin/directory/:collectionName/:employeeId"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSidebar />
      <EmployeeDetails /> {/* Pass the employeeId to this component */}
    </ProtectedRoute>
  }
/>

 <Route path="/admin/directory/trainees/:traineeId" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSidebar />
      <TraineeDetails />
     
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/directory/interns/:uid"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminSidebar />
      <InternDetails /> {/* Pass the employeeId to this component */}
    </ProtectedRoute>
  }
/>
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AdminAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-employee"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employee-details/:employeeId"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <EmployeeDetails />
              </ProtectedRoute>
            }
          />
          

          <Route
            path="/admin/payrollupload"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminSidebar />
                <PayrollUpload />
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

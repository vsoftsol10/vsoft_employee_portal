import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EmployeeDetails.css'; // Import the CSS file

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    // Fetch employee details using employeeId
    // Example API call to get employee data
    const fetchEmployeeData = async () => {
      // Replace with actual data fetching logic
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();
      setEmployeeData(data);
    };
    fetchEmployeeData();
  }, [employeeId]);

  if (!employeeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="employee-details-container">
      <div className="employee-header">
        <h2>Employee Details</h2>
        <p>ID: {employeeId}</p>
      </div>

      <div className="employee-info">
        <h3>{employeeData.name}</h3>
        <div className="employee-info-row">
          <p><span>Position:</span> {employeeData.position}</p>
          <p><span>Department:</span> {employeeData.department}</p>
        </div>
        <div className="employee-info-row">
          <p><span>Email:</span> {employeeData.email}</p>
          <p><span>Phone:</span> {employeeData.phone}</p>
        </div>
        <div className="employee-info-row">
          <p><span>Join Date:</span> {employeeData.joinDate}</p>
          <p><span>Status:</span> {employeeData.status}</p>
        </div>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {employeeData.tasks.map((task, index) => (
            <tr key={index}>
              <td>{task.name}</td>
              <td>{task.status}</td>
              <td>{task.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="employee-actions">
        <button className="btn">Edit Employee</button>
      </div>
    </div>
  );
};

export default EmployeeDetails;

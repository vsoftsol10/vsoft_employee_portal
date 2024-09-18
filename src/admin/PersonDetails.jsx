import React from 'react';
import './PersonDetails.css';

const PersonDetails = ({ match }) => {
  const personId = match.params.id; // Fetch user ID from route parameters

  // Mock person data (replace with API calls or state management)
  const person = {
    name: 'John Doe',
    jobRole: 'Developer',
    checkIn: '9:00 AM',
    checkOut: '6:00 PM',
    attendance: { present: 20, absent: 5 }, // Example attendance
    leaveRequests: ['2024-01-10', '2024-02-05'],
    tasks: ['Task 1', 'Task 2', 'Task 3'],
    performanceRating: 4,
    files: ['Aadhar', 'PAN Card', 'License', 'Resume', 'Offer Letter'],
    payslips: ['January 2024', 'February 2024'], // Example payslip list
  };

  const handleRatingChange = (newRating) => {
    // Logic for updating the performance rating
  };

  return (
    <div className="person-details">
      <h1>{person.name} - {person.jobRole}</h1>

      <h2>Check-In / Check-Out</h2>
      <p>Check-In Time: {person.checkIn}</p>
      <p>Check-Out Time: {person.checkOut}</p>

      <h2>Attendance</h2>
      <p>Present Days: {person.attendance.present}</p>
      <p>Absent Days: {person.attendance.absent}</p>

      <h2>Leave Requests</h2>
      <ul>
        {person.leaveRequests.map((date, index) => (
          <li key={index}>{date}</li>
        ))}
      </ul>

      <h2>Assigned Tasks</h2>
      <ul>
        {person.tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>

      <h2>Performance Rating</h2>
      <p>Rating: {person.performanceRating} / 5</p>
      <button onClick={() => handleRatingChange(person.performanceRating + 1)}>Increase Rating</button>

      <h2>Uploaded Files</h2>
      <ul>
        {person.files.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>

      <h2>Payslips</h2>
      <ul>
        {person.payslips.map((payslip, index) => (
          <li key={index}>{payslip}</li>
        ))}
      </ul>

      <button>Upload Payslip</button> {/* Admin can upload new payslip */}
    </div>
  );
};

export default PersonDetails;

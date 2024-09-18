import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, getDownloadURL } from 'firebase/storage';
import { saveAs } from 'file-saver'; // Make sure file-saver is installed
import { storage } from '../firebaseConfig'; // Import your Firebase services

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i);

const Payroll = () => {
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleDownload = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        alert('User not authenticated');
        return;
      }
  
      const uid = user.uid;
      const filePath = `payslips/${uid}/Price-List.pdf`;
      const fileRef = ref(storage, filePath);
  
      // Log URL for debugging
      const url = await getDownloadURL(fileRef);
      console.log('File URL:', url);
  
      // Fetch the file
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Convert response to Blob and download
      const blob = await response.blob();
      saveAs(blob, 'Price-List.pdf');
    } catch (error) {
      console.error('Error fetching document:', error);
      alert(`Error fetching document: ${error.message}`);
    }
  };
  
  return (
    <div className="payroll-container">
      <h1>Payroll Download</h1>
      <div className="dropdowns">
        <label htmlFor="month">Month:</label>
        <select id="month" value={selectedMonth} onChange={handleMonthChange}>
          {months.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>
        <label htmlFor="year">Year:</label>
        <select id="year" value={selectedYear} onChange={handleYearChange}>
          {years.map((year, index) => (
            <option key={index} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <button onClick={handleDownload}>Download</button>
      <style>
        {`
          .payroll-container {
            padding: 20px;
            max-width: 400px;
            margin: auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .dropdowns {
            margin-bottom: 20px;
          }
          label {
            margin-right: 10px;
          }
          select {
            margin-right: 20px;
          }
          button {
            padding: 10px 20px;
            border: none;
            background-color: #007bff;
            color: white;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
          }
          button:hover {
            background-color: #0056b3;
          }
        `}
      </style>
    </div>
  );
};

export default Payroll;

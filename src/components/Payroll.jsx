import React, { useState, useEffect } from 'react'; 
import { getAuth } from 'firebase/auth';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig'; // Import your Firebase services

const Payroll = () => {
  const [payrollFiles, setPayrollFiles] = useState([]);

  useEffect(() => {
    const fetchPayrollFiles = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          alert('User not authenticated');
          return;
        }

        const uid = user.uid;
        const months = ['September', 'October', 'November'];
        const year = new Date().getFullYear();

        // Create file paths dynamically
        const files = await Promise.all(
          months.map(async (month) => {
            const filePath = `payrollpdf/${uid}/2024/${month}/payroll.pdf`;
            const url = await getDownloadURL(ref(storage, filePath));
            return { name: `Payroll for ${month} ${year}`, url };
          })
        );

        setPayrollFiles(files);
      } catch (error) {
        console.error('Error fetching payroll files:', error);
        alert(`Error fetching payroll files: ${error.message}`);
      }
    };

    fetchPayrollFiles();
  }, []);

  return (
    <div className="payroll-container">
      <h1>Payroll Downloads</h1>
      <ul className="payroll-list">
        {payrollFiles.map((file, index) => (
          <li key={index} className="payroll-item">
            <span>{file.name}</span>
            <button onClick={() => window.open(file.url, '_blank')}>Download</button>
          </li>
        ))}
      </ul>
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
          .payroll-list {
            list-style: none;
            padding: 0;
          }
          .payroll-item {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          button {
            padding: 10px 15px;
            border: none;
            background-color: #007bff;
            color: white;
            font-size: 14px;
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

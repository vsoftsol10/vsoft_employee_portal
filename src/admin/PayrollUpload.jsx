import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './PayrollUpload.css';

const db = getFirestore();
const storage = getStorage();

const PayrollUpload = () => {
  const [employees, setEmployees] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [interns, setInterns] = useState([]);
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payrollFiles, setPayrollFiles] = useState([]); // Store payroll files
  const [showFiles, setShowFiles] = useState(false); // Manage visibility of payroll files

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesSnapshot = await getDocs(collection(db, 'employees'));
        const traineesSnapshot = await getDocs(collection(db, 'trainees'));
        const internsSnapshot = await getDocs(collection(db, 'interns'));

        const employeeList = employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const traineeList = traineesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const internList = internsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setEmployees(employeeList);
        setTrainees(traineeList);
        setInterns(internList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleUpload = async (employeeId) => {
    if (!month || !year || !file) {
      alert('Please select a month, year, and file.');
      return;
    }

    setLoading(true); // Set loading to true during upload

    try {
      const storageRef = ref(storage, `payrollpdf/${employeeId}/${year}/${month}/payroll.pdf`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);
      const payrollRef = doc(db, `payrollpdf/${employeeId}/${year}/payrollData`);
      await setDoc(payrollRef, { [month]: fileURL }, { merge: true });

      alert('File uploaded successfully!');
      setActiveEmployee(null); // Close the upload form after success
      setFile(null); // Reset the file input
      setMonth(''); // Reset month
      setYear(''); // Reset year
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setLoading(false); // Set loading to false after upload completes
    }
  };

  const viewPastUploads = async (employeeId) => {
    try {
      const payrollRef = doc(db, `payrollpdf/${employeeId}`);
      const payrollDoc = await getDoc(payrollRef);

      if (payrollDoc.exists()) {
        const payrollData = payrollDoc.data();
        const uploads = Object.keys(payrollData).map(month => ({
          month,
          url: payrollData[month]
        }));
        setPayrollFiles(uploads); // Set payroll files data
        setShowFiles(true); // Show payroll files
      } else {
        alert('No payroll data found.');
      }
    } catch (error) {
      console.error('Error fetching past uploads:', error);
    }
  };

  return (
    <div className='payroll'>
      <h2>Payroll Management</h2>

      {/* Employees Section */}
      <h3>Employees</h3>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>
            {employee.name}
            <button onClick={() => setActiveEmployee(employee.id)}>Tap to Upload</button>

            {/* Show dropdowns and upload option when the "Tap to Upload" button is clicked for this employee */}
            {activeEmployee === employee.id && (
              <div className="upload-section">
                <label>
                  Select Month:
                  <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Select a month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{month}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Select Year:
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">Select a year</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Upload Payroll PDF:
                  <input type="file" onChange={handleFileChange} accept="application/pdf" />
                </label>

                <button 
                  onClick={() => handleUpload(employee.id)} 
                  disabled={loading || !month || !year || !file}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Trainees Section */}
      <h3>Trainees</h3>
      <ul>
        {trainees.map(trainee => (
          <li key={trainee.id}>
            {trainee.name}
            <button onClick={() => setActiveEmployee(trainee.id)}>Tap to Upload</button>

            {/* Show dropdowns and upload option when the "Tap to Upload" button is clicked for this trainee */}
            {activeEmployee === trainee.id && (
              <div className="upload-section">
                <label>
                  Select Month:
                  <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Select a month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{month}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Select Year:
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">Select a year</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Upload Payroll PDF:
                  <input type="file" onChange={handleFileChange} accept="application/pdf" />
                </label>

                <button 
                  onClick={() => handleUpload(trainee.id)} 
                  disabled={loading || !month || !year || !file}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Interns Section */}
      <h3>Interns</h3>
      <ul>
        {interns.map(intern => (
          <li key={intern.id}>
            {intern.name}
            <button onClick={() => setActiveEmployee(intern.id)}>Tap to Upload</button>

            {/* Show dropdowns and upload option when the "Tap to Upload" button is clicked for this intern */}
            {activeEmployee === intern.id && (
              <div className="upload-section">
                <label>
                  Select Month:
                  <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Select a month</option>
                    {months.map((month, index) => (
                      <option key={index} value={month}>{month}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Select Year:
                  <select value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">Select a year</option>
                    {years.map((year, index) => (
                      <option key={index} value={year}>{year}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Upload Payroll PDF:
                  <input type="file" onChange={handleFileChange} accept="application/pdf" />
                </label>

                <button 
                  onClick={() => handleUpload(intern.id)} 
                  disabled={loading || !month || !year || !file}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Show Past Uploads */}
      <h3>Past Uploads</h3>
      <button onClick={() => viewPastUploads(activeEmployee)}>View Past Uploads</button>
      {showFiles && (
        <ul>
          {payrollFiles.map((fileData, index) => (
            <li key={index}>
              {fileData.month}: <a href={fileData.url} target="_blank" rel="noopener noreferrer">View PDF</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PayrollUpload;

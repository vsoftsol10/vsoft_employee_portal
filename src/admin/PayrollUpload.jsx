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
  const [activeTrainee, setActiveTrainee] = useState(null);
  const [activeIntern, setActiveIntern] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payrollFiles, setPayrollFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

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

    setLoading(true);

    try {
      const fileName = `${month}-${year}.pdf`;

      const storageRef = ref(storage, `payrollpdf/${employeeId}/${year}/${month}/${fileName}`);
      await uploadBytes(storageRef, file);

      const fileURL = await getDownloadURL(storageRef);

      const payrollRef = doc(db, `payrollpdf/${employeeId}/${year}/payrollData`);
      await setDoc(payrollRef, { [month]: fileURL }, { merge: true });

      alert('File uploaded successfully!');
      setFile(null);
      setMonth('');
      setYear('');
      setShowModal(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
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
        setPayrollFiles(uploads);
        setShowFiles(true);
      } else {
        alert('No payroll data found.');
      }
    } catch (error) {
      console.error('Error fetching past uploads:', error);
    }
  };

  const Modal = ({ employeeId, closeModal }) => (
    <div className="modal">
      <div className="modal-content">
        <h3>Upload Payroll for {employeeId}</h3>
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
            {file && <span>{file.name}</span>}
          </label>

          <div className="button-container">
            <button
              onClick={() => handleUpload(employeeId)}
              disabled={loading || !month || !year || !file}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              className="cancel-btn"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="payroll">
      <h2>Payroll Management</h2>

      {/* Employees Section */}
      <h3>Employees</h3>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>
            {employee.name}
            <button onClick={() => {
              setSelectedEmployee(employee.id);
              setShowModal(true);
            }}>
              {activeEmployee === employee.id ? 'Cancel' : 'Tap to Upload'}
            </button>
          </li>
        ))}
      </ul>

      {/* Trainees Section */}
      <h3>Trainees</h3>
      <ul>
        {trainees.map(trainee => (
          <li key={trainee.id}>
            {trainee.name}
            <button onClick={() => {
              setSelectedEmployee(trainee.id);
              setShowModal(true);
            }}>
              {activeTrainee === trainee.id ? 'Cancel' : 'Tap to Upload'}
            </button>
          </li>
        ))}
      </ul>

      {/* Interns Section */}
      <h3>Interns</h3>
      <ul>
        {interns.map(intern => (
          <li key={intern.id}>
            {intern.name}
            <button onClick={() => {
              setSelectedEmployee(intern.id);
              setShowModal(true);
            }}>
              {activeIntern === intern.id ? 'Cancel' : 'Tap to Upload'}
            </button>
          </li>
        ))}
      </ul>

      {/* View Past Uploads */}
      <button onClick={() => viewPastUploads(selectedEmployee)}>View Past Uploads</button>

      {showFiles && (
        <div>
          <h3>Previous Files</h3>
          <ul>
            {payrollFiles.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.month} - {file.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal employeeId={selectedEmployee} closeModal={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default PayrollUpload;

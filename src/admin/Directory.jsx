import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc, Timestamp, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { read, utils, writeFile } from 'xlsx';
import { useNavigate } from 'react-router-dom';
import './Directory.css';
import emailjs from 'emailjs-com';
const Directory = () => {
  const [activeTab, setActiveTab] = useState('addEmployee');
  const [employees, setEmployees] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [interns, setInterns] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [message, setMessage] = useState(''); // Retain this if you still want to show messages
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = (id, collectionName) => {
    navigate(`/admin/directory/${collectionName}/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);

      const traineeSnapshot = await getDocs(collection(firestore, 'trainees'));
      const traineeList = traineeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainees(traineeList);

      const internSnapshot = await getDocs(collection(firestore, 'interns'));
      const internList = internSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInterns(internList);
    };
    fetchData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);

      setExcelData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async (e, collectionName) => {
    e.preventDefault();
  
    if (excelData.length === 0) {
      setError('Please upload an Excel file.');
      return;
    }
  
    setLoading(true);
    setError('');
    setMessage('');
  
    try {
      for (const row of excelData) {
        const {
          name, email, password, role, department, aadhar, fatherName, motherName, dob, address, emergencyContact, mobile,
          checkInStarts, checkInEnds, checkOutStarts, checkOutEnds, sickLeave, casualLeave, leaveWithoutPay
        } = row;
  
        if (!name || !email || !password || !role || !department || !aadhar || !fatherName || !motherName || !dob || !address || !emergencyContact || !mobile || !checkInStarts || !checkInEnds || !checkOutStarts || !checkOutEnds || !sickLeave || !casualLeave || !leaveWithoutPay) {
          setError(`All fields are required for ${name || 'some users'}`);
          continue;
        }
  
        if (!/\S+@\S+\.\S+/.test(email)) {
          setError(`Invalid email format for ${email}`);
          continue;
        }
  
        try {
          // Attempt to create a new user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
  
          // Send email with EmailJS
          const templateParams = {
            userId: user.uid,
            password: password,
            to_email: email,
          };
  
          await  emailjs.send('vijay', 'vijay', templateParams, 'XH1tJlK2k5wqCp5Qo');
  
          // Store user data in Firestore
          await setDoc(doc(firestore, collectionName, user.uid), {
            name,
            email,
            role,
            department,
            aadhar,
            fatherName,
            motherName,
            dob,
            address,
            emergencyContact,
            mobile,
            checkInStarts,
            checkInEnds,
            checkOutStarts,
            checkOutEnds,
            employmentStatus: 'Active',
            sickLeave,
            casualLeave,
            leaveWithoutPay,
            dateJoined: Timestamp.fromDate(new Date()),
          });
  
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            setError(`Email already in use: ${email}`);
          } else {
            setError(`Failed to add ${name}: ${error.message}`);
          }
        }
      }
  
      setMessage(`${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} added successfully`);
      setExcelData([]);
    } catch (error) {
      console.error(`Error adding to ${collectionName}: `, error);
      setError(`Failed to add to ${collectionName}. Please check the data and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, collectionName) => {
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      setMessage(`${collectionName.slice(0, -1).charAt(0).toUpperCase() + collectionName.slice(1)} removed successfully`);

      if (collectionName === 'employees') {
        setEmployees(employees.filter(employee => employee.id !== id));
      } else if (collectionName === 'trainees') {
        setTrainees(trainees.filter(trainee => trainee.id !== id));
      } else if (collectionName === 'interns') {
        setInterns(interns.filter(intern => intern.id !== id));
      }
    } catch (error) {
      console.error('Error removing:', error);
      setError('Failed to remove.');
    }
  };

  const handleExport = async (collectionName, data) => {
    const exportData = data.map(item => ({
      Name: item.name,
      Email: item.email,
      Role: item.role,
      Department: item.department,
      Mobile: item.mobile,
    }));

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, collectionName.charAt(0).toUpperCase() + collectionName.slice(1));

    writeFile(workbook, `${collectionName}.xlsx`);
  };

  return (
    <div className="directory-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('addEmployee')} className={activeTab === 'addEmployee' ? 'active' : ''}>
          Add Employee
        </button>
        <button onClick={() => setActiveTab('addTrainees')} className={activeTab === 'addTrainees' ? 'active' : ''}>
          Add Trainees
        </button>
        <button onClick={() => setActiveTab('addInterns')} className={activeTab === 'addInterns' ? 'active' : ''}>
          Add Interns
        </button>
        <button onClick={() => setActiveTab('personnel')} className={activeTab === 'personnel' ? 'active' : ''}>
          Personnel
        </button>
      </div>

      <div className="content">
        {activeTab === 'addEmployee' && (
          <div className="add-employee-section">
            <h2>Add Employees</h2>
            <form onSubmit={(e) => handleBulkSubmit(e, 'employees')} className="excel-upload-form">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} required />
              <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Employees'}</button>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
            </form>
          </div>
        )}

        {activeTab === 'addTrainees' && (
          <div className="add-trainees-section">
            <h2>Add Trainees</h2>
            <form onSubmit={(e) => handleBulkSubmit(e, 'trainees')} className="excel-upload-form">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} required />
              <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Trainees'}</button>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
            </form>
          </div>
        )}

        {activeTab === 'addInterns' && (
          <div className="add-interns-section">
            <h2>Add Interns</h2>
            <form onSubmit={(e) => handleBulkSubmit(e, 'interns')} className="excel-upload-form">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} required />
              <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Interns'}</button>
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
            </form>
          </div>
        )}

        {activeTab === 'personnel' && (
          <div className="personnel-section">
            <h2>Employees</h2>
            {employees.map(employee => (
              <div key={employee.id} className="employee-card">
                <h3>{employee.name}</h3>
                <p>{employee.email}</p>
                <button onClick={() => handleViewDetails(employee.id, 'employees')}>View Details</button>
                <button onClick={() => handleDelete(employee.id, 'employees')}>Remove</button>
              </div>
            ))}
            <button onClick={() => handleExport('employees', employees)}>Export Employees</button>

            <h2>Trainees</h2>
            {trainees.map(trainee => (
              <div key={trainee.id} className="trainee-card">
                <h3>{trainee.name}</h3>
                <p>{trainee.email}</p>
                <button onClick={() => handleViewDetails(trainee.id, 'trainees')}>View Details</button>
                <button onClick={() => handleDelete(trainee.id, 'trainees')}>Remove</button>
              </div>
            ))}
            <button onClick={() => handleExport('trainees', trainees)}>Export Trainees</button>

            <h2>Interns</h2>
            {interns.map(intern => (
              <div key={intern.id} className="intern-card">
                <h3>{intern.name}</h3>
                <p>{intern.email}</p>
                <button onClick={() => handleViewDetails(intern.id, 'interns')}>View Details</button>
                <button onClick={() => handleDelete(intern.id, 'interns')}>Remove</button>
              </div>
            ))}
            <button onClick={() => handleExport('interns', interns)}>Export Interns</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;

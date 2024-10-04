import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { read, utils, writeFile } from 'xlsx'; // Import writeFile for exporting
import './Directory.css';
import { useNavigate } from 'react-router-dom';
const Directory = () => {
  const [activeTab, setActiveTab] = useState('addEmployee');
  const [employees, setEmployees] = useState([]);
  const [excelData, setExcelData] = useState([]); // State for excel data
  const [message, setMessage] = useState(''); // For feedback messages
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

const handleViewDetails = (id) => {
  navigate(`/admin/directory/employee/${id}`); // Update to navigate correctly
}
  useEffect(() => {
    const fetchEmployees = async () => {
      const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
      const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(employeeList);
    };
    fetchEmployees();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; // Assume data is in the first sheet
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);

      setExcelData(jsonData); // Store the parsed data
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (excelData.length === 0) {
      setError("Please upload an Excel file.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage(""); // Reset message

    try {
      for (const row of excelData) {
        const {
          name, email, password, role, department, aadhar, fatherName, motherName, dob, address, emergencyContact, mobile, checkInStarts, checkInEnds, checkOutStarts, checkOutEnds,
          sickLeave, casualLeave, leaveWithoutPay
        } = row;

        // Basic validation for each row
        if (!name || !email || !password || !role || !department || !aadhar || !fatherName || !motherName || !dob || !address || !emergencyContact || !mobile || !checkInStarts || !checkInEnds || !checkOutStarts || !checkOutEnds || !sickLeave || !casualLeave || !leaveWithoutPay) {
          setError(`All fields are required for ${name || "some users"}`);
          continue;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
          setError(`Invalid email format for ${email}`);
          continue;
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user details in Firestore
        await setDoc(doc(firestore, "employees", user.uid), {
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
      }

      setMessage("Employees added successfully");
      setExcelData([]); // Reset the data
    } catch (error) {
      console.error("Error adding employees: ", error);
      setError("Failed to add employees. Please check the data and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await deleteDoc(doc(firestore, "employees", id));
      setEmployees(employees.filter(employee => employee.id !== id)); // Remove employee from state
      setMessage("Employee removed successfully");
    } catch (error) {
      console.error("Error removing employee:", error);
      setError("Failed to remove employee.");
    }
  };

  const handleExport = async () => {
    const exportData = employees.map(employee => ({
      Name: employee.name,
      Email: employee.email,
      Role: employee.role,
      Department: employee.department,
      Mobile: employee.mobile,
      // Add other fields you want to export
    }));

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    writeFile(workbook, 'employees.xlsx');
  };

  return (
    <div className="directory-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('addEmployee')} className={activeTab === 'addEmployee' ? 'active' : ''}>
          Add Employee
        </button>
        <button onClick={() => setActiveTab('workingEmployee')} className={activeTab === 'workingEmployee' ? 'active' : ''}>
          Working Employee
        </button>
      </div>

      <div className="content">
        {activeTab === 'addEmployee' && (
          <div className="add-employee-section">
            <h2>Add Employees</h2>
            <form onSubmit={handleBulkSubmit} className="excel-upload-form">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} required />
              <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Employees'}</button>
              {error && <p className="error">{error}</p>}
              {message && <p className="success">{message}</p>}
            </form>
          </div>
        )}

        {activeTab === 'workingEmployee' && (
          <div className="employee-list">
            <h3>Employees:</h3>
            <button onClick={handleExport}>Export All Employees</button>
            <ul>
     
  {employees.map((employee) => (
  <div key={employee.id}>
    <h3>{employee.name}</h3>
    <button onClick={() => handleViewDetails(employee.id)}>View Details</button>
    {/* Other employee details or actions */}
  </div>
))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;


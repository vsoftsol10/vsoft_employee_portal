import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebaseConfig'; // Adjust the import based on your structure
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import './Files.css';

const Files = () => {
  const [activeTab, setActiveTab] = useState('official');
  const [officialDocs, setOfficialDocs] = useState([]);
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [employeeFiles, setEmployeeFiles] = useState([]); // State for employee files
  const [newDoc, setNewDoc] = useState({ filename: '', purpose: '' });
  const [file, setFile] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddDoc = async () => {
    // Your existing handleAddDoc function
  };

  const handleViewFiles = async (employee) => {
    setSelectedEmployee(employee);

    // Fetch the employee's specific files
    const filesSnapshot = await getDocs(collection(firestore, `employee_documents/${employee.id}/files`));
    const files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    setEmployeeFiles(files); // Set employee files state
  };

  useEffect(() => {
    const fetchOfficialDocs = async () => {
      const snapshot = await getDocs(collection(firestore, 'official_documents'));
      const docs = await Promise.all(snapshot.docs.map(async (doc) => {
        const filesSnapshot = await getDocs(collection(firestore, `official_documents/${doc.id}/files`));
        const files = filesSnapshot.docs.map(fileDoc => ({ id: fileDoc.id, ...fileDoc.data() }));
        return { id: doc.id, files };
      }));
      setOfficialDocs(docs);
    };

    const fetchEmployeeDocs = async () => {
      const snapshot = await getDocs(collection(firestore, 'employee_documents'));
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployeeDocs(docs);
    };

    if (activeTab === 'official') {
      fetchOfficialDocs();
    } else if (activeTab === 'employee') {
      fetchEmployeeDocs();
    }
  }, [activeTab]);

  return (
    <div className="files-page" style={{ marginLeft: '250px' }}>
      <h1>Document Management</h1>
      <div className="tabs">
        <button className={activeTab === 'official' ? 'tab-active' : 'tab'} onClick={() => handleTabChange('official')}>
          Official Documents
        </button>
        <button className={activeTab === 'employee' ? 'tab-active' : 'tab'} onClick={() => handleTabChange('employee')}>
          Employee Documents
        </button>
      </div>

      {activeTab === 'official' && (
        <div className="official-docs">
          <h2>Official Documents</h2>
          {/* Your existing official documents UI */}
        </div>
      )}

      {activeTab === 'employee' && (
        <div className="employee-docs">
          <h2>Employee Documents</h2>
          {employeeDocs.length > 0 ? (
            employeeDocs.map((employee) => (
              <div key={employee.id} className="employee-item">
                <span>{employee.uid}</span> {/* Use the correct field for UID */}
                <button onClick={() => handleViewFiles(employee)}>View Files</button>
              </div>
            ))
          ) : (
            <p>No employee documents available.</p>
          )}
        </div>
      )}

      {selectedEmployee && employeeFiles.length > 0 && (
        <div className="employee-files">
          <h2>Files for {selectedEmployee.uid}</h2>
          <div className="file-list">
            {employeeFiles.map(file => (
              <div key={file.id} className="file-item">
                <span>{file.name}</span> {/* Adjust as per your file structure */}
                <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

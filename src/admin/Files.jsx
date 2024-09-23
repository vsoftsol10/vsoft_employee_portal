import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import './Files.css';

const Files = () => {
  const [activeTab, setActiveTab] = useState('official');
  const [uploadTab, setUploadTab] = useState('yetToUpload');
  const [officialDocs, setOfficialDocs] = useState([]);
  const [newDoc, setNewDoc] = useState({ filename: '', purpose: '' });
  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleUploadTabChange = (tab) => {
    setUploadTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddDoc = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const storageRef = ref(storage, `official_docs/${newDoc.filename}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(firestore, 'official_documents'), {
        filename: newDoc.filename,
        purpose: newDoc.purpose,
        downloadURL: downloadURL,
        uploadedAt: new Date(),
      });

      alert('Document uploaded successfully');
      setNewDoc({ filename: '', purpose: '' });
      setFile(null);
      fetchOfficialDocs();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    }
  };

  const fetchOfficialDocs = async () => {
    const snapshot = await getDocs(collection(firestore, 'official_documents'));
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOfficialDocs(docs);
  };

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(firestore, 'employees'));
    const employeeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEmployees(employeeList);
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await deleteDoc(doc(firestore, 'official_documents', docId));
      alert('Document deleted successfully');
      fetchOfficialDocs();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document: ' + error.message);
    }
  };

  useEffect(() => {
    fetchOfficialDocs();
    fetchEmployees();
  }, []);

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
          <div className="upload-tabs">
            <button className={uploadTab === 'yetToUpload' ? 'tab-active' : 'tab'} onClick={() => handleUploadTabChange('yetToUpload')}>
              Yet to Upload
            </button>
            <button className={uploadTab === 'alreadyUploaded' ? 'tab-active' : 'tab'} onClick={() => handleUploadTabChange('alreadyUploaded')}>
              Already Uploaded
            </button>
          </div>

          {uploadTab === 'alreadyUploaded' && (
            <div>
              <h3>Already Uploaded</h3>
              {officialDocs.length > 0 ? (
                officialDocs.map((doc) => (
                  <div key={doc.id} className="file-item">
                    <span>{doc.filename}</span>
                    <button onClick={() => handleDeleteDoc(doc.id)}>Delete</button>
                    <a href={doc.downloadURL} target="_blank" rel="noopener noreferrer">Download</a>
                  </div>
                ))
              ) : (
                <p>No official documents uploaded.</p>
              )}
            </div>
          )}

          {uploadTab === 'yetToUpload' && (
            <div>
              <h3>Yet to Upload</h3>
              <input
                type="text"
                name="filename"
                placeholder="Document Name"
                value={newDoc.filename}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="purpose"
                placeholder="Purpose"
                value={newDoc.purpose}
                onChange={handleInputChange}
              />
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleAddDoc}>Upload</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'employee' && (
        <div className="employee-docs">
          <h2>Employee Documents</h2>
          {employees.length > 0 ? (
            employees.map(employee => (
              <div key={employee.id} className="employee-item">
                <span>{employee.uid || employee.name}</span> {/* Adjust as needed */}
                <Link to={`/employee/${employee.id}`} className="view-docs-button">View Docs</Link>
              </div>
            ))
          ) : (
            <p>No employees found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Files;

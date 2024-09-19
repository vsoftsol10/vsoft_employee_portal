import React, { useState } from 'react';
import './Files.css';

const Files = () => {
  const [activeTab, setActiveTab] = useState('official');
  const [officialDocs, setOfficialDocs] = useState([]);
  const [employeeDocs, setEmployeeDocs] = useState([{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]);
  const [newDoc, setNewDoc] = useState({ filename: '', purpose: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoc((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoc = () => {
    if (newDoc.filename && newDoc.purpose) {
      setOfficialDocs((prev) => [...prev, newDoc]);
      setNewDoc({ filename: '', purpose: '' });
    }
  };

  const handleViewFiles = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="files-page" style={{ marginLeft: '250px' }}>
      <h1>Document Management</h1>
      <div className="tabs">
        <button
          className={activeTab === 'official' ? 'tab-active' : 'tab'}
          onClick={() => handleTabChange('official')}
        >
          Official Documents
        </button>
        <button
          className={activeTab === 'employee' ? 'tab-active' : 'tab'}
          onClick={() => handleTabChange('employee')}
        >
          Employee Documents
        </button>
      </div>

      {activeTab === 'official' && (
        <div className="official-docs">
          <h2>Official Documents</h2>
          <div className="add-docs">
            <button className="add-docs-btn" onClick={() => document.getElementById('add-doc-form').style.display = 'block'}>
              + Add Docs
            </button>
            <div id="add-doc-form" className="add-doc-form">
              <input
                type="text"
                name="filename"
                value={newDoc.filename}
                onChange={handleInputChange}
                placeholder="Filename"
              />
              <input
                type="text"
                name="purpose"
                value={newDoc.purpose}
                onChange={handleInputChange}
                placeholder="Purpose"
              />
              <button className="upload-btn" onClick={handleAddDoc}>Upload</button>
            </div>
          </div>
          <div className="doc-list">
            {officialDocs.length > 0 ? (
              officialDocs.map((doc, index) => (
                <div key={index} className="doc-item">
                  <span>{doc.filename} - {doc.purpose}</span>
                </div>
              ))
            ) : (
              <p>No documents available.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'employee' && (
        <div className="employee-docs">
          <h2>Employee Documents</h2>
          {employeeDocs.map((employee) => (
            <div key={employee.id} className="employee-item">
              <span>{employee.name}</span>
              <button onClick={() => handleViewFiles(employee)}>View Files</button>
            </div>
          ))}
        </div>
      )}

      {selectedEmployee && (
        <div className="employee-files">
          <h2>Files for {selectedEmployee.name}</h2>
          {/* Replace this section with the actual implementation of employee-specific file display */}
          <div className="file-list">
            <div className="file-item">
              <span>Example File Name</span>
              <button className="download-btn">Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

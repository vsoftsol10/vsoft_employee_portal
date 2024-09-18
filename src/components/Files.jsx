import React, { useState } from 'react';
import './Files.css'; // Import the CSS file for styling

const Files = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalFiles, setPersonalFiles] = useState([]);
  const [organizationFiles, setOrganizationFiles] = useState([
    { id: 1, name: 'Company Policy.pdf', link: '/path/to/company-policy.pdf' },
    { id: 2, name: 'Employee Handbook.pdf', link: '/path/to/employee-handbook.pdf' },
  ]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFileUpload = (event) => {
    setFileToUpload(event.target.files[0]);
  };

  const handleUpload = () => {
    if (fileToUpload && selectedCategory) {
      setPersonalFiles([...personalFiles, { id: Date.now(), name: fileToUpload.name, category: selectedCategory }]);
      setFileToUpload(null);
      setSelectedCategory('');
    }
  };

  return (
    <div className="files">
      <div className="tabs">
        <button
          className={activeTab === 'personal' ? 'active' : ''}
          onClick={() => handleTabChange('personal')}
        >
          Personal
        </button>
        <button
          className={activeTab === 'organization' ? 'active' : ''}
          onClick={() => handleTabChange('organization')}
        >
          Organization
        </button>
      </div>

      {activeTab === 'personal' && (
        <div className="personal-section">
          <div className="upload-section">
            <div className="category-selection">
              <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
                <option value="">Select Category</option>
                <option value="Aadhar">Aadhar</option>
                <option value="PAN Card">PAN Card</option>
                <option value="License">License</option>
                <option value="Bank Passbook">Bank Passbook</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="Resume">Resume</option>
              </select>
            </div>
            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleUpload}>Upload</button>
          </div>
          <div className="file-list">
            {personalFiles.map((file) => (
              <div key={file.id} className="file-item">
                <span>{file.category}: {file.name}</span>
                <button>View</button>
                <button>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'organization' && (
        <div className="organization-section">
          <h2>Organization Files</h2>
          <div className="file-list">
            {organizationFiles.map((file) => (
              <div key={file.id} className="file-item">
                <span>{file.name}</span>
                <a href={file.link} download>Download</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

import React, { useState, useEffect } from 'react';
import './Files.css'; // Import the CSS file for styling
import { firestore, storage, auth } from '../firebaseConfig'; // Adjust the path to your firebaseConfig file
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Storage methods
import { onAuthStateChanged } from 'firebase/auth';

const Files = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalFiles, setPersonalFiles] = useState([]);
  const [organizationFiles] = useState([
    { id: 1, name: 'Company Policy.pdf', link: '/path/to/company-policy.pdf' },
    { id: 2, name: 'Employee Handbook.pdf', link: '/path/to/employee-handbook.pdf' },
  ]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uid, setUid] = useState(null); // For storing the authenticated user ID

  // Handle tab change (Personal or Organization)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle file selection
  const handleFileUpload = (event) => {
    setFileToUpload(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (fileToUpload && selectedCategory && uid) {
      try {
        // Step 1: Upload the file to Firebase Storage under the user's folder
        const storageRef = ref(storage, `oftenusers/${uid}/${selectedCategory}/${fileToUpload.name}`);
        
        // Check permissions
        console.log('Uploading to:', storageRef.fullPath);
  
        const snapshot = await uploadBytes(storageRef, fileToUpload);
  
        // Step 2: Get the download URL of the uploaded file
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Step 3: Store file metadata in Firestore under the user's sub-collection
        const fileDoc = doc(collection(firestore, 'oftenusers', uid, 'files'));
        await setDoc(fileDoc, {
          name: fileToUpload.name,
          category: selectedCategory,
          url: downloadURL,
          uploadedAt: new Date(),
        });
  
        // Update the local state with the new file
        setPersonalFiles([...personalFiles, {
          id: fileDoc.id,
          name: fileToUpload.name,
          category: selectedCategory,
          url: downloadURL,
        }]);
  
        // Clear form fields after uploading
        setFileToUpload(null);
        setSelectedCategory('');
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error.message);
        alert(`Error uploading file: ${error.message}`);
      }
    } else {
      alert('Please select a file and category.');
    }
  };
  ;
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);  // Setting user id after successful login
      } else {
        setUid(null);  // Handle user not authenticated
      }
    });
  
    return () => unsubscribe();
  }, []);
  
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

      {/* Personal Files Upload and Display */}
      {activeTab === 'personal' && (
        <div className="personal-section">
          <div className="upload-section">
            <div className="category-selection">
              <select
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
              >
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
                <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                <button>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Files Display */}
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

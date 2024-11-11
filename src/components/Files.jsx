import React, { useState, useEffect } from 'react';
import './Files.css';
import { firestore, storage, auth } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

const Files = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [organizationFiles, setOrganizationFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uid, setUid] = useState(null);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle file selection
  const handleFileUpload = (event) => {
    setFileToUpload(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (fileToUpload && selectedCategory && uid) {
      try {
        const storageRef = ref(storage, `oftenusers/${uid}/${selectedCategory}/${fileToUpload.name}`);
        const snapshot = await uploadBytes(storageRef, fileToUpload);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Create subcollection for each user
        const fileDocRef = doc(collection(firestore, `employeefiles/${uid}/files`), fileToUpload.name);
        await setDoc(fileDocRef, {
          name: fileToUpload.name,
          url: downloadURL,
          uploadedAt: new Date(),
          category: selectedCategory,
        });

        // Update local state with the new file
        setUploadedFiles((prev) => [...prev, {
          id: fileToUpload.name,
          name: fileToUpload.name,
          url: downloadURL,
          category: selectedCategory,
        }]);

        // Clear fields
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        fetchUploadedFiles(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch uploaded files from Firestore
  const fetchUploadedFiles = async (userId) => {
    const filesSnapshot = await getDocs(collection(firestore, `employeefiles/${userId}/files`));
    const files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUploadedFiles(files);
  };

  // Fetch organization files
  const fetchOrganizationFiles = async () => {
    const snapshot = await getDocs(collection(firestore, 'official_documents'));
    const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrganizationFiles(files);
  };

  useEffect(() => {
    if (activeTab === 'organization') {
      fetchOrganizationFiles();
    }
  }, [activeTab]);

  return (
    <div className="files-user">
      <div className="tabs-files">
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

      {/* Personal Files Section */}
      {activeTab === 'personal' && (
        <div className="files-personal-section">
          <div className="files-category-selection">
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

          {/* Uploaded Files List */}
          <div className="file-list-user">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item">
                <span>{file.name}</span>
                <a href={file.url} target="_blank" rel="noopener noreferrer">View</a>
                <button>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Files Section */}
      {activeTab === 'organization' && (
        <div className="files-organization-section">
          <h2>Organization Files</h2>
          <div className="file-list">
            {organizationFiles.map((file) => (
              <div key={file.id} className="file-item">
                <span>{file.filename} - {file.purpose}</span>
                <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">Download</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;

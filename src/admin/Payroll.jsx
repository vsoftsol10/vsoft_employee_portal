import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, uploadString, getDownloadURL } from 'firebase/storage'; // Firebase Storage imports
import { doc, collection, addDoc, Timestamp } from 'firebase/firestore'; // Firestore imports
import { firestore, storage } from '../firebaseConfig'; // Import Firestore and Storage from your Firebase config
import './Payroll.css'; // Import the CSS file for styling

const Payroll = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Function to convert the file to a Base64 string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert('Please select a file first!');
      return;
    }

    setUploading(true);

    try {
      // Convert the file to Base64
      const base64File = await convertToBase64(pdfFile);

      // Get the current user's ID from Firebase Authentication
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('No user is logged in.');
        return;
      }
      const userId = user.uid; // Use the authenticated user's ID

      // Uploading data to Firebase Storage
      const storageRef = ref(storage, `payslips/${userId}/${pdfFile.name}`);
      await uploadString(storageRef, base64File, 'data_url');

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // Uploading metadata to Firestore
      const payslipData = {
        fileURL: downloadURL, // URL to the file in Firebase Storage
        createdAt: Timestamp.now(), // Firestore timestamp
        employeeId: userId, // Use the authenticated user's ID
      };

      // Reference to Firestore collection
      const docRef = doc(firestore, 'payrollData', userId); // Add document under 'payrollData'
      const payslipsRef = collection(docRef, 'payslips'); // Subcollection 'payslips'
      await addDoc(payslipsRef, payslipData);

      // Success message
      alert('Payslip uploaded successfully!');
    } catch (error) {
      console.error('Error uploading payslip:', error);
      alert('Error uploading payslip.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="payroll">
      <h2>Upload Payslip</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default Payroll;


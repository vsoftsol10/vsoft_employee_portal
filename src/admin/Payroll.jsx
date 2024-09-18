import React, { useState } from 'react';
import { collection, addDoc, doc, Timestamp } from 'firebase/firestore'; // Add Timestamp here
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import { firestore } from '../firebaseConfig'; // Firebase config
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
      const documentId = user.uid; // Use the authenticated user's ID

      // Uploading data to Firestore
      const payslipData = {
        file: base64File, // Base64 encoded PDF file
        createdAt: Timestamp.now(), // Firestore timestamp
        employeeId: documentId, // Use the authenticated user's ID
      };

      // Reference to Firestore collection (with odd number of segments)
      const docRef = doc(firestore, 'payrollData', documentId); // Add document under 'payrollData'
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

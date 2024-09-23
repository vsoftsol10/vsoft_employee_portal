import React, { useEffect, useState } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import './Files.css';

const EmployeeDocs = ({ employeeId }) => {
  const [docs, setDocs] = useState([]);

  const fetchEmployeeDocs = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, `employees/${employeeId}/docs`));
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocs(documents);
    } catch (error) {
      console.error('Error fetching employee documents:', error);
    }
  };

  useEffect(() => {
    fetchEmployeeDocs();
  }, [employeeId]);

  return (
    <div>
      <h2>Documents for Employee ID: {employeeId}</h2>
      {docs.length > 0 ? (
        docs.map(doc => (
          <div key={doc.id}>
            <span>{doc.filename}</span>
            <a href={doc.downloadURL} target="_blank" rel="noopener noreferrer">Download</a>
          </div>
        ))
      ) : (
        <p>No documents found for this employee.</p>
      )}
    </div>
  );
};

export default EmployeeDocs;

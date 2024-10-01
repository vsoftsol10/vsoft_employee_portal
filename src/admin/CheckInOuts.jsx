// CheckInOuts.jsx
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './CheckInOuts.css'; // Change CSS filename accordingly

const CheckInOuts = () => {
  const { uid } = useParams(); // Get the UID from the URL
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch check-in and check-out records
        const recordsSnapshot = await getDocs(collection(firestore, `checkinouts/${uid}/records`));
        const recordsList = recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(recordsList);
      } catch (error) {
        console.error("Error fetching records: ", error);
      }
    };

    fetchRecords();
  }, [uid]);

  return (
    <div className="checkinouts">
      <h2>Check-In/Out Records</h2>
      <h3>Records:</h3>
      <div className="records-list">
        {records.map(record => (
          <div className="record" key={record.id}>
            <p><strong>Type:</strong> {record.type}</p>
            <p><strong>Duration:</strong> {record.duration || 'N/A'}</p>
            <p><strong>Timestamp:</strong> {new Date(record.timestamp?.toDate()).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckInOuts;

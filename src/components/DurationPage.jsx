// DurationPage.jsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig'; // Ensure you import auth from your firebase config
import { onAuthStateChanged } from 'firebase/auth';

const DurationPage = () => {
  const [duration, setDuration] = useState(''); // To store the duration from check-outs
  const [checkOut, setCheckOut] = useState(''); // To store yourCheckOuts timestamp
  const [checkIn, setCheckIn] = useState(''); // To store yourCheckIn timestamp
  const [user, setUser] = useState(null); // To store the authenticated user

  useEffect(() => {
    // Check user authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the authenticated user
        fetchData(currentUser.uid); // Pass user ID to fetch data
      } else {
        console.log('No user is signed in.');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const fetchData = async (userId) => {
    const checkOutDocRef = doc(firestore, 'check-outs', userId); // Adjust document reference if needed
    const checkInDocRef = doc(firestore, 'check-ins', userId); // Adjust document reference if needed

    try {
      // Fetch check-out data
      const checkOutDoc = await getDoc(checkOutDocRef);
      if (checkOutDoc.exists()) {
        console.log('Check-out data:', checkOutDoc.data()); // Debug log
        setDuration(checkOutDoc.data().duration || '00:00:00');
        setCheckOut(checkOutDoc.data().yourCheckOuts || null); // Adjusted field name
      } else {
        console.log('No such document in check-outs!');
      }

      // Fetch check-in data
      const checkInDoc = await getDoc(checkInDocRef);
      if (checkInDoc.exists()) {
        console.log('Check-in data:', checkInDoc.data()); // Debug log
        const data = checkInDoc.data();
        setCheckIn(data.yourCheckIn || null); // Adjusted field name
      } else {
        console.log('No such document in check-ins!');
      }
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  // Helper function to format time without the date
  const formatTime = (timestamp) => {
    if (timestamp) {
      // Convert Firestore timestamp to a Date object if it's a valid timestamp
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
      return isNaN(date.getTime()) ? 'Invalid time' : date.toLocaleTimeString(); // Returns only the time
    }
    return 'No data available';
  };

  return (
    <div>
      <h1>Duration Information</h1>
      {user ? ( // Conditional rendering based on user authentication
        <>
          <p><strong>Duration:</strong> {duration}</p>
          <p><strong>Your Check-Outs:</strong> {formatTime(checkOut)}</p> {/* Updated function call */}
          <p><strong>Your Check-Ins:</strong> {formatTime(checkIn)}</p> {/* Updated function call */}
        </>
      ) : (
        <p>Please sign in to view your data.</p>
      )}
    </div>
  );
};

export default DurationPage;

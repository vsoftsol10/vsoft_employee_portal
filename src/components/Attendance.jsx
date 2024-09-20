import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Attendance.css';
import { getFirestore, collection, getDocs, setDoc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth'; 

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) return;
    
      const db = getFirestore();
      try {
        const checkInSnapshot = await getDocs(collection(db, `oftenusers/${userId}/checkins`));
        const checkOutSnapshot = await getDocs(collection(db, `oftenusers/${userId}/checkouts`));
        
        let eventList = [];
        let checkinMap = new Map();
    
        // Fetch and store check-in times
        checkInSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.timestamp) {
            const checkInTime = new Date(data.timestamp.seconds * 1000); 
            const checkInDate = checkInTime.toLocaleDateString('en-GB');
            checkinMap.set(checkInDate, checkInTime);
          }
        });
    
        const eventPromises = []; // Array to hold promises
    
        // Fetch checkout times, match them with check-ins, and calculate duration
        checkOutSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.timestamp) {
            const checkOutTime = new Date(data.timestamp.seconds * 1000);
            const checkOutDate = checkOutTime.toLocaleDateString('en-GB');
    
            if (checkinMap.has(checkOutDate)) {
              const checkInTime = checkinMap.get(checkOutDate);
              const totalDuration = (checkOutTime - checkInTime) / (1000 * 60 * 60); // in hours
    
              // Set a threshold for duration to consider a user present (e.g., 1 hour)
              const durationThreshold = 1; // in hours
              
              // Determine if present based on duration
              const isPresent = totalDuration >= durationThreshold;
    
              eventList.push({
                id: doc.id,
                date: checkOutDate,
                duration: totalDuration,
                isPresent,
              });
    
              // Add to promises array for Firestore persistence
              eventPromises.push(
                setDoc(doc(db, `oftenusers/${userId}/events`, checkOutDate), {
                  date: checkOutDate,
                  duration: totalDuration,
                  isPresent,
                })
              );
            }
          }
        });
    
        // Wait for all Firestore writes to complete
        await Promise.all(eventPromises);
    
        setEvents(eventList);
      } catch (error) {
        console.error('Error fetching events: ', error);
      }
    };
    
    fetchEvents();
  }, [userId]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const renderDayContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-GB');
    const event = events.find((e) => e.date === formattedDate);

    if (event) {
      return (
        <div
          className={`day-content ${event.isPresent ? 'green-day' : 'red-day'}`}
          title={`Duration: ${event.duration.toFixed(2)} hours`}
        >
          {event.isPresent ? '✅ Present' : '❌ Absent'}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="attendance-page">
      <h1>Attendance Calendar</h1>
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileContent={({ date }) => renderDayContent({ date })}
        className="calendar"
      />
    </div>
  );
};

export default Attendance;

import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import DatePicker from 'react-datepicker';
import 'react-calendar/dist/Calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './Attendance.css';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore'; // Firebase imports
import { getAuth } from 'firebase/auth'; // Firebase authentication import

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [holidays, setHolidays] = useState([]); // State for holidays

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
        const querySnapshot = await getDocs(collection(db, `oftenusers/${userId}/events`)); // Adjust path based on user ID
        let eventList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.checkInTime && data.checkOutTime) {
            const checkInTime = new Date(data.checkInTime.seconds * 1000); 
            const checkOutTime = new Date(data.checkOutTime.seconds * 1000);

            const localDate = checkInTime.toLocaleDateString('en-GB');

            const totalDuration = (checkOutTime - checkInTime) / (1000 * 60 * 60);

            eventList.push({
              id: doc.id,
              date: localDate,
              duration: totalDuration,
            });
          }
        });
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
    fetchEvents();
  }, [userId]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const db = getFirestore();
      try {
        const querySnapshot = await getDocs(collection(db, 'holidays')); // Adjust path if needed
        let holidayList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const holidayDate = new Date(data.date.seconds * 1000).toLocaleDateString('en-GB');
          holidayList.push(holidayDate);
        });
        setHolidays(holidayList);
      } catch (error) {
        console.error("Error fetching holidays: ", error);
      }
    };
    fetchHolidays();
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddEvent = async () => {
    if (!userId) return;

    const db = getFirestore();
    try {
      const formattedDate = date.toLocaleDateString('en-GB');
      const checkInTime = new Date();
      const checkOutTime = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000);

      await setDoc(doc(db, `oftenusers/${userId}/events`, eventTitle), {
        title: eventTitle,
        checkInTime: { seconds: Math.floor(checkInTime.getTime() / 1000) }, // Store check-in time in Firestore timestamp format
        checkOutTime: { seconds: Math.floor(checkOutTime.getTime() / 1000) }, // Store check-out time in Firestore timestamp format
        date: formattedDate,
      });
      setToastMessage('Event added successfully');
      setToastOpen(true);
      setEvents([...events, { id: eventTitle, date: formattedDate, duration: 8 }]);
    } catch (error) {
      setToastMessage('Error adding event: ' + error.message);
      setToastOpen(true);
    }
    setEventTitle('');
  };

  const handleToastClose = () => setToastOpen(false);

  const renderDayContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-GB');
    const event = events.find((e) => e.date === formattedDate);
    const isHoliday = holidays.includes(formattedDate);

    if (event) {
      const isOverTime = event.duration >= 8.5;
      return (
        <div
          className={`day-content ${isOverTime ? 'green-day' : 'red-day'}`}
          title={`Duration: ${event.duration.toFixed(2)} hours`}
        >
          {isOverTime ? '✅' : '❌'}
        </div>
      );
    } else if (isHoliday) {
      return (
        <div
          className="day-content red-day"
          title="Holiday"
        >
          🏆
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
      <div className="event-manager">
        <h2>Add Event</h2>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          className="datepicker"
        />
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Event Title"
        />
        <button onClick={handleAddEvent}>Add Event</button>
      </div>
      {isToastOpen && <div className="toast">{toastMessage}</div>}
    </div>
  );
};

export default Attendance;

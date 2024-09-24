import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import DatePicker from 'react-datepicker';
import 'react-calendar/dist/Calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './NonAttendance.css';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore'; // Firebase imports

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'attendance')); // Assuming 'attendance' collection
      let eventList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.checkInTime && data.checkOutTime) {
          // Convert Firestore timestamps to JavaScript Date objects
          const checkInTime = new Date(data.checkInTime.seconds * 1000); 
          const checkOutTime = new Date(data.checkOutTime.seconds * 1000);

          // Format the date to the local time zone (only the date part)
          const localDate = checkInTime.toLocaleDateString('en-GB'); // Format for the correct date without time

          const totalDuration = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Total duration in hours

          eventList.push({
            id: doc.id,
            date: localDate, // Store the formatted local date
            duration: totalDuration,
          });
        }
      });
      setEvents(eventList);
    };
    fetchEvents();
  }, []);
  
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddEvent = async () => {
    const db = getFirestore();
    try {
      const formattedDate = date.toLocaleDateString('en-GB'); // Format date before saving
      const checkInTime = new Date(); // Capture check-in time as now
      const checkOutTime = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000); // Example check-out time 8 hours later

      await setDoc(doc(db, 'attendance', eventTitle), {
        title: eventTitle,
        checkInTime: checkInTime, // Store check-in time in UTC
        checkOutTime: checkOutTime, // Store check-out time in UTC
        date: formattedDate, // Store formatted local date
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
    const formattedDate = date.toLocaleDateString('en-GB'); // Format to local time zone
    const event = events.find((e) => e.date === formattedDate);

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

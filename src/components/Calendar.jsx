import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [today, setToday] = useState(new Date());
  const [activeDay, setActiveDay] = useState(null);
  const [eventsArr, setEventsArr] = useState([]);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [showAttendance, setShowAttendance] = useState(false);
  const [days, setDays] = useState([]);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [checkInDuration, setCheckInDuration] = useState('00:00:00');
  const [checkOutDuration, setCheckOutDuration] = useState('00:00:00');
  const [intervalId, setIntervalId] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    getEvents();
    initCalendar();
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [month, year]);

  useEffect(() => {
    if (checkInTime && !checkOutTime) {
      const id = setInterval(updateCheckInDuration, 1000);
      setIntervalId(id);
      return () => clearInterval(id); // Cleanup interval on unmount
    } else if (intervalId) {
      clearInterval(intervalId); // Stop interval if checkInTime or checkOutTime is not present
    }
  }, [checkInTime, checkOutTime]);

  const updateCheckInDuration = () => {
    const now = new Date();
    const duration = new Date(now - checkInTime);
    const hours = String(duration.getUTCHours()).padStart(2, '0');
    const minutes = String(duration.getUTCMinutes()).padStart(2, '0');
    const seconds = String(duration.getUTCSeconds()).padStart(2, '0');
    setCheckInDuration(`${hours}:${minutes}:${seconds}`);
  };

  const updateCheckOutDuration = () => {
    if (checkOutTime) {
      const duration = new Date(checkOutTime - checkInTime);
      const hours = String(duration.getUTCHours()).padStart(2, '0');
      const minutes = String(duration.getUTCMinutes()).padStart(2, '0');
      const seconds = String(duration.getUTCSeconds()).padStart(2, '0');
      setCheckOutDuration(`${hours}:${minutes}:${seconds}`);
    }
  };

  const getEvents = () => {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    setEventsArr(events);
  };

  const saveEvents = (events) => {
    localStorage.setItem('events', JSON.stringify(events));
  };

  const clearEvents = () => {
    localStorage.removeItem('events');
    setEventsArr([]);
  };

  const initCalendar = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const endDay = lastDay.getDay();

    const daysArray = [];

    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    for (let i = endDay + 1; i <= 6; i++) {
      daysArray.push(null);
    }

    setDays(daysArray);
  };

  const handleDayClick = (day) => {
    if (day) {
      setActiveDay(day);
    }
  };

  const handleGotoToday = () => {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
  };

  const handleCheckIn = () => {
    if (!checkInTime) { // Start timer only if not already checked in
      const now = new Date();
      setCheckInTime(now);
      const checkInEvent = {
        title: 'Check-In',
        time: now.toLocaleTimeString(),
        date: today.toLocaleDateString(),
        checkInTime: now.toISOString(),
      };
      const updatedEvents = [...eventsArr, checkInEvent];
      setEventsArr(updatedEvents);
      saveEvents(updatedEvents);
    }
  };

  const handleCheckOut = () => {
    if (checkInTime && !checkOutTime) { // Stop timer only if checked in and not yet checked out
      const now = new Date();
      setCheckOutTime(now);
      updateCheckOutDuration(); // Update duration immediately on check-out
      const checkOutEvent = {
        title: 'Check-Out',
        time: now.toLocaleTimeString(),
        date: today.toLocaleDateString(),
        checkOutTime: now.toISOString(),
      };
      const updatedEvents = [...eventsArr, checkOutEvent];
      setEventsArr(updatedEvents);
      saveEvents(updatedEvents);
    }
  };

  const handleAddEvent = (title, time) => {
    const newEvent = {
      title: title || 'Event',
      time: time || new Date().toLocaleTimeString(),
      date: today.toLocaleDateString()
    };
    const updatedEvents = [...eventsArr, newEvent];
    setEventsArr(updatedEvents);
    saveEvents(updatedEvents);
    setShowAttendance(false);
  };

  return (
    <div className="container">
      <div className="calendar">
        <div className="month">
          <button className="arrow-btn prev" onClick={() => setMonth(month - 1)}>◀</button>
          <span>{months[month]} {year}</span>
          <button className="arrow-btn next" onClick={() => setMonth(month + 1)}>▶</button>
        </div>
        <div className="weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="days">
          {days.map((day, index) => (
            <div
              key={index}
              className={`day ${
                day === activeDay ? 'active' : ''
              } ${day && new Date(year, month, day).toDateString() === today.toDateString() ? 'blink' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="goto-today">
          <div className="goto">
            <input type="text" value={`${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`} readOnly />
            <button onClick={handleGotoToday}>Today</button>
          </div>
        </div>
      </div>
      <div className="events">
        {eventsArr.length > 0 ? eventsArr.map((event, index) => (
          <div key={index} className="event">
            <div className="title">
              <i className="icon">📅</i>
              <span className="event-title">{event.title}</span>
              <span className="event-time">{event.time}</span>
            </div>
            {event.checkInTime && <div className="event-details">Check-In: {new Date(event.checkInTime).toLocaleString()}</div>}
            {event.checkOutTime && <div className="event-details">Check-Out: {new Date(event.checkOutTime).toLocaleString()}</div>}
          </div>
        )) : (
          <div className="no-event">No Events</div>
        )}
        <div className="add-event" onClick={() => setShowAttendance(!showAttendance)}>
          +
        </div>
        <div className={`add-event-wrapper ${showAttendance ? 'active' : ''}`}>
          <div className="add-event-header">
            <span className="title">Add Event</span>
            <span className="close" onClick={() => setShowAttendance(false)}>×</span>
          </div>
          <div className="add-event-body">
            <div className="add-event-input">
              <input type="text" placeholder="Event Title" id="event-title" />
            </div>
            <div className="add-event-input">
              <input type="text" placeholder="Event Time" id="event-time" />
            </div>
          </div>
          <div className="add-event-footer">
            <button className="add-event-btn" onClick={() => handleAddEvent(document.getElementById('event-title').value, document.getElementById('event-time').value)}>Add Event</button>
          </div>
        </div>
      </div>
      <div className="time-tracking">
        <div className="tracking-header">
          <h3>Time Tracking</h3>
          <button className="btn-clear" onClick={clearEvents}>Clear Events</button>
        </div>
        <div className="tracking-body">
          <button className="btn-checkin" onClick={handleCheckIn} disabled={checkInTime}>Check In</button>
          <button className="btn-checkout" onClick={handleCheckOut} disabled={!checkInTime || checkOutTime}>Check Out</button>
          <div className="checkin-duration">Check-In Duration: {checkInDuration}</div>
          <div className="checkout-duration">Check-Out Duration: {checkOutDuration}</div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;


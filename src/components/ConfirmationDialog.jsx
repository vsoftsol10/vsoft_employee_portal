import React, { useState, useEffect } from 'react';
import './Calendar.css';
import Modal from './Modal'; // Custom modal component

const Calendar = () => {
  // State declarations...

  const [showConfirm, setShowConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const handleDeleteEvent = (e) => {
    if (e.target.classList.contains('event')) {
      setEventToDelete(e.target.querySelector('.event-title').textContent);
      setShowConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setEventsArr(prevEventsArr => {
        const updatedEvents = prevEventsArr.map(event => {
          if (event.day === activeDay && event.month === month + 1 && event.year === year) {
            return {
              ...event,
              events: event.events.filter(ev => ev.title !== eventToDelete),
            };
          }
          return event;
        }).filter(event => event.events.length > 0);
        saveEvents();
        return updatedEvents;
      });
      updateEvents(activeDay);
      setShowConfirm(false);
      setEventToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setEventToDelete(null);
  };

  return (
    <div className="calendar">
      {/* Calendar Header */}
      <div className="days">{days}</div>
      <div className="event-details">
        {/* Event Details */}
      </div>
      {showAddEvent && (
        <div className="add-event-form">
          {/* Add Event Form */}
        </div>
      )}
      {showConfirm && (
        <Modal>
          <p>Are you sure you want to delete this event?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;

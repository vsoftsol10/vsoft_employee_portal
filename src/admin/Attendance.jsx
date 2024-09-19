import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import DatePicker from 'react-datepicker';
import 'react-calendar/dist/Calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './Attendance.css';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchEmployeeList = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'employees'));
      let employees = [];
      querySnapshot.forEach((doc) => {
        employees.push({ id: doc.id, name: doc.data().name });
      });
      setEmployeeList(employees);
    };
    fetchEmployeeList();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      const fetchEvents = async () => {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, `employees/${selectedEmployee.id}/attendance`));
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
      };
      fetchEvents();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    const fetchHolidays = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'holidays'));
      let holidayList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const holidayDate = new Date(data.date.seconds * 1000).toLocaleDateString('en-GB');
        holidayList.push(holidayDate);
      });
      setHolidays(holidayList);
    };
    fetchHolidays();
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAddEvent = async () => {
    if (!selectedEmployee) return;

    const db = getFirestore();
    try {
      const formattedDate = date.toLocaleDateString('en-GB');
      const checkInTime = new Date();
      const checkOutTime = new Date(checkInTime.getTime() + 8 * 60 * 60 * 1000);

      await setDoc(doc(db, `employees/${selectedEmployee.id}/attendance`, eventTitle), {
        title: eventTitle,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
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

  const handleCalculatePayroll = () => {
    if (!selectedEmployee) return;

    // Redirect to the Payroll page with selectedEmployee ID
    window.location.href = `/admin/payroll?employeeId=${selectedEmployee.id}`;
  };

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
      <h1>Employee Attendance</h1>
      {selectedEmployee ? (
        <>
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
            <button onClick={handleCalculatePayroll}>Calculate Payroll</button>
          </div>
        </>
      ) : (
        <div className="employee-list">
          {employeeList.map((employee) => (
            <div key={employee.id} className="employee-item">
              <span>{employee.name}</span>
              <button onClick={() => setSelectedEmployee(employee)}>View Attendance</button>
            </div>
          ))}
        </div>
      )}
      {isToastOpen && <div className="toast">{toastMessage}</div>}
    </div>
  );
};

export default Attendance;

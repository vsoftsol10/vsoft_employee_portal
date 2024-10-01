import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Attendance.css';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { useNavigate, useLocation } from 'react-router-dom';

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [attendanceType, setAttendanceType] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [checkInStart, setCheckInStart] = useState('');
  const [checkInEnd, setCheckInEnd] = useState('');
  const [checkOutStart, setCheckOutStart] = useState('');
  const [checkOutEnd, setCheckOutEnd] = useState('');
  const [yourCheckIn, setYourCheckIn] = useState('');
  const [yourCheckOut, setYourCheckOut] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchEmployeeList = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employees = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setEmployeeList(employees);
    };
    fetchEmployeeList();

    // Check if employee is already selected from URL
    const queryParams = new URLSearchParams(location.search);
    const employeeId = queryParams.get('employeeId');
    if (employeeId) {
      const selected = employeeList.find(emp => emp.id === employeeId);
      if (selected) {
        setSelectedEmployee(selected);
      }
    }
  }, [location.search, employeeList]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEvents();
    }
  }, [selectedEmployee, date]);

  const fetchEvents = async () => {
    const db = getFirestore();
    const attendanceRef = collection(db, `adminattendance/${selectedEmployee.id}/attendance`);
    const querySnapshot = await getDocs(attendanceRef);

    const eventList = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, type: data.type, date: data.date };
    });

    setEvents(eventList);
  };

  const fetchImages = async () => {
    setLoadingImages(true);
    const storage = getStorage();
    const imagesRef = ref(storage, `employeeImages/${selectedEmployee.id}`);

    try {
      const result = await listAll(imagesRef);
      const urls = await Promise.all(result.items.map(item => getDownloadURL(item)));
      setImages(urls);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedEmployee || !attendanceType) return;

    const db = getFirestore();
    const formattedDate = date.toLocaleDateString('en-GB');

    try {
      await setDoc(doc(db, `adminattendance/${selectedEmployee.id}/attendance`, formattedDate), {
        type: attendanceType,
        date: formattedDate,
        checkInStart,
        checkInEnd,
        checkOutStart,
        checkOutEnd,
        yourCheckIn,
        yourCheckOut,
      });
      setToastMessage('Attendance marked successfully');
      setToastOpen(true);
      setEvents(prevEvents => [...prevEvents, { date: formattedDate, type: attendanceType }]);
    } catch (error) {
      setToastMessage('Error marking attendance: ' + error.message);
      setToastOpen(true);
    }
    setAttendanceType('');
    setCheckInStart('');
    setCheckInEnd('');
    setCheckOutStart('');
    setCheckOutEnd('');
    setYourCheckIn('');
    setYourCheckOut('');
  };

  const handleLeaveSubmit = async () => {
    if (!selectedEmployee || !leaveType) return;

    const db = getFirestore();
    const formattedDate = date.toLocaleDateString('en-GB');

    try {
      await setDoc(doc(db, `adminattendance/${selectedEmployee.id}/leaves`, formattedDate), {
        type: leaveType,
        date: formattedDate,
      });
      setToastMessage('Leave marked successfully');
      setToastOpen(true);
    } catch (error) {
      setToastMessage('Error marking leave: ' + error.message);
      setToastOpen(true);
    }
    setLeaveType('');
  };

  const renderDayContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-GB');
    const event = events.find(e => e.date === formattedDate);

    if (event) {
      if (event.type === 'Present') return <div className="day-content green-day" title="Present">✅</div>;
      if (event.type === 'Absent') return <div className="day-content red-day" title="Absent">❌</div>;
      if (event.type === 'Sick Leave') return <div className="day-content blue-day" title="Sick Leave">🏥</div>;
      if (event.type === 'Casual Leave') return <div className="day-content orange-day" title="Casual Leave">🎉</div>;
      if (event.type === 'LOP') return <div className="day-content grey-day" title="LOP">🚫</div>;
    }
    return null;
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    navigate(`/attendance?employeeId=${employee.id}`);
  };

  return (
    <div className="attendance-page">
      <h1>Employee Attendance</h1>
      {selectedEmployee ? (
        <>
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileContent={renderDayContent}
            className="calendar"
          />

          <div className="event-manager">
            <h2>Mark Attendance</h2>
            <select
              value={attendanceType}
              onChange={(e) => setAttendanceType(e.target.value)}
            >
              <option value="">Select Attendance</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            <input 
              type="time" 
              value={checkInStart} 
              onChange={(e) => setCheckInStart(e.target.value)} 
              placeholder="Check-In Start" 
            />
            <input 
              type="time" 
              value={checkInEnd} 
              onChange={(e) => setCheckInEnd(e.target.value)} 
              placeholder="Check-In End" 
            />
            <input 
              type="time" 
              value={checkOutStart} 
              onChange={(e) => setCheckOutStart(e.target.value)} 
              placeholder="Check-Out Start" 
            />
            <input 
              type="time" 
              value={checkOutEnd} 
              onChange={(e) => setCheckOutEnd(e.target.value)} 
              placeholder="Check-Out End" 
            />
            <input 
              type="text" 
              value={yourCheckIn} 
              onChange={(e) => setYourCheckIn(e.target.value)} 
              placeholder="Your Check-In" 
            />
            <input 
              type="text" 
              value={yourCheckOut} 
              onChange={(e) => setYourCheckOut(e.target.value)} 
              placeholder="Your Check-Out" 
            />
            <button onClick={handleAttendanceSubmit}>Submit Attendance</button>
          </div>

          <div className="event-manager">
            <h2>Mark Leave</h2>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="">Select Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="LOP">Leave Without Pay</option>
            </select>
            <button onClick={handleLeaveSubmit}>Submit Leave</button>
          </div>

          {/* Image viewing section */}
          <div className="employee-images">
            <h2>Employee Images</h2>
            <button onClick={fetchImages}>View Images</button>
            {loadingImages ? (
              <p>Loading images...</p>
            ) : images.length > 0 ? (
              <div className="image-grid">
                {images.map((url, index) => (
                  <img key={index} src={url} alt={`Employee ${index + 1}`} />
                ))}
              </div>
            ) : (
              <p>No images found.</p>
            )}
         

          </div>
        </>
      ) : (
        <div className="employee-selection">
          <h2>Select an Employee</h2>
          <ul>
            {employeeList.map(employee => (
              <li key={employee.id} onClick={() => handleEmployeeClick(employee)}>
                {employee.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isToastOpen && (
        <div className="toast-message">
          {toastMessage}
          <button onClick={() => setToastOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Attendance;

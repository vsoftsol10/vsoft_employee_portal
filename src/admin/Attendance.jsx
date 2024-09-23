import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Attendance.css';
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null); // "present" or "absent"
  const [toastMessage, setToastMessage] = useState('');
  const [isToastOpen, setToastOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // To store attendance statuses

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

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!selectedEmployee) return;
      const db = getFirestore();
      const attendanceRef = doc(db, `employees/${selectedEmployee.id}/attendance`);
      const attendanceSnap = await getDoc(attendanceRef);
      if (attendanceSnap.exists()) {
        setAttendanceRecords(attendanceSnap.data());
      }
    };
    fetchAttendanceRecords();
  }, [selectedEmployee]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleCheckIn = async () => {
    if (!selectedEmployee) return;
  
    const db = getFirestore();
    const checkInTime = new Date();
  
    await setDoc(doc(db, `employees/${selectedEmployee.id}/attendance`, date.toLocaleDateString()), {
      checkInTime: checkInTime.toTimeString().slice(0, 5),
      checkOutTime: null,
      date: date.toLocaleDateString(),
      status: 'pending'
    });
  
    setToastMessage('Checked in successfully');
    setToastOpen(true);
  };
  
  const handleCheckOut = async () => {
    if (!selectedEmployee) return;
  
    const db = getFirestore();
    const checkOutTime = new Date();
  
    await setDoc(doc(db, `employees/${selectedEmployee.id}/attendance`, date.toLocaleDateString()), {
      checkOutTime: checkOutTime.toTimeString().slice(0, 5),
    }, { merge: true });
  
    const docRef = doc(db, `employees/${selectedEmployee.id}/attendance`, date.toLocaleDateString());
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const checkInTime = data.checkInTime;
  
      if (checkInTime) {
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const checkInDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHours, checkInMinutes);
  
        const totalDuration = (checkOutTime - checkInDate) / (1000 * 60 * 60);
        const requiredDuration = 8;
  
        const status = totalDuration >= requiredDuration ? 'present' : 'absent';
        await setDoc(doc(db, `employees/${selectedEmployee.id}/attendance`, date.toLocaleDateString()), { status }, { merge: true });
        setAttendanceStatus(status);
        setToastMessage(`Checked out successfully. Status: ${status}`);
      } else {
        setToastMessage('No check-in record found.');
      }
    } else {
      setToastMessage('No attendance record found for today.');
    }
  
    setToastOpen(true);
  };
  

  const handleToastClose = () => setToastOpen(false);

  const renderDayContent = ({ date }) => {
    const formattedDate = date.toLocaleDateString('en-GB');
    const isHoliday = holidays.includes(formattedDate);
    const status = attendanceRecords[formattedDate]?.status;

    if (status === 'present') {
      return <div className="day-content green-day" title="Present">✅</div>;
    } else if (status === 'absent') {
      return <div className="day-content red-day" title="Absent">❌</div>;
    } else if (isHoliday) {
      return <div className="day-content red-day" title="Holiday">🏆</div>;
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
            <h2>Attendance Actions</h2>
            <button onClick={handleCheckIn}>Check In</button>
            <button onClick={handleCheckOut}>Check Out</button>
            {attendanceStatus && <div>Status: {attendanceStatus}</div>}
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

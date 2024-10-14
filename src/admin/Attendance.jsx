import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Attendance.css";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Attendance = () => {
  const [date, setDate] = useState(new Date());
  const [toastMessage, setToastMessage] = useState("");
  const [isToastOpen, setToastOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [traineeList, setTraineeList] = useState([]);
  const [internList, setInternList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeLists = async () => {
      const db = getFirestore();
      const [employeeSnapshot, traineeSnapshot, internSnapshot] =
        await Promise.all([
          getDocs(collection(db, "employees")),
          getDocs(collection(db, "trainees")),
          getDocs(collection(db, "interns")),
        ]);

      const employees = employeeSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      const trainees = traineeSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      const interns = internSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));

      setEmployeeList(employees);
      setTraineeList(trainees);
      setInternList(interns);
    };

    fetchEmployeeLists();
  }, []);

  const viewAttendance = async (employeeId) => {
    const db = getFirestore();
    const attendanceRef = collection(
      db,
      `adminattendance/${employeeId}/attendance`
    );
    const querySnapshot = await getDocs(attendanceRef);

    const records = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAttendanceRecords(records);
    setToastMessage("Attendance records fetched successfully!");
    setToastOpen(true);

    // Redirect to the attendance page for the selected employee
    navigate(`/attendance?employeeId=${employeeId}`);
  };

  const downloadAttendance = (employeeName) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Attendance Type\n" +
      attendanceRecords
        .map((record) => `${record.date},${record.type}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${employeeName}_attendance.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadHolidays = () => {
    navigate("/upload-holidays");
  };

  return (
    <div className="attendance-page">
      <h1>Employee Attendance</h1>

      <div className="employee-list">
        <h2>Select an Employee</h2>
        {employeeList.map((employee) => (
          <div key={employee.id} className="employee-row">
            <span className="employee-name">{employee.name}</span>
            <button
              onClick={() => viewAttendance(employee.id)}
              className="view-attendance-btn"
            >
              View Attendance
            </button>
            <button
              onClick={() => downloadAttendance(employee.name)}
              className="download-attendance-btn"
            >
              Download Attendance
            </button>
          </div>
        ))}
        {traineeList.map((trainee) => (
          <div key={trainee.id} className="employee-row">
            <span className="employee-name">{trainee.name}</span>
            <button
              onClick={() => viewAttendance(trainee.id)}
              className="view-attendance-btn"
            >
              View Attendance
            </button>
            <button
              onClick={() => downloadAttendance(trainee.name)}
              className="download-attendance-btn"
            >
              Download Attendance
            </button>
          </div>
        ))}
        {internList.map((intern) => (
          <div key={intern.id} className="employee-row">
            <span className="employee-name">{intern.name}</span>
            <button
              onClick={() => viewAttendance(intern.id)}
              className="view-attendance-btn"
            >
              View Attendance
            </button>
            <button
              onClick={() => downloadAttendance(intern.name)}
              className="download-attendance-btn"
            >
              Download Attendance
            </button>
          </div>
        ))}
      </div>

      {/* Button to navigate to Upload Holidays page */}
      <button
        onClick={handleUploadHolidays}
        className="upload-holidays-btn"
      >
        Upload Holidays
      </button>

      {isToastOpen && <div className="toast">{toastMessage}</div>}
    </div>
  );
};

export default Attendance;

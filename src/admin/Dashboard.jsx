import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { Link, useLocation } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import './Dashboard.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [editAnswer, setEditAnswer] = useState('');
  const [present, setPresent] = useState(0);
  const [absent, setAbsent] = useState(0);
  const [totalTrainees, setTotalTrainees] = useState(0); // State for total trainees
  const [totalInterns, setTotalInterns] = useState(0); // State for total interns
  
  const location = useLocation();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
        const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(employeeList);

        const presentCount = employeeList.filter(emp => emp.status === 'present').length;
        const absentCount = employeeList.filter(emp => emp.status === 'absent').length;
        setPresent(presentCount);
        setAbsent(absentCount);

      } catch (error) {
        console.error("Error fetching employees: ", error);
      }
    };

    const fetchFaqs = async () => {
      try {
        const faqSnapshot = await getDocs(collection(firestore, 'faqs'));
        const faqList = faqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFaqs(faqList);
      } catch (error) {
        console.error("Error fetching FAQs: ", error);
      }
    };

    const fetchTotalTrainees = async () => {
      try {
        const traineeSnapshot = await getDocs(collection(firestore, 'trainees'));
        setTotalTrainees(traineeSnapshot.docs.length); // Count the number of trainee documents
      } catch (error) {
        console.error("Error fetching trainees: ", error);
      }
    };

    const fetchTotalInterns = async () => {
      try {
        const internSnapshot = await getDocs(collection(firestore, 'interns'));
        setTotalInterns(internSnapshot.docs.length); // Count the number of intern documents
      } catch (error) {
        console.error("Error fetching interns: ", error);
      }
    };

    fetchEmployees();
    fetchTotalTrainees(); // Fetch total trainees
    fetchTotalInterns(); // Fetch total interns

    if (location.pathname === '/admin/faqs') {
      fetchFaqs();
    }
  }, [location.pathname]);

  const handleFaqClick = (faq) => {
    setSelectedFaq(faq);
    setEditAnswer(faq.answer);
  };

  const handleAnswerUpdate = async () => {
    if (selectedFaq) {
      try {
        const faqDocRef = doc(firestore, 'faqs', selectedFaq.id);
        await updateDoc(faqDocRef, { answer: editAnswer });
        alert('FAQ answer updated successfully!');
        setFaqs(faqs.map(faq => faq.id === selectedFaq.id ? { ...faq, answer: editAnswer } : faq));
        setSelectedFaq(null);
      } catch (error) {
        console.error('Error updating FAQ answer: ', error);
      }
    }
  };

  const doughnutData = {
    labels: ['Present Employees', 'Absent Employees'],
    datasets: [
      {
        data: [present, absent],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
      },
    ],
  };

  const barData = {
    labels: ['6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'],
    datasets: [
      {
        label: 'Check-in Accuracy',
        data: [95, 90, 85, 80, 78, 76, 75, 80, 85, 90, 92, 95, 100, 98, 97, 95, 96],
        backgroundColor: '#007bff',
      },
      {
        label: 'Check-out Accuracy',
        data: [90, 88, 84, 80, 78, 76, 74, 78, 83, 89, 92, 94, 97, 96, 94, 93, 92],
        backgroundColor: '#6c757d',
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Accuracy (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="tabs">
        <Link to="/admin/dashboard" className={`tab ${location.pathname === '/admin/dashboard' ? 'active-tab' : ''}`}>
          Dashboard
        </Link>
        <Link to="/admin/faqs" className={`tab ${location.pathname === '/admin/faqs' ? 'active-tab' : ''}`}>
          FAQs
        </Link>
      </div>

      {location.pathname === '/admin/dashboard' && (
        <div>
          {/* Cards for Employee Stats */}
          <div className="cards-row">
            <div className="card">
              <h3>Total Employees</h3>
              <p>{employees.length}</p>
            </div>
            <div className="card">
              <h3>Total Trainees</h3>
              <p>{totalTrainees}</p>
            </div>
            <div className="card">
              <h3>Total Interns</h3>
              <p>{totalInterns}</p>
            </div>
          </div>

          <div className="chart-row">
            <div className="bar-chart">
              <Bar data={barData} options={barOptions} />
            </div>
            <div className="doughnut-chart">
              <Doughnut data={doughnutData} />
            </div>
          </div>

          <div className="user-grid">
            {employees.map((employee) => (
              <div className="user-card" key={employee.id}>
                <h3>{employee.name}</h3>
                <p>{employee.role}</p>
                <Link to={`/admin/checkinouts/${employee.id}`}>
                  <button className="details-btn">View Details</button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {location.pathname === '/admin/faqs' && (
        <div className="faq-section">
          {faqs.length > 0 ? (
            <ul className="faq-list">
              {faqs.map((faq) => (
                <li key={faq.id}>
                  <p><strong>Question:</strong> {faq.question}</p>
                  <p><strong>Answer:</strong> {faq.answer || "This question is pending response."}</p>
                  <button className="edit-btn" onClick={() => handleFaqClick(faq)}>Edit Answer</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No FAQs available.</p>
          )}
        </div>
      )}

      {selectedFaq && (
        <div className="edit-faq-modal">
          <h3>Edit FAQ Answer</h3>
          <p><strong>Question:</strong> {selectedFaq.question}</p>
          <textarea
            value={editAnswer}
            onChange={(e) => setEditAnswer(e.target.value)}
            rows="4"
            cols="50"
          />
          <button className="update-btn" onClick={handleAnswerUpdate}>Update Answer</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

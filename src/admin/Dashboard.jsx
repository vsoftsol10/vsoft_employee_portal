import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { getDocs, collection, updateDoc, doc, query, where } from 'firebase/firestore';
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
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [totalInterns, setTotalInterns] = useState(0);
  const [checkInOutData, setCheckInOutData] = useState([]);

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

    const fetchTotalTrainees = async () => {
      try {
        const traineeSnapshot = await getDocs(collection(firestore, 'trainees'));
        setTotalTrainees(traineeSnapshot.docs.length);
      } catch (error) {
        console.error("Error fetching trainees: ", error);
      }
    };

    const fetchTotalInterns = async () => {
      try {
        const internSnapshot = await getDocs(collection(firestore, 'interns'));
        setTotalInterns(internSnapshot.docs.length);
      } catch (error) {
        console.error("Error fetching interns: ", error);
      }
    };

    const fetchCheckInOutData = async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      try {
        const checkInOutRef = collection(firestore, 'checkinouts');
        const q = query(checkInOutRef, where("timestamp", ">=", startOfDay), where("timestamp", "<", endOfDay));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCheckInOutData(data);
      } catch (error) {
        console.error("Error fetching check-in/out data: ", error);
      }
    };

    fetchEmployees();
    fetchTotalTrainees();
    fetchTotalInterns();
    fetchCheckInOutData();

    if (location.pathname === '/admin/faqs') {
      const fetchFaqs = async () => {
        try {
          const faqSnapshot = await getDocs(collection(firestore, 'faqs'));
          const faqList = faqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFaqs(faqList);
        } catch (error) {
          console.error("Error fetching FAQs: ", error);
        }
      };
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

  // Prepare doughnut chart data
 // Prepare doughnut chart data for total employees, interns, and trainees
const doughnutData = {
  labels: ['Employees', 'Interns', 'Trainees'],
  datasets: [
    {
      data: [employees.length, totalInterns, totalTrainees],
      backgroundColor: ['#007bff', '#ffc107', '#28a745'],
      hoverBackgroundColor: ['#0056b3', '#e0a800', '#218838'],
    },
  ],
};

  // Calculate check-in/out accuracy based on data
  const totalCheckIns = checkInOutData.filter(record => record.type === 'check-in').length;
  const totalCheckOuts = checkInOutData.filter(record => record.type === 'check-out').length;
  const totalEmployees = employees.length;

  const checkInAccuracy = totalEmployees > 0 ? (totalCheckIns / totalEmployees) * 100 : 0;
  const checkOutAccuracy = totalEmployees > 0 ? (totalCheckOuts / totalEmployees) * 100 : 0;

  // Prepare bar chart data for check-ins
  const checkInData = {
    labels: ['Check-ins'],
    datasets: [
      {
        label: 'Check-in Accuracy',
        data: [checkInAccuracy],
        backgroundColor: ['#007bff'],
      },
    ],
  };

  // Prepare bar chart data for check-outs
  const checkOutData = {
    labels: ['Check-outs'],
    datasets: [
      {
        label: 'Check-out Accuracy',
        data: [checkOutAccuracy],
        backgroundColor: ['#6c757d'],
      },
    ],
  };

  // Options for both bar charts
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
          text: 'Type',
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
              <h3>Check-in Accuracy</h3>
              <Bar data={checkInData} options={barOptions} />
            </div>
            <div className="bar-chart">
              <h3>Check-out Accuracy</h3>
              <Bar data={checkOutData} options={barOptions} />
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
                  <p><strong>Answer:</strong> {faq.answer || "This FAQ doesn't have an answer yet."}</p>
                  <button onClick={() => handleFaqClick(faq)}>Edit Answer</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No FAQs available.</p>
          )}

          {selectedFaq && (
            <div className="edit-faq">
              <h3>Edit Answer for: {selectedFaq.question}</h3>
              <textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} />
              <button onClick={handleAnswerUpdate}>Update Answer</button>
              <button onClick={() => setSelectedFaq(null)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

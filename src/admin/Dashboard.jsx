import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { getDocs, collection, doc, updateDoc } from 'firebase/firestore';
import { Link, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [faqs, setFaqs] = useState([]); // To hold FAQ data
  const [selectedFaq, setSelectedFaq] = useState(null); // To hold the currently selected FAQ for editing
  const [editAnswer, setEditAnswer] = useState(''); // For editing the answer

  const location = useLocation();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeSnapshot = await getDocs(collection(firestore, 'employees'));
        const employeeList = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees: ", error);
      }
    };

    const fetchFaqs = async () => {
      try {
        const faqSnapshot = await getDocs(collection(firestore, 'faqs')); // Assuming 'faqs' is your Firestore collection name
        const faqList = faqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFaqs(faqList);
      } catch (error) {
        console.error("Error fetching FAQs: ", error);
      }
    };

    fetchEmployees();

    if (location.pathname === '/admin/faqs') {
      fetchFaqs(); // Fetch FAQs when the user clicks the FAQ tab
    }
  }, [location.pathname]);

  const handleFaqClick = (faq) => {
    setSelectedFaq(faq); // Set the selected FAQ for editing
    setEditAnswer(faq.answer); // Pre-fill the answer field for editing
  };

  const handleAnswerUpdate = async () => {
    if (selectedFaq) {
      try {
        const faqDocRef = doc(firestore, 'faqs', selectedFaq.id);
        await updateDoc(faqDocRef, { answer: editAnswer });
        alert('FAQ answer updated successfully!');
        // Update the FAQ list with the new answer locally
        setFaqs(faqs.map(faq => faq.id === selectedFaq.id ? { ...faq, answer: editAnswer } : faq));
        setSelectedFaq(null); // Reset after updating
      } catch (error) {
        console.error('Error updating FAQ answer: ', error);
      }
    }
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

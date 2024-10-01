import React, { useState, useEffect } from 'react';
import './FAQs.css'; // Import the CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { firestore } from '../firebaseConfig'; // Import firestore
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Import Firestore functions

const FAQs = () => {
  const [faqs, setFaqs] = useState([]); // State to store FAQs
  const [newDescription, setNewDescription] = useState(''); // State for new FAQ description

  useEffect(() => {
    // Load initial FAQs from Firestore
    const fetchFAQs = async () => {
      const faqsCollection = collection(firestore, 'faqs'); // Reference to the faqs collection
      const faqsSnapshot = await getDocs(faqsCollection); // Fetch documents
      const faqsData = faqsSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setFaqs(faqsData); // Set the state with fetched FAQs
    };

    fetchFAQs(); // Call the function to fetch FAQs
  }, []);

  const handleSend = async () => {
    if (newDescription.trim()) {
      const newFaq = {
        question: newDescription,
        answer: 'This question is pending response.', // Placeholder answer
      };

      try {
        // Add the new FAQ to Firestore
        const docRef = await addDoc(collection(firestore, 'faqs'), newFaq);
        setFaqs([...faqs, { uid: docRef.id, ...newFaq }]); // Update local state with the new FAQ
        setNewDescription(''); // Clear the input field
      } catch (error) {
        console.error('Error adding FAQ: ', error);
      }
    }
  };

  return (
    <div className="faqs-container">
      {/* Description Input Section */}
      <div className="description-input">
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Type your question..."
        />
        <button onClick={handleSend}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>

      {/* FAQs Accordion Section */}
      <div className="accordion-container">
        {faqs.map((faq) => (
          <Accordion key={faq.uid}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${faq.uid}-content`}
              id={`panel-${faq.uid}-header`}
            >
              <h5>{faq.question}</h5>
            </AccordionSummary>
            <AccordionDetails>
              <p>{faq.answer}</p>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
};

export default FAQs;

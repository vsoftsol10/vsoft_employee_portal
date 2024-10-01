import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './Faqs.css'; // Add styles if needed

const Faqs = () => {
  const [faq, setFaq] = useState(null);
  const [editAnswer, setEditAnswer] = useState(''); // For editing the answer
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        // Reference to the specific document /faqs/vPF8GYuOn0DwTUCc8e3v
        const faqDocRef = doc(firestore, 'faqs', 'vPF8GYuOn0DwTUCc8e3v');
        const faqDoc = await getDoc(faqDocRef);
        
        if (faqDoc.exists()) {
          setFaq(faqDoc.data()); // Store the fetched FAQ data
          setEditAnswer(faqDoc.data().answer); // Pre-fill the answer for editing
        } else {
          console.error("FAQ document does not exist!");
        }
      } catch (error) {
        console.error("Error fetching FAQ: ", error);
      }
    };

    fetchFaq();
  }, []);

  const handleAnswerUpdate = async () => {
    try {
      // Reference to the specific document /faqs/vPF8GYuOn0DwTUCc8e3v
      const faqDocRef = doc(firestore, 'faqs', 'vPF8GYuOn0DwTUCc8e3v');
      
      // Update the answer field
      await updateDoc(faqDocRef, {
        answer: editAnswer
      });
      
      alert('FAQ answer updated successfully!');
      setIsEditing(false); // Stop editing mode after updating
    } catch (error) {
      console.error('Error updating FAQ answer: ', error);
    }
  };

  return (
    <div className="faq-section">
      {faq ? (
        <div>
          <h3>FAQ Details</h3>
          <p><strong>Question:</strong> {faq.question}</p>
          {isEditing ? (
            <div>
              <textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows="4"
                cols="50"
              />
              <button className="update-btn" onClick={handleAnswerUpdate}>Update Answer</button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p><strong>Answer:</strong> {faq.answer || "This question is pending response."}</p>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Answer</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading FAQ...</p>
      )}
    </div>
  );
};

export default Faqs;

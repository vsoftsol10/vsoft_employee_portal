import React, { useState, useEffect, useRef } from 'react';
import './Message.css'; // Import styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Add delete icon
import { firestore } from '../firebaseConfig'; // Import Firestore instance from Firebase config
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Message = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch and listen for new messages in real-time from Firestore
  useEffect(() => {
    const q = query(collection(firestore, 'messages'), orderBy('timestamp', 'asc')); // Use firestore instead of getFirestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Send message
  const handleSend = async () => {
    if (newMessage.trim()) {
      await addDoc(collection(firestore, 'messages'), {
        text: newMessage,
        sender: currentUser.uid,
        profileImage: currentUser.profileImage || '/default-profile.png', // Default profile image
        timestamp: new Date(),
        status: 'sent'
      });
      setNewMessage('');
    }
  };

  // Mark the message as 'read' if viewed by others
  const handleRead = async (message) => {
    if (message.status === 'sent') {
      await updateDoc(doc(firestore, 'messages', message.id), { status: 'read' });
    }
  };

  // Delete message (implement permissions for 'delete for everyone' or 'for me')
  const handleDelete = async (id, deleteForEveryone = false) => {
    if (deleteForEveryone) {
      await deleteDoc(doc(firestore, 'messages', id)); // Delete for everyone
    } else {
      // Handle 'delete for me' (implement by hiding it locally)
      setMessages(messages.filter((message) => message.id !== id));
    }
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === currentUser.uid ? 'user' : 'admin'}`}
              onClick={() => handleRead(message)} // Mark as read when clicked
            >
              <img src={message.profileImage} alt="profile" className="profile-img" />
              <p>{message.text}</p>
              <div className="message-status">
                {message.status === 'sent'
                  ? '✓' // Sent (single tick)
                  : message.status === 'read'
                  ? '✓✓ (read)' // Read (blue double tick)
                  : '✓✓'} {/* Delivered (double tick) */}
              </div>
              <button onClick={() => handleDelete(message.id, true)}> {/* 'true' for delete for everyone */}
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;

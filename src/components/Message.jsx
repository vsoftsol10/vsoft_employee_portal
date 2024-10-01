import React, { useState, useEffect, useRef } from 'react';
import './Message.css'; // Import styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Add delete icon
import { firestore } from '../firebaseConfig'; // Import Firestore instance from Firebase config
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig'; // Ensure you import your Firebase auth instance
import { onAuthStateChanged } from 'firebase/auth';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // Track the current user
  const messagesEndRef = useRef(null);

  // Fetch and listen for new messages in real-time from Firestore
  useEffect(() => {
    const q = query(collection(firestore, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // User is signed in
      } else {
        setCurrentUser(null); // User is signed out
      }
    });

    return () => unsubscribe();
  }, []);

  // Send message
  const handleSend = async () => {
    if (newMessage.trim() && currentUser) {
      await addDoc(collection(firestore, 'messages'), {
        text: newMessage,
        sender: currentUser.uid,
        username: currentUser.displayName || 'Anonymous', // Store the username
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

  // Delete message
  const handleDelete = async (id, deleteForEveryone = false) => {
    try {
      if (deleteForEveryone) {
        const messageRef = doc(firestore, 'messages', id);
        await deleteDoc(messageRef); // Delete for everyone
      } else {
        // Update the local state to remove the message
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
      }
    } catch (error) {
      console.error("Error deleting message: ", error);
      // Optionally display an error message to the user
    }
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle error gracefully
  if (!currentUser) {
    return <div>Error: User not authenticated.</div>; // Display error message
  }

  return (
    <div className="message-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === currentUser.uid ? 'user' : 'admin'}`}
              onClick={() => handleRead(message)}
            >
              <div className="message-info">
                <span className="username">{message.username}</span> {/* Display the sender's name */}
                <p>{message.text}</p>
                <div className="message-status">
                  {message.status === 'sent' ? '✓' : message.status === 'read' ? '✓✓ (read)' : '✓✓'}
                </div>
                <button onClick={() => handleDelete(message.id, true)}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
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

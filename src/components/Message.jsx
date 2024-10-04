import React, { useState, useEffect, useRef } from 'react';
import './Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { firestore } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userImages, setUserImages] = useState({});
  const [userNames, setUserNames] = useState({});
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

  // Listen for authentication state changes and fetch the user's profile image
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch the user's profile image from Firestore
        await fetchUserProfile(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to fetch user profile image and store it in userImages state
  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(firestore, 'employees', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setUserImages((prevImages) => ({
        ...prevImages,
        [uid]: data.profileImage || 'default_profile_image_url',
      }));
      // Ensure the user's profile image exists in Firestore
      if (!data.profileImage) {
        await updateDoc(doc(firestore, 'employees', uid), {
          profileImage: 'url_to_new_profile_image', // Replace with actual image URL or logic to set it
        });
      }
    }
  };

  // Fetch user names based on uid from Firestore
  useEffect(() => {
    const fetchUserNames = async () => {
      const nameMap = {};
      for (const message of messages) {
        if (!userNames[message.sender]) {
          const userDoc = await getDoc(doc(firestore, 'employees', message.sender));
          if (userDoc.exists()) {
            nameMap[message.sender] = userDoc.data().name || 'Unknown';
          } else {
            nameMap[message.sender] = 'Unknown';
          }
        }
      }

      if (Object.keys(nameMap).length > 0) {
        setUserNames((prevNames) => ({ ...prevNames, ...nameMap }));
      }
    };

    if (messages.length > 0 && Object.keys(userNames).length < messages.length) {
      fetchUserNames();
    }
  }, [messages, userNames]);

  // Send message
  const handleSend = async () => {
    if (newMessage.trim() && currentUser) {
      // Get the user's profile image URL
      const userImageUrl = userImages[currentUser.uid] || 'default_profile_image_url';

      // Add message with text and profile image URL
      await addDoc(collection(firestore, 'messages'), {
        text: newMessage,
        sender: currentUser.uid,
        timestamp: new Date(),
        status: 'sent',
        profileImage: userImageUrl, // Store the profile image URL with the message
      });
      setNewMessage('');
    }
  };

  // Delete message
  const handleDelete = async (id, deleteForEveryone = false) => {
    try {
      if (deleteForEveryone) {
        await deleteDoc(doc(firestore, 'messages', id));
      } else {
        setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
      }
    } catch (error) {
      console.error('Error deleting message: ', error);
    }
  };

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle error gracefully
  if (!currentUser) {
    return <div>Error: User not authenticated.</div>;
  }

  return (
    <div className="message-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender === currentUser.uid ? 'user' : 'admin'}`}
            >
              <img
                src={message.profileImage || 'default_profile_image_url'}
                alt="Profile"
                className="profile-image"
              />
              <div className={`message ${message.sender === currentUser.uid ? 'user' : 'admin'}`}>
                <p className="message-text">{message.text}</p>
                <div className="message-meta">
                  <span className="message-time">
                    {new Date(message.timestamp.seconds * 1000).toLocaleTimeString()}
                  </span>
                  <span className="message-status">
                    {message.status === 'sent' ? '✓' : message.status === 'read' ? '✓✓ (read)' : '✓✓'}
                  </span>
                  <button onClick={() => handleDelete(message.id, true)} className="delete-button">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
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


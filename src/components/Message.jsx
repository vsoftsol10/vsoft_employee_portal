import React, { useState, useEffect, useRef } from 'react';
import './Message.css'; // Import the CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'; // Import the send icon

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Simulate fetching messages from a server
  useEffect(() => {
    const initialMessages = [
      { id: 1, text: 'Hello, how can I help you?', sender: 'admin' },
      { id: 2, text: 'I have a question about my account.', sender: 'user' },
    ];
    setMessages(initialMessages);
  }, []);

  // Scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'user' }]);
      setNewMessage('');
      // Send the message to the server (replace with real API call)
    }
  };

  return (
    <div className="message-container">
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <p>{message.text}</p>
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

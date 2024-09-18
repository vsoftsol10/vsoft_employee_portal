import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Spinner from './components/Spinner'; // Import the spinner component

const root = ReactDOM.createRoot(document.getElementById('root'));

const Main = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return <App />;
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

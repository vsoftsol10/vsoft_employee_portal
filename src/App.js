import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Drawer'; // Adjust the import path as necessary
import Home from './components/Home'; // Adjust the import path as necessary
import Calendar from './components/Calendar'; // Adjust the import path as necessary
import Leave from './components/Leave'; // Adjust the import path as necessary

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/leave" element={<Leave />} />
       
      </Routes>
    </Router>
  );
}

export default App;

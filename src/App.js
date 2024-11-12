// import './App.css';

import './styles/style.css';

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetailsPage from './pages/ModelDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models" element={<Models />} />
        <Route path="/model-details" element={<ModelDetailsPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;

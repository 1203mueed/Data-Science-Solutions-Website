// src/App.js
import './styles/App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetailsPage from './pages/ModelDetailsPage';
import CompetitionPage from './pages/CompetitionPage';
import Navbar from './components/Navbar';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import DatasetPage from './pages/DatasetPage';
import WorkWithTeamPage from './pages/WorkWithTeamPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div id="root">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Models />} />
            <Route path="/model-details" element={<ModelDetailsPage />} />
            <Route path="/competitions" element={<CompetitionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/datasets" element={<DatasetPage />} />
            <Route path="/work-with-team" element={<WorkWithTeamPage />} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

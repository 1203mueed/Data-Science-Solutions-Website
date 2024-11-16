// src/App.js
import './styles/App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetailsPage from './pages/ModelDetailsPage';
import CompetitionPage from './pages/CompetitionPage';
import Navbar from './components/Navbar';
import PapersPage from './pages/PapersPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import DatasetPage from './pages/DatasetPage';
import NotebookPage from './pages/NotebookPage';
import WorkWithTeamPage from './pages/WorkWithTeamPage';
import LearnPage from './pages/LearnPage';
import BlogsPage from './pages/BlogsPage';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

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
            <Route path="/notebooks" element={<NotebookPage />} />
            <Route path="/papers" element={<PapersPage />} />
            <Route path="/work-with-team" element={<WorkWithTeamPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

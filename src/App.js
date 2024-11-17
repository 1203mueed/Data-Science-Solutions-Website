// src/App.js
import './styles/App.css';
import React, { useEffect, useState } from 'react';
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
import LoginPage from './pages/LoginPage';
import BlogsPage from './pages/BlogsPage';
import SignupPage from './pages/SignupPage';
import UploadDatasetPage from './pages/UploadDatasetPage';
import RequestDatasetPage from './pages/RequestDatasetPage';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  return (
    <Router>
      <div id="root">
        {/* Pass the user and setUser as props to Navbar */}
        <Navbar user={user} setUser={setUser} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Models />} />
            <Route path="/model-details" element={<ModelDetailsPage />} />
            <Route path="/competitions" element={<CompetitionPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/datasets" element={<DatasetPage user={user} />} />
            <Route path="/upload-dataset" element={<UploadDatasetPage user={user} />} />
            <Route path="/request-dataset" element={<RequestDatasetPage user={user} />} />
            <Route path="/notebooks" element={<NotebookPage />} />
            <Route path="/papers" element={<PapersPage />} />
            <Route path="/work-with-team" element={<WorkWithTeamPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/blogs" element={<BlogsPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

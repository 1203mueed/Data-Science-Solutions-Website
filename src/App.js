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
import FederatedTrainingPage from './pages/FederatedTrainingPage';
import FederatedTrainingStartPage from './pages/FederatedTrainingStartPage';
import FederatedTrainingViewPage from './pages/FederatedTrainingViewPage';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this component exists and is correctly implemented

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage on initial render
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser && savedUser._id) { // Assuming _id is used
      setUser({ ...savedUser, userId: savedUser._id }); // Map _id to userId
    }
  }, []);

  return (
    <Router>
      <div id="root">
        <Navbar user={user} setUser={setUser} />
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
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
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/federated-training" element={<FederatedTrainingPage />} />

            {/* Protected Routes */}
            <Route
              path="/federated-training/view"
              element={
                <ProtectedRoute user={user}>
                  <FederatedTrainingViewPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/federated-training/start"
              element={
                <ProtectedRoute user={user}>
                  <FederatedTrainingStartPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-dataset"
              element={
                <ProtectedRoute user={user}>
                  <UploadDatasetPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-dataset"
              element={
                <ProtectedRoute user={user}>
                  <RequestDatasetPage user={user} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

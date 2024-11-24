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
import DataProviderDashboard from './pages/DataProviderDashboard';
import ModelTrainerDashboard from './pages/ModelTrainerDashboard';
import NewTrainingForm from './pages/NewTrainingForm';
import TrainingSessionPage from './pages/TrainingSessionPage';
import ProtectedRoute from './components/ProtectedRoute';

// Import ToastContainer
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage on initial render
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser && savedUser._id) {
      setUser({ ...savedUser, userId: savedUser._id });
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} setUser={setUser} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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

            {/* Model Trainer Dashboard */}
            <Route
              path="/model-trainer/dashboard/:projectId"
              element={
                <ProtectedRoute user={user}>
                  <ModelTrainerDashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* Data Provider Dashboard */}
            <Route
              path="/data-provider/dashboard/:projectId"
              element={
                <ProtectedRoute user={user}>
                  <DataProviderDashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* New Training Form Route */}
            <Route
              path="/model-trainer/dashboard/:projectId/new-training"
              element={
                <ProtectedRoute user={user}>
                  <NewTrainingForm user={user} />
                </ProtectedRoute>
              }
            />

            {/* Training Session Page Route */}
            <Route
              path="/model-trainer/dashboard/:projectId/trainings/:trainingId"
              element={
                <ProtectedRoute user={user}>
                  <TrainingSessionPage user={user} />
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

// src/pages/FederatedTrainingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FederatedTrainingPage.css';

const FederatedTrainingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="federated-training-page">
      <div className="advertisement">
        <h1>Unlock the Power of Privacy-Preserving AI</h1>
        <p>
          Federated Training allows you to collaborate with multiple data
          providers while maintaining privacy. Train smarter, faster, and
          securely!
        </p>
        <img
          src="https://via.placeholder.com/600x300" // Placeholder for advertisement image
          alt="Federated Training Advertisement"
        />
      </div>

      <div className="actions">
        <button
          className="action-button"
          onClick={() => navigate('/federated-training/start')}
        >
          Start Federated Training
        </button>
        <button
          className="action-button"
          onClick={() => navigate('/federated-training/view')}
        >
          View My Federated Training
        </button>
      </div>
    </div>
  );
};

export default FederatedTrainingPage;

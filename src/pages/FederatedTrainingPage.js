// src/pages/FederatedTrainingPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FederatedTrainingPage.css';

const FederatedTrainingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="federated-training-page">
      {/* Advertisement Section */}
      <div className="advertisement">
        <h1>Unlock the Power of Privacy-Preserving AI</h1>
        <p>
          Federated Training allows you to collaborate with multiple data
          providers while maintaining privacy. Train smarter, faster, and
          securely!
        </p>
        <img
          src="/img/federated training page image.png" // Ensure the image path is correct
          alt="Federated Training Advertisement"
          className="advertisement-image"
        />
      </div>

      {/* Action Buttons Section */}
      <div className="actions">
        <button
          className="action-button upload-button"
          onClick={() => navigate('/federated-training/start')}
          aria-label="Start Federated Training"
        >
          Start Federated Training
        </button>
        <button
          className="action-button view-button"
          onClick={() => navigate('/federated-training/view')}
          aria-label="View My Federated Training"
        >
          View My Federated Training
        </button>
      </div>
    </div>
  );
};

export default FederatedTrainingPage;

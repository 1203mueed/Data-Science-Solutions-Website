// src/pages/ModelTrainerDashboard.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ModelTrainerDashboard.css';

const ModelTrainerDashboard = ({ user }) => {
  const { projectId } = useParams();
  const [trainerProjectDetails, setTrainerProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainerProjectDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/projects/${projectId}/trainer-details?userId=${user.userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

      if (response.ok) {
        const data = await response.json();
        setTrainerProjectDetails(data.trainerProjectDetails);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch project details');
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('An error occurred while fetching project details');
    } finally {
      setLoading(false);
    }
  };

  fetchTrainerProjectDetails();
}, [projectId, user.userId]);

if (loading) {
  return (
    <div className="model-trainer-dashboard">
      <div className="loader"></div>
      <p>Loading project details...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="model-trainer-dashboard">
      <p className="error">{error}</p>
    </div>
  );
}

return (
  <div className="model-trainer-dashboard">
    <h1>Model Trainer Dashboard</h1>
    <h2>Project: {trainerProjectDetails.projectName}</h2>
    <p>{trainerProjectDetails.description}</p>

    <section className="project-details">
      <h3>Data Providers</h3>
      {trainerProjectDetails.dataProviders.length === 0 ? (
        <p>No data providers invited for this project.</p>
      ) : (
        <ul className="providers-list">
          {trainerProjectDetails.dataProviders.map((provider, index) => (
            <li key={index} className="provider-item">
              <p>
                <strong>Name:</strong> {provider.name}
              </p>
              <p>
                <strong>Email:</strong> {provider.email}
              </p>
              <p>
                <strong>Status:</strong> {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
              </p>
              <p>
                <strong>Dataset Uploaded:</strong> {provider.filesUploaded > 0 ? 'Yes' : 'No'}
              </p>
              {provider.filesUploaded > 0 && (
                <p>
                  <strong>Files Uploaded:</strong> {provider.filesUploaded}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  </div>
);
};

export default ModelTrainerDashboard;

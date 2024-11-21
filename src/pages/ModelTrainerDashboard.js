// src/pages/ModelTrainerDashboard.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ModelTrainerDashboard.css';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaUserPlus } from 'react-icons/fa';

const ModelTrainerDashboard = ({ user }) => {
  const { projectId } = useParams();
  const [trainerProjectDetails, setTrainerProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [newProviderEmail, setNewProviderEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

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

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!newProviderEmail.trim()) {
      setInviteError('Please enter at least one email address.');
      return;
    }

    const emails = newProviderEmail
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email);
    if (emails.length === 0) {
      setInviteError('Please enter valid email addresses.');
      return;
    }

    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/federated-training/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingId: projectId,
          providerEmails: emails,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTrainerProjectDetails(data.training);
        setInviteSuccess('Data providers invited successfully.');
        setNewProviderEmail('');
      } else {
        setInviteError(data.error || 'Failed to invite data providers.');
      }
    } catch (err) {
      console.error('Error inviting data providers:', err);
      setInviteError('An error occurred while inviting data providers.');
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="model-trainer-dashboard">
        <div className="loader">
          <FaSpinner className="spinner" />
        </div>
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
      <header className="dashboard-header">
        <h1>Model Trainer Dashboard</h1>
        <h2>Project: {trainerProjectDetails.projectName}</h2>
        <p>{trainerProjectDetails.description}</p>
      </header>

      <section className="project-details">
        <h3>Data Providers</h3>
        {trainerProjectDetails.dataProviders.length === 0 ? (
          <p>No data providers invited for this project.</p>
        ) : (
          <div className="providers-list">
            {trainerProjectDetails.dataProviders.map((provider, index) => (
              <div key={index} className="provider-card">
                <div className="provider-info">
                  <p>
                    <strong>Name:</strong> {provider.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {provider.email}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {provider.status === 'accepted' ? (
                      <span className="status accepted">
                        <FaCheckCircle /> Accepted
                      </span>
                    ) : provider.status === 'rejected' ? (
                      <span className="status rejected">
                        <FaTimesCircle /> Rejected
                      </span>
                    ) : (
                      <span className="status invited">Invited</span>
                    )}
                  </p>
                  <p>
                    <strong>Dataset Uploaded:</strong> {provider.filesUploaded > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
                {provider.filesUploaded > 0 && (
                  <div className="dataset-details">
                    <p>
                      <strong>Files Uploaded:</strong> {provider.filesUploaded}
                    </p>
                    <p>
                      <strong>Dataset Description:</strong>
                    </p>
                    <p className="dataset-description">{provider.datasetDescription || 'No description provided.'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="invite-section">
        <h3>Invite New Data Provider</h3>
        <form onSubmit={handleInvite} className="invite-form">
          <div className="invite-group">
            <label htmlFor="provider-email">
              <FaUserPlus className="invite-icon" /> Data Provider Email(s):
            </label>
            <input
              type="text"
              id="provider-email"
              value={newProviderEmail}
              onChange={(e) => setNewProviderEmail(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              required
            />
          </div>
          {inviteError && <p className="invite-error">{inviteError}</p>}
          {inviteSuccess && <p className="invite-success">{inviteSuccess}</p>}
          <button type="submit" disabled={inviting} className="invite-btn">
            {inviting ? (
              <>
                <FaSpinner className="spinner" /> Inviting...
              </>
            ) : (
              'Invite'
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ModelTrainerDashboard;

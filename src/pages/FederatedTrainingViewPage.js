// src/pages/FederatedTrainingViewPage.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/FederatedTrainingViewPage.css';

const FederatedTrainingViewPage = ({ user }) => {
  const [trainingsAsTrainer, setTrainingsAsTrainer] = useState([]);
  const [trainingsAsProvider, setTrainingsAsProvider] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchFederatedTrainings = async () => {
      if (!user || !user.userId) {
        setError('User information is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training?userId=${user.userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTrainingsAsTrainer(data.trainingsAsTrainer || []);
          setTrainingsAsProvider(data.trainingsAsProvider || []);
          setRequests(data.requests || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch federated trainings');
        }
      } catch (err) {
        console.error('Error fetching federated trainings:', err);
        setError('An error occurred while fetching federated trainings');
      } finally {
        setLoading(false);
      }
    };

    fetchFederatedTrainings();
  }, [user]);

  const handleRespond = async (trainingId, responseStatus) => {
    if (!window.confirm(`Are you sure you want to ${responseStatus} this invitation?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/federated-training/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingId,
          userId: user.userId,
          response: responseStatus,
        }),
      });

      const updatedTraining = await res.json();

      if (res.ok) {
        setTrainingsAsProvider((prevTrainings) =>
          prevTrainings.map((training) =>
            training._id === trainingId ? updatedTraining.training : training
          )
        );
        alert(`Invitation ${responseStatus} successfully.`);
      } else {
        alert(`Error: ${updatedTraining.error}`);
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      alert('An error occurred while responding to the invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRespond = async (requestId, responseStatus) => {
    if (!window.confirm(`Are you sure you want to ${responseStatus} this request?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/federated-training/respond-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          response: responseStatus,
        }),
      });

      const updatedRequest = await res.json();

      if (res.ok) {
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === requestId ? { ...req, status: responseStatus } : req
          )
        );
        alert(`Request ${responseStatus} successfully.`);
      } else {
        alert(`Error: ${updatedRequest.error}`);
      }
    } catch (err) {
      console.error('Error responding to request:', err);
      alert('An error occurred while responding to the request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="federated-training-view-page">
        <div className="loader"></div>
        <p>Loading federated training projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="federated-training-view-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="federated-training-view-page">
      <h1>My Federated Training Projects</h1>

      <section className="trainer-section">
        <h2>As Model Trainer</h2>
        {trainingsAsTrainer.length === 0 ? (
          <p>You have not created any federated training projects.</p>
        ) : (
          trainingsAsTrainer.map((training) => (
            <Link
              key={training._id}
              to={`/model-trainer/dashboard/${training._id}`}
              className="training-card-link"
            >
              <div className="training-card">
                <h3>{training.projectName}</h3>
                <p>{training.description}</p>
                <p>
                  <strong>Created At:</strong> {new Date(training.createdAt).toLocaleString()}
                </p>
                <h4>Data Providers:</h4>
                <ul>
                  {training.dataProviders.map((provider) => (
                    <li key={provider.user._id} className="provider-item">
                      <span>
                        {provider.user.name} ({provider.user.email}) - Status: {provider.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))
        )}
      </section>

      <section className="provider-section">
        <h2>As Data Provider</h2>
        {trainingsAsProvider.length === 0 ? (
          <p>You are not invited to any federated training projects.</p>
        ) : (
          trainingsAsProvider.map((training) => {
            const provider = training.dataProviders.find((dp) => dp.user._id === user.userId);
            const providerStatus = provider ? provider.status : 'N/A';
            return (
              <Link
                key={training._id}
                to={`/data-provider/dashboard/${training._id}`}
                className="training-card-link"
              >
                <div className="training-card">
                  <h3>{training.projectName}</h3>
                  <p>{training.description}</p>
                  {/* Added Model Trainer Email */}
                  {training.modelTrainer && training.modelTrainer.email && (
                    <p>
                      <strong>Model Trainer:</strong> {training.modelTrainer.email}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong> {providerStatus}
                  </p>
                  <p>
                    <strong>Created At:</strong> {new Date(training.createdAt).toLocaleString()}
                  </p>
                  {providerStatus === 'invited' && (
                    <div className="action-buttons">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRespond(training._id, 'accepted');
                        }}
                        disabled={actionLoading}
                        className="accept-btn"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRespond(training._id, 'rejected');
                        }}
                        disabled={actionLoading}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </section>

      {requests.length > 0 && (
        <section className="requests-section">
          <h2>Requests</h2>
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <p>
                <strong>{request.user.name}</strong> ({request.user.email}) has made a request for{' '}
                <strong>{request.projectName}</strong>.
              </p>
              <div className="action-buttons">
                <button
                  onClick={() => handleRequestRespond(request._id, 'accepted')}
                  disabled={actionLoading}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequestRespond(request._id, 'rejected')}
                  disabled={actionLoading}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default FederatedTrainingViewPage;

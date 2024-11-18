// src/pages/FederatedTrainingViewPage.js
import React, { useEffect, useState } from 'react';
import '../styles/FederatedTrainingViewPage.css';

const FederatedTrainingViewPage = ({ user }) => {
  const [trainingsAsTrainer, setTrainingsAsTrainer] = useState([]);
  const [trainingsAsProvider, setTrainingsAsProvider] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchFederatedTrainings = async () => {
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
          setTrainingsAsTrainer(data.trainingsAsTrainer);
          setTrainingsAsProvider(data.trainingsAsProvider);
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
  }, [user.userId]);

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

  if (loading) {
    return (
      <div className="federated-training-view-page">
        <p>Loading...</p>
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
            <div key={training._id} className="training-card">
              <h3>{training.projectName}</h3>
              <p>{training.description}</p>
              <p><strong>Created At:</strong> {new Date(training.createdAt).toLocaleString()}</p>
              <h4>Data Providers:</h4>
              <ul>
                {training.dataProviders.map((provider) => (
                  <li key={provider.user._id} className="provider-item">
                    <span>{provider.user.name} ({provider.user.email}) - Status: {provider.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="provider-section">
        <h2>As Data Provider</h2>
        {trainingsAsProvider.length === 0 ? (
          <p>You are not invited to any federated training projects.</p>
        ) : (
          trainingsAsProvider.map((training) => {
            const providerStatus = training.dataProviders.find(dp => dp.user._id === user.userId)?.status;
            return (
              <div key={training._id} className="training-card">
                <h3>{training.projectName}</h3>
                <p>{training.description}</p>
                <p><strong>Model Trainer:</strong> {training.modelTrainer ? training.modelTrainer.name : 'N/A'}</p>
                <p><strong>Status:</strong> {providerStatus}</p>
                <p><strong>Created At:</strong> {new Date(training.createdAt).toLocaleString()}</p>
                {providerStatus === 'invited' && (
                  <div className="action-buttons">
                    <button
                      onClick={() => handleRespond(training._id, 'accepted')}
                      disabled={actionLoading}
                      className="accept-btn"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(training._id, 'rejected')}
                      disabled={actionLoading}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default FederatedTrainingViewPage;

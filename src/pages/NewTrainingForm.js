// src/pages/NewTrainingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/NewTrainingForm.css';

const NewTrainingForm = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [existingSessionNames, setExistingSessionNames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch existing session names on component mount
  useEffect(() => {
    const fetchExistingSessionNames = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/trainings`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const sessionNames = data.trainingHistory.map(
            (session) => session.sessionName.toLowerCase()
          );
          setExistingSessionNames(sessionNames);
        } else {
          console.error('Failed to fetch existing session names.');
        }
      } catch (err) {
        console.error('Error fetching session names:', err);
      }
    };

    fetchExistingSessionNames();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedSessionName = sessionName.trim();

    if (!trimmedSessionName) {
      setError('Session name is required.');
      return;
    }

    // **Frontend Duplicate Check**
    if (existingSessionNames.includes(trimmedSessionName.toLowerCase())) {
      setError(
        `A training session with the name "${trimmedSessionName}" already exists. Please choose a different name.`
      );
      return;
    }

    setLoading(true);
    setError('');

    const requestBody = {
      sessionName: trimmedSessionName,
      userId: user.userId,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Redirect to the training session page
        navigate(
          `/model-trainer/dashboard/${projectId}/trainings/${data.trainingSession._id}`
        );
      } else {
        // Display the error message from the backend
        setError(data.error || 'Failed to create training session.');
      }
    } catch (err) {
      console.error('Error creating training session:', err);
      setError('An error occurred while creating the training session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-training-form">
      <h2>Create New Training Session</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="session-name">Session Name:</label>
          <input
            type="text"
            id="session-name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Enter unique session name"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
};

export default NewTrainingForm;

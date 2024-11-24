// src/pages/NewTrainingForm.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/NewTrainingForm.css';

const NewTrainingForm = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTraining = async (e) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      setError('Session name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/federated-training/${projectId}/trainings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionName: sessionName.trim(),
          userId: user.userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Training session created successfully.');
        navigate(`/model-trainer/dashboard/${projectId}/trainings/${data.trainingSession.trainingId}`);
      } else {
        setError(data.error || 'Failed to create training session.');
        toast.error(data.error || 'Failed to create training session.');
      }
    } catch (err) {
      console.error('Error creating training session:', err);
      setError('An error occurred while creating the training session.');
      toast.error('An error occurred while creating the training session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-training-form">
      <h2>Create New Training Session</h2>
      <form onSubmit={handleCreateTraining}>
        <div className="form-group">
          <label htmlFor="sessionName">Session Name:</label>
          <input
            type="text"
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            required
            placeholder="Enter training session name"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading} className="create-btn">
          {loading ? 'Creating...' : 'Create Training Session'}
        </button>
      </form>
    </div>
  );
};

export default NewTrainingForm;

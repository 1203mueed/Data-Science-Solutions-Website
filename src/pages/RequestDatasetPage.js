// src/pages/RequestDatasetPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RequestDatasetPage.css';

const RequestDatasetPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    category: '',
    dataType: '',
    status: 'requested', // Explicitly set status to "requested"
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/datasets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage('Dataset request submitted successfully!');
        setTimeout(() => navigate('/datasets'), 2000); // Redirect to datasets page after 2 seconds
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to submit dataset request');
      }
    } catch (err) {
      setErrorMessage('An error occurred while submitting the dataset request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-dataset-page">
      <h1>Request Dataset</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Dataset Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="details"
          placeholder="Dataset Details"
          value={formData.details}
          onChange={handleChange}
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Medical">Medical</option>
          <option value="Health">Health</option>
          <option value="Environment">Environment</option>
          <option value="Geospatial">Geospatial</option>
        </select>
        <select
          name="dataType"
          value={formData.dataType}
          onChange={handleChange}
          required
        >
          <option value="">Select Data Type</option>
          <option value="Image">Image</option>
          <option value="Tabular">Tabular</option>
        </select>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Request'}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default RequestDatasetPage;

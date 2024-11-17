// src/pages/UploadDatasetPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UploadDatasetPage.css';

const UploadDatasetPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    category: '',
    dataType: '',
    price: '',
    status: 'uploaded', // Explicitly set status to "uploaded"
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

    // Validate price
    if (formData.price < 0) {
      setErrorMessage('Price must be a non-negative value');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/datasets/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage('Dataset uploaded successfully!');
        setTimeout(() => navigate('/datasets'), 2000); // Redirect to datasets page after 2 seconds
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to upload dataset');
      }
    } catch (err) {
      setErrorMessage('An error occurred while uploading the dataset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-dataset-page">
      <h1>Upload Dataset</h1>
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
        <input
          type="number"
          name="price"
          placeholder="Price (enter 0 for free)"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default UploadDatasetPage;

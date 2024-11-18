// src/pages/FederatedTrainingStartPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FederatedTrainingStartPage.css';

const FederatedTrainingStartPage = ({ user }) => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [dataProviderEmails, setDataProviderEmails] = useState(['']); // Initialize with one email field
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmailField = () => {
    setDataProviderEmails([...dataProviderEmails, '']);
  };

  const handleRemoveEmailField = (index) => {
    const updatedEmails = dataProviderEmails.filter((_, i) => i !== index);
    setDataProviderEmails(updatedEmails);
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = dataProviderEmails.map((email, i) => (i === index ? value : email));
    setDataProviderEmails(updatedEmails);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    dataProviderEmails.forEach((email, index) => {
      if (!email.trim()) {
        newErrors[`email_${index}`] = 'Email is required.';
      } else if (!emailRegex.test(email.trim())) {
        newErrors[`email_${index}`] = 'Invalid email format.';
      }
    });

    if (dataProviderEmails.length === 0) {
      newErrors.dataProviders = 'At least one data provider is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/federated-training/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: projectName.trim(),
          description: description.trim(),
          userId: user ? user.userId : null,
          dataProviderEmails: dataProviderEmails.map((email) => email.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Federated Training Project Created Successfully!');
        navigate('/federated-training/view');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating federated training project:', error);
      alert('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="federated-training-start-page">
      <h1>Create Federated Training Project</h1>
      <form onSubmit={handleSubmit} className="federated-training-form">
        <div className="form-group">
          <label htmlFor="projectName">Project Name<span className="required">*</span></label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className={errors.projectName ? 'input-error' : ''}
          />
          {errors.projectName && <span className="error-message">{errors.projectName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Data Provider Emails<span className="required">*</span></label>
          {dataProviderEmails.map((email, index) => (
            <div key={index} className="email-input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="Enter data provider email"
                className={errors[`email_${index}`] ? 'input-error' : ''}
              />
              {dataProviderEmails.length > 1 && (
                <button
                  type="button"
                  className="remove-email-btn"
                  onClick={() => handleRemoveEmailField(index)}
                >
                  &times;
                </button>
              )}
              {errors[`email_${index}`] && <span className="error-message">{errors[`email_${index}`]}</span>}
            </div>
          ))}
          {errors.dataProviders && <span className="error-message">{errors.dataProviders}</span>}
          <button type="button" className="add-email-btn" onClick={handleAddEmailField}>
            + Add Another Data Provider
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Project...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default FederatedTrainingStartPage;

// src/pages/DataProviderDashboard.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/DataProviderDashboard.css';

const DataProviderDashboard = ({ user }) => {
  const { projectId } = useParams();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [folderUpload, setFolderUpload] = useState([]);
  const [datasetDescription, setDatasetDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState('');

  // Keys to reset file inputs
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [folderInputKey, setFolderInputKey] = useState(Date.now());

  useEffect(() => {
    const fetchTrainingDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/details?userId=${user.userId}`
        );

        if (response.ok) {
          const data = await response.json();
          setTraining(data.training);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch training details');
        }
      } catch (err) {
        console.error('Error fetching training details:', err);
        setError('An error occurred while fetching training details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingDetails();
  }, [projectId, user.userId]);

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0]);
  };

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    const filesWithRelativePaths = files.map((file) => ({
      file,
      relativePath: file.webkitRelativePath || file.name,
    }));
    setFolderUpload(filesWithRelativePaths);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileUpload && folderUpload.length === 0) {
      alert('Please select a file or folder to upload.');
      return;
    }

    if (!datasetDescription) {
      alert('Please provide a description of your dataset.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      // Files are already handled by Multer; no need to append projectId as it's in the URL
      formData.append('userId', user.userId); // Send userId
      formData.append('datasetDescription', datasetDescription);

      if (fileUpload) {
        formData.append('datasetFolder', fileUpload);
        // For single file uploads, add its relativePath
        formData.append('relativePath', fileUpload.name); // Ensure relativePath is provided
      }

      if (folderUpload.length > 0) {
        folderUpload.forEach((item) => {
          formData.append('datasetFolder', item.file);
          formData.append('relativePath', item.relativePath);
        });
      }

      const res = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/upload-dataset`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json(); // Expect valid JSON
        setTraining(data.training);
        alert('Dataset uploaded successfully.');
        setFileUpload(null);
        setFolderUpload([]);
        setDatasetDescription('');
        setFileInputKey(Date.now());
        setFolderInputKey(Date.now());
      } else {
        const errorData = await res.json(); // Read error response as JSON
        console.error('Error uploading dataset:', errorData);
        alert(`Error: ${errorData.error || 'Failed to upload dataset.'}`);
      }
    } catch (err) {
      console.error('Error uploading dataset:', err);
      alert('An error occurred while uploading the dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (datasetFolder) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this dataset? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/delete-dataset`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, datasetFolder }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setTraining(data.training);
        alert('Dataset deleted successfully.');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting dataset:', err);
      alert('An error occurred while deleting the dataset.');
    }
  };

  const handleEditDescription = () => {
    setIsEditing(true);
    const currentProvider = training.dataProviders.find(
      (dp) => dp.user._id.toString() === user.userId
    );
    setUpdatedDescription(currentProvider?.datasetDescription || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedDescription('');
  };

  const handleSaveDescription = async () => {
    const provider = training.dataProviders.find(
      (dp) => dp.user._id.toString() === user.userId
    );
    if (!provider) {
      alert('Data provider not found.');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/federated-training/upload/${projectId}/${provider.datasetFolder}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            datasetDescription: updatedDescription,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setTraining(data.training);
        alert('Dataset description updated successfully.');
        setIsEditing(false);
        setUpdatedDescription('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error updating dataset description:', err);
      alert('An error occurred while updating the dataset description.');
    }
  };

  if (loading) {
    return (
      <div className="data-provider-dashboard">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-provider-dashboard">
        <p className="error">{error}</p>
      </div>
    );
  }

  const provider = training.dataProviders.find(
    (dp) => dp.user._id.toString() === user.userId
  );

  return (
    <div className="data-provider-dashboard">
      <h1>Data Provider Dashboard</h1>
      <h2>Project: {training.projectName}</h2>
      <p>{training.description}</p>

      <section className="project-details">
        <h3>Model Trainer</h3>
        <p>
          <strong>Name:</strong> {training.modelTrainer?.name || 'N/A'}
        </p>
        <p>
          <strong>Email:</strong> {training.modelTrainer?.email || 'N/A'}
        </p>
      </section>

      <section className="dataset-section">
        <h3>Your Dataset</h3>
        {provider ? (
          provider.datasetFolder ? (
            <div className="dataset-info">
              <div className="info-left">
                <p>
                  <strong>Dataset Folder:</strong> {provider.datasetFolder}
                </p>
                <p>
                  <strong>Dataset Description:</strong>
                </p>
                {isEditing ? (
                  <div className="edit-description">
                    <textarea
                      value={updatedDescription}
                      onChange={(e) => setUpdatedDescription(e.target.value)}
                      placeholder="Describe your dataset and folder structure..."
                      required
                    ></textarea>
                    <div className="edit-buttons">
                      <button onClick={handleSaveDescription} className="save-btn">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="dataset-description">
                      {provider.datasetDescription || 'No description provided.'}
                    </p>
                    <button onClick={handleEditDescription} className="edit-btn">
                      Edit Description
                    </button>
                  </div>
                )}
              </div>
              <div className="info-right">
                <p>
                  <strong>Files Uploaded:</strong> {provider.filesUploaded}
                </p>
                <button
                  onClick={() => handleDelete(provider.datasetFolder)}
                  className="delete-btn"
                >
                  Delete Dataset
                </button>
              </div>
            </div>
          ) : (
            <p>No dataset uploaded yet.</p>
          )
        ) : (
          <p>No data provider information available.</p>
        )}
      </section>

      <section className="upload-section">
        <h3>Upload Dataset Folder or File</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="upload-inputs">
            <div className="upload-group">
              <label htmlFor="file-input">Upload File:</label>
              <input
                type="file"
                id="file-input"
                key={fileInputKey}
                onChange={handleFileChange}
                accept="*"
              />
            </div>
            <div className="upload-group">
              <label htmlFor="folder-input">Upload Folder:</label>
              <input
                type="file"
                id="folder-input"
                key={folderInputKey}
                webkitdirectory="true"
                mozdirectory="true"
                directory="true"
                multiple
                onChange={handleFolderChange}
              />
            </div>
          </div>
          <div className="description-group">
            <label htmlFor="dataset-description">Dataset Description:</label>
            <textarea
              id="dataset-description"
              value={datasetDescription}
              onChange={(e) => setDatasetDescription(e.target.value)}
              placeholder="Describe your dataset and folder structure..."
              required
            ></textarea>
          </div>
          <button type="submit" disabled={uploading} className="upload-btn">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default DataProviderDashboard;

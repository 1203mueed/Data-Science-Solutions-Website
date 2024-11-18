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

  useEffect(() => {
    const fetchTrainingDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/projects/${projectId}/details?userId=${user.userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
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
    const filesWithRelativePaths = files.map(file => ({
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('trainingId', projectId);
      formData.append('userId', user.userId);

      if (fileUpload) {
        formData.append('datasetFolder', fileUpload);
        formData.append('relativePath', fileUpload.name);
      }

      if (folderUpload.length > 0) {
        folderUpload.forEach((item) => {
          formData.append('datasetFolder', item.file);
          formData.append('relativePath', item.relativePath);
        });
      }

      const res = await fetch('http://localhost:5000/api/federated-training/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setTraining(data.training);
        alert('Dataset uploaded successfully.');
        setFileUpload(null);
        setFolderUpload([]);
        document.getElementById('file-input').value = null;
        document.getElementById('folder-input').value = null;
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error uploading dataset:', err);
      alert('An error occurred while uploading the dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (datasetFolder) => {
    if (!window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/federated-training/upload/${projectId}/${datasetFolder}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId }),
      });

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
        {training.dataProviders && training.dataProviders.length > 0 ? (
          training.dataProviders.map((provider) => {
            if (provider.user._id === user.userId) {
              return provider.datasetFolder ? (
                <div key={provider.user._id} className="dataset-info">
                  <p>
                    <strong>Dataset Folder:</strong> {provider.datasetFolder}
                  </p>
                  <button onClick={() => handleDelete(provider.datasetFolder)} className="delete-btn">
                    Delete Dataset
                  </button>
                </div>
              ) : (
                <p key={provider.user._id}>No dataset uploaded yet.</p>
              );
            }
            return null;
          })
        ) : (
          <p>No data providers found.</p>
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
                onChange={handleFileChange}
                accept="*"
              />
            </div>
            <div className="upload-group">
              <label htmlFor="folder-input">Upload Folder:</label>
              <input
                type="file"
                id="folder-input"
                webkitdirectory="true"
                mozdirectory="true"
                directory="true"
                multiple
                onChange={handleFolderChange}
              />
            </div>
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

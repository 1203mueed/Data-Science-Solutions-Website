// src/pages/TrainingSessionPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/TrainingSessionPage.css';
import { FaUpload } from 'react-icons/fa';

const TrainingSessionPage = ({ user }) => {
  const { projectId, trainingId } = useParams();
  const [trainingSession, setTrainingSession] = useState(null);
  const [dataProviders, setDataProviders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchTrainingSessionDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}?userId=${user.userId}`
        );

        const data = await response.json();

        if (response.ok) {
          setTrainingSession(data.trainingSession);
          setFiles(data.trainingSession.files || []);
        } else {
          setError(data.error || 'Failed to fetch training session details.');
        }
      } catch (err) {
        console.error('Error fetching training session details:', err);
        setError('An error occurred while fetching training session details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDataProvidersInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/projects/${projectId}/trainer-details?userId=${user.userId}`
        );

        const data = await response.json();

        if (response.ok) {
          setDataProviders(data.trainerProjectDetails.dataProviders);
        } else {
          setError(data.error || 'Failed to fetch data providers information.');
        }
      } catch (err) {
        console.error('Error fetching data providers information:', err);
        setError('An error occurred while fetching data providers information.');
      }
    };

    fetchTrainingSessionDetails();
    fetchDataProvidersInfo();
  }, [projectId, trainingId, user.userId]);

  if (loading) {
    return <p>Loading training session...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  // Construct the URL to the notebook
  const notebookFilename = trainingSession.notebookPath;

  const notebookUrl = notebookFilename
    ? `http://localhost:8888/notebooks/${notebookFilename}`
    : null;

  // Handle file upload
  const handleFileUpload = async (event) => {
    const selectedFiles = event.target.files;
    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/files`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFiles(data.files);
      } else {
        setError(data.error || 'Failed to upload files.');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('An error occurred while uploading files.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file download
  const handleFileDownload = async (fileId, filename) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/files/${fileId}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to download file.');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('An error occurred while downloading the file.');
    }
  };

  return (
    <div className="training-session-page">
      <div className="top-section">
        <h2>{trainingSession.sessionName}</h2>
        {/* Display data providers' emails and descriptions */}
        <section className="data-providers-info">
          <h3>Data Providers Information</h3>
          {dataProviders.map((provider, index) => (
            <div key={index} className="provider-info">
              <p>
                <strong>Name:</strong> {provider.name}
              </p>
              <p>
                <strong>Email:</strong> {provider.email}
              </p>
              <p>
                <strong>Description:</strong>{' '}
                {provider.datasetDescription || 'No description provided'}
              </p>
            </div>
          ))}
        </section>
      </div>
      <div className="main-content">
        <div className="sidebar">
          <h3>Files</h3>
          <button className="upload-files-btn">
            <FaUpload />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', marginLeft: '5px' }}>
              {uploading ? 'Uploading...' : 'Upload Files'}
            </label>
          </button>
          <input
            type="file"
            id="file-upload"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <ul className="files-list">
            {files.map((file) => (
              <li key={file._id}>
                <span>{file.filename}</span>
                <button
                  onClick={() => handleFileDownload(file._id, file.filename)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1e88e5',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '5px',
                  }}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="content-area">
          {/* Embed the notebook */}
          {notebookUrl ? (
            <iframe
              src={notebookUrl}
              title="Jupyter Notebook"
              width="100%"
              height="800px"
              style={{ border: 'none' }}
            ></iframe>
          ) : (
            <p>No notebook available for this session.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingSessionPage;

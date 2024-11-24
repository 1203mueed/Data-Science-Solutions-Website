import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/TrainingSessionPage.css';
import Notebook from '../components/Notebook'; // Adjust the path as necessary
import FileTree from '../components/FileTree'; // Import the FileTree component

const TrainingSessionPage = ({ user }) => {
  const { projectId, trainingId } = useParams();
  const [trainingSession, setTrainingSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainingSessionDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}`
        );
        const data = await response.json();

        if (response.ok) {
          setTrainingSession(data.trainingSession);
        } else {
          throw new Error(data.error || 'Failed to fetch training session details.');
        }
      } catch (err) {
        console.error('Error fetching training session details:', err.message);
        setError('Training session not found.');
        toast.error('Training session not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingSessionDetails();
  }, [projectId, trainingId]);

  /**
   * Function to update cells from the Notebook component
   */
  const updateCells = (updatedCells) => {
    setTrainingSession((prevSession) => ({
      ...prevSession,
      cells: updatedCells,
    }));
  };

  if (loading) {
    return (
      <div className="training-session-page">
        <div className="loader">
          <FaSpinner className="spinner" /> Loading training session details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="training-session-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="training-session-page">
      {/* Data Providers Section */}
      <section className="data-providers-section">
        <h2>Data Providers</h2>
        {trainingSession.dataProviders && trainingSession.dataProviders.length > 0 ? (
          trainingSession.dataProviders.map((provider) => (
            <div key={provider.userId} className="data-provider-card">
              <div className="provider-details">
                <p>
                  <strong>Name:</strong> {provider.name}
                </p>
                <p>
                  <strong>Email:</strong> {provider.email}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                </p>
                <p>
                  <strong>Files Uploaded:</strong> {provider.filesUploaded}
                </p>
                {provider.datasetDescription && (
                  <p>
                    <strong>Dataset Description:</strong> {provider.datasetDescription}
                  </p>
                )}
              </div>
              {provider.folderStructure && provider.folderStructure.length > 0 && (
                <div className="folder-structure">
                  <h3>Dataset Folder Structure:</h3>
                  <FileTree data={provider.folderStructure} />
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No data providers associated with this training session.</p>
        )}
      </section>

      {/* Training Session Details */}
      <header>
        <h2>{trainingSession.sessionName}</h2>
        <p>Created At: {new Date(trainingSession.createdAt).toLocaleString()}</p>
      </header>

      {/* Notebook Component */}
      <Notebook
        projectId={projectId}
        trainingId={trainingId}
        cells={trainingSession.cells}
        setCells={updateCells}
        user={user}
      />

      {/* Files Section (Optional) */}
      {trainingSession.files && trainingSession.files.length > 0 && (
        <section className="files-section">
          <h3>Files</h3>
          <ul>
            {trainingSession.files.map((file, index) => (
              <li key={index}>
                <a
                  href={`http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/files/${file.filepath}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.filename}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default TrainingSessionPage;

// src/routes/federatedTrainingRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Import FederatedTraining
const FederatedTraining = require('../db/models/federatedTrainingModel');

// Import Controller Functions
const {
  getFederatedTrainings,
  createFederatedTraining,
  inviteDataProviders,
  respondToInvitation,
  uploadDatasetFolder,
  updateDatasetDescription,
  getProjectDetails,
  deleteDatasetFolder,
  countFilesInFolder,
  getTrainerProjectDetails,
  createTrainingSession,
  listTrainingHistory,
  getTrainingSessionDetails,
  uploadFilesToTraining,
  downloadFileFromTraining,
  getFolderStructure,
  addCell,
  getCells,
  deleteCell,
  executeCell,
  updateCell,
  shutdownKernel,
  approveCodeHandler,
} = require('../controllers/federatedTrainingController'); // Adjust the path as necessary

// Configure Multer to use a temporary upload directory
const datasetUploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Use a temporary directory for initial upload
      const tempDir = path.join(__dirname, '../assets/tempUploads');
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (err) {
      console.error('Error in Multer destination:', err.message);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const datasetUpload = multer({ storage: datasetUploadStorage });


// Configure Multer to use a temporary upload directory for Model Trainers
const modelTrainerUploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Use a temporary directory for initial upload
      const tempDir = path.join(__dirname, '../assets/tempUploads');
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (err) {
      console.error('Error in Multer destination:', err.message);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename without unique suffix
  },
});

const modelTrainerUpload = multer({ storage: modelTrainerUploadStorage });


// ----- New Routes for Training Sessions -----

// Create a new training session without notebook upload
router.post(
  '/:projectId/trainings',
  // No multer middleware since no file upload is required
  createTrainingSession
);

// List all training sessions (Training History) for a project
router.get('/:projectId/trainings', listTrainingHistory);

// Get details of a specific training session
router.get('/:projectId/trainings/:trainingId', getTrainingSessionDetails);

// Upload files to a training session
router.post(
  '/:projectId/trainings/:trainingId/files',
  modelTrainerUpload.array('files'), // Use 'files' as the field name
  uploadFilesToTraining
);

// Download a specific file from a training session
router.get(
  '/:projectId/trainings/:trainingId/files/:fileId/download',
  downloadFileFromTraining
);

// ----- End of New Routes for Training Sessions -----

// ----- New Routes for Cell Management -----

// Add a new cell
router.post('/:projectId/trainings/:trainingId/cells', addCell);

// Get all cells in a training session
router.get('/:projectId/trainings/:trainingId/cells', getCells);

// Delete a cell
router.delete('/:projectId/trainings/:trainingId/cells/:cellId', deleteCell);

// Update a cell
router.put('/:projectId/trainings/:trainingId/cells/:cellId', updateCell);

// Execute a cell
router.post('/:projectId/trainings/:trainingId/cells/:cellId/execute', executeCell);

// Shutdown kernel
router.post('/:projectId/trainings/:trainingId/shutdown_kernel', shutdownKernel);

// Approval Endpoint
router.post(
  '/:projectId/trainings/:trainingId/approve',
  approveCodeHandler
);

// ----- End of New Routes for Cell Management -----

// Existing Routes
router.get('/', getFederatedTrainings);
router.post('/create', createFederatedTraining);
router.post('/:projectId/invite', inviteDataProviders); // Updated to include projectId in URL
router.post('/respond', respondToInvitation);

// Updated Upload Route (if still needed)
router.post(
  '/:projectId/upload-dataset',
  datasetUpload.array('datasetFolder'), // Field name should match 'datasetFolder'
  uploadDatasetFolder
);

// Additional Routes
router.put('/:projectId/update-dataset-description', updateDatasetDescription);
router.get('/:projectId/details', getProjectDetails);
router.delete('/:projectId/delete-dataset', deleteDatasetFolder);
router.post('/count-files', countFilesInFolder);
router.get('/:projectId/trainer-details', getTrainerProjectDetails);
router.patch('/upload/:projectId/:datasetFolder', updateDatasetDescription);

router.get('/:projectId/data-provider/folder-structure', getFolderStructure);

module.exports = router;

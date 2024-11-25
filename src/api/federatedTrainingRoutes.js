// src/routes/federatedTrainingRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Import FederatedTraining
const FederatedTraining = require('../db/models/federatedTrainingModel');

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
  approveCell,
  rejectCell,
  deleteCell,
  executeCell,
  updateCell,
  shutdownKernel,
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


// federatedTrainingRoutes.js

const trainerFileUploadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { projectId } = req.params;
      // Fetch the project folder name
      const federatedTraining = await FederatedTraining.findById(projectId);
      if (!federatedTraining) {
        return cb(new Error('Project not found.'), null);
      }

      const projectFolderName = federatedTraining.projectFolder;
      const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', projectFolderName, 'trainer_files');

      // Ensure the trainer_files directory exists
      await fs.mkdir(projectFolderPath, { recursive: true });
      cb(null, projectFolderPath);
    } catch (err) {
      console.error('Error in Multer destination:', err.message);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  },
});

const trainerFileUpload = multer({ storage: trainerFileUploadStorage });

router.post(
  '/:projectId/trainings/:trainingId/files',
  trainerFileUpload.array('files'), // Use trainerFileUpload middleware
  uploadFilesToTraining
);


// Existing Routes
router.get('/', getFederatedTrainings);
router.post('/create', createFederatedTraining);
router.post('/:projectId/invite', inviteDataProviders); // Updated to include projectId in URL
router.post('/respond', respondToInvitation);

// Updated Upload Route
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

// Approve a cell
router.post('/:projectId/trainings/:trainingId/cells/:cellId/approve', approveCell);

// Reject a cell
router.post('/:projectId/trainings/:trainingId/cells/:cellId/reject', rejectCell);

// Delete a cell
router.delete('/:projectId/trainings/:trainingId/cells/:cellId', deleteCell);

// Update a cell
router.put('/:projectId/trainings/:trainingId/cells/:cellId', updateCell);

// Define the execute cell route
router.post('/:projectId/trainings/:trainingId/cells/:cellId/execute', executeCell);

// Define the shutdown kernel route
router.post('/:projectId/trainings/:trainingId/shutdown_kernel', shutdownKernel);

// ----- End of New Routes for Cell Management -----

module.exports = router;

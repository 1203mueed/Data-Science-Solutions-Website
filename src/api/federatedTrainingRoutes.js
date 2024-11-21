// src/api/federatedTrainingRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getFederatedTrainings,
  createFederatedTraining,
  inviteDataProviders,
  respondToInvitation,
  uploadDatasetFolder,
  getProjectDetails,
  deleteDatasetFolder,
  countFilesInFolder,
  getTrainerProjectDetails,
  updateDatasetDescription,
  
  // New Controller Functions
  createTrainingSession,
  listTrainingHistory,
  getTrainingSessionDetails,
  uploadFilesToTraining,
  downloadFileFromTraining,
  analyzeCodeCell,
} = require('../controllers/federatedTrainingController');

// Configure Multer for Dataset Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/DatasetUploads')); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Existing Routes
router.get('/', getFederatedTrainings);
router.post('/create', createFederatedTraining);
router.post('/invite', inviteDataProviders);
router.post('/respond', respondToInvitation);
router.post('/upload', upload.array('datasetFolder'), uploadDatasetFolder);
router.get('/projects/:projectId/details', getProjectDetails);
router.delete('/upload/:projectId/:datasetFolder', deleteDatasetFolder);
router.post('/count-files', countFilesInFolder);
router.get('/projects/:projectId/trainer-details', getTrainerProjectDetails);
router.patch('/upload/:projectId/:datasetFolder', updateDatasetDescription);

// ----- New Routes for Training Sessions -----

// Create a new training session with an uploaded notebook
router.post(
  '/:projectId/trainings',
  upload.single('notebook'),
  createTrainingSession
);

// List all training sessions (Training History) for a project
router.get('/:projectId/trainings', listTrainingHistory);

// Get details of a specific training session
router.get('/:projectId/trainings/:trainingId', getTrainingSessionDetails);

// Upload additional files to a specific training session
router.post(
  '/:projectId/trainings/:trainingId/files',
  upload.array('files'),
  uploadFilesToTraining
);

// Download a specific file from a training session
router.get(
  '/:projectId/trainings/:trainingId/files/:fileId',
  downloadFileFromTraining
);

// Analyze a code cell before execution using GPT-4
router.post(
  '/:projectId/trainings/:trainingId/analyze-cell',
  analyzeCodeCell
);

// ----- End of New Routes -----

module.exports = router;

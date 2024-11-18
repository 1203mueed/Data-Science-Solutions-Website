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
} = require('../controllers/federatedTrainingController');

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

// Routes
router.get('/', getFederatedTrainings);
router.post('/create', createFederatedTraining);
router.post('/invite', inviteDataProviders);
router.post('/respond', respondToInvitation);
router.post('/upload', upload.array('datasetFolder'), uploadDatasetFolder);
router.get('/projects/:projectId/details', getProjectDetails);
router.delete('/upload/:projectId/:datasetFolder', deleteDatasetFolder);
router.post('/count-files', countFilesInFolder);
router.get('/projects/:projectId/trainer-details', getTrainerProjectDetails);
module.exports = router;

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
} = require('../controllers/federatedTrainingController');

// Multer setup for dataset uploads
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

/**
 * @route   GET /api/federated-training
 * @desc    Get federated trainings for a user
 * @access  Public
 */
router.get('/', getFederatedTrainings);

/**
 * @route   POST /api/federated-training/create
 * @desc    Create a new federated training project
 * @access  Public
 */
router.post('/create', createFederatedTraining);

/**
 * @route   POST /api/federated-training/invite
 * @desc    Invite additional data providers to a federated training project
 * @access  Public
 */
router.post('/invite', inviteDataProviders);

/**
 * @route   POST /api/federated-training/respond
 * @desc    Respond to an invitation to a federated training project
 * @access  Public
 */
router.post('/respond', respondToInvitation);

/**
 * @route   POST /api/federated-training/upload
 * @desc    Upload a dataset folder for a federated training project
 * @access  Public
 */
router.post('/upload', upload.single('datasetFolder'), uploadDatasetFolder);

module.exports = router;

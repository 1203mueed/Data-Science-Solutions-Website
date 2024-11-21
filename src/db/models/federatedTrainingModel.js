// models/federatedTrainingModel.js

const mongoose = require('mongoose');

// Define a generic file schema to handle any file type
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Define the training session schema
const trainingSessionSchema = new mongoose.Schema({
  sessionName: { type: String, required: true }, // e.g., "Training Session 1"
  notebookPath: { type: String, required: true }, // Path to the Jupyter notebook file
  files: [fileSchema], // Uploaded files associated with this session
  createdAt: { type: Date, default: Date.now },
});

const dataProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Data Provider User ID is required'],
  },
  status: {
    type: String,
    enum: ['invited', 'accepted', 'rejected'],
    default: 'invited',
  },
  datasetFolder: {
    type: String,
    trim: true,
    default: '',
  },
  datasetDescription: {
    type: String,
    trim: true,
    default: '',
  },
});

const federatedTrainingSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  modelTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Model Trainer (User ID) is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  dataProviders: [dataProviderSchema],
  trainingHistory: [trainingSessionSchema], // Array to store training sessions
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FederatedTraining = mongoose.model('FederatedTraining', federatedTrainingSchema);

module.exports = FederatedTraining;

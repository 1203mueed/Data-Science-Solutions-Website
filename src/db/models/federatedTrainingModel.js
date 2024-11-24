// src/db/models/federatedTrainingModel.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID library

// Define Cell Schema
const cellSchema = new mongoose.Schema({
  cellId: { 
    type: String, 
    default: uuidv4, // Automatically generate UUID
    unique: true, // Ensure uniqueness across all cells
  },
  type: { // 'code' or 'markdown'
    type: String,
    enum: ['code', 'markdown'],
    required: true
  },
  code: { 
    type: String, 
    default: '' 
  },
  output: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'executing', 'executed', 'error'], 
    default: 'pending' 
  },
  approved: { 
    type: Boolean, 
    default: true // Initially approved
  },
  rejectionReason: { 
    type: String, 
    default: '' 
  },
}, { _id: false });

// Define Training Session Schema
const trainingSessionSchema = new mongoose.Schema({
  trainingId: { // Unique identifier for the training session
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId for uniqueness
    default: () => new mongoose.Types.ObjectId(), // Auto-generate an ObjectId
  },
  sessionName: { 
    type: String, 
    required: true 
  },
  notebookPath: { 
    type: String, 
    default: '' // No notebook path since it's not being uploaded
  },
  files: [
    {
      filename: { 
        type: String, 
        required: true 
      },
      filepath: { 
        type: String, 
        required: true 
      },
    }
  ],
  cells: { 
    type: [cellSchema], 
    default: [] 
  },
}, { 
  timestamps: true,
});

// Define Data Provider Schema (for clarity and reuse)
const dataProviderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['invited', 'accepted', 'rejected'], 
    default: 'invited' 
  },
  datasetFolder: { 
    type: String, 
    default: '' 
  },
  datasetDescription: { 
    type: String, 
    default: '' 
  },
}, { _id: false });

// Define Federated Training Schema
const federatedTrainingSchema = new mongoose.Schema({
  projectName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true // Trim whitespace
  },
  modelTrainer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  dataProviders: { 
    type: [dataProviderSchema], 
    default: [] // Ensure dataProviders is always an array
  },
  trainingHistory: { 
    type: [trainingSessionSchema], 
    default: [] // Ensure trainingHistory is always an array
  },
  projectFolder: { 
    type: String, 
    required: false 
  },
}, { 
  timestamps: true 
});

// Export the model
module.exports = mongoose.model('FederatedTraining', federatedTrainingSchema);

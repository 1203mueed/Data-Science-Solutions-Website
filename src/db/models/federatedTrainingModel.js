// src/db/models/federatedTrainingModel.js
const mongoose = require('mongoose');

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
  dataProviders: [
    {
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
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FederatedTraining = mongoose.model('FederatedTraining', federatedTrainingSchema);

module.exports = FederatedTraining;

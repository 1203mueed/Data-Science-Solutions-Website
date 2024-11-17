const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the dataset
  details: { type: String, required: true }, // Details about the dataset
  category: { type: String, required: true }, // Category (e.g., AI, Health, etc.)
  dataType: { type: String, required: true }, // Data type (e.g., CSV, JSON, etc.)
  price: { type: Number, default: 0 }, // Price of the dataset (0 for free)
  status: { type: String, enum: ['requested', 'uploaded'], required: true }, // Status of the dataset
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Reference to the user who uploaded the dataset
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the dataset was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp for last update
});

module.exports = mongoose.model('Dataset', datasetSchema);

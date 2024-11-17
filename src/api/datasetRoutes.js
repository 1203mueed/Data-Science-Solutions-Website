const express = require('express');
const {
  addDataset,
  getDatasets,
  getDatasetById,
  updateDataset,
  deleteDataset,
} = require('../controllers/datasetController');

const router = express.Router();

// Routes for managing datasets
router.post('/add', addDataset); // Add a new dataset
router.get('/', getDatasets); // Get all datasets with pagination
router.get('/:id', getDatasetById); // Get a single dataset by ID
router.put('/update/:id', updateDataset); // Update an existing dataset
router.delete('/delete/:id', deleteDataset); // Delete a dataset

module.exports = router;

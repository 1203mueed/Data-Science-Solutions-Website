const Dataset = require('../db/models/datasetModel');

// Add a new dataset
const addDataset = async (req, res) => {
  try {
    const { name, details, category, dataType, price, status, uploader } = req.body;

    // Basic validation
    if (!name || !details || !category || !dataType || price === undefined) {
      return res.status(400).json({ error: 'All fields are required except uploader and status' });
    }

    // Create a new dataset object
    const dataset = new Dataset({
      name,
      details,
      category,
      dataType,
      price,
      status: status || 'Uploaded', // Default status if not provided
      uploader: uploader || null, // Default uploader if not provided
    });

    // Save the dataset to the database
    const savedDataset = await dataset.save();
    res.status(201).json({ message: 'Dataset added successfully', dataset: savedDataset });
  } catch (error) {
    console.error('Error adding dataset:', error);
    res.status(500).json({ error: 'Failed to add dataset' });
  }
};

// Get all datasets with pagination
const getDatasets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const datasets = await Dataset.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalDatasets = await Dataset.countDocuments();

    res.status(200).json({
      datasets,
      totalDatasets,
      totalPages: Math.ceil(totalDatasets / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
};

// Get a single dataset by ID
const getDatasetById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid dataset ID' });
    }

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.status(200).json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
};

// Update an existing dataset
const updateDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid dataset ID' });
    }

    const updatedDataset = await Dataset.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedDataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.status(200).json({ message: 'Dataset updated successfully', dataset: updatedDataset });
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({ error: 'Failed to update dataset' });
  }
};

// Delete a dataset
const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid dataset ID' });
    }

    const deletedDataset = await Dataset.findByIdAndDelete(id);
    if (!deletedDataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    res.status(200).json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({ error: 'Failed to delete dataset' });
  }
};

module.exports = { addDataset, getDatasets, getDatasetById, updateDataset, deleteDataset };

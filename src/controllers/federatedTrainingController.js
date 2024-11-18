// src/controllers/federatedTrainingController.js
const FederatedTraining = require('../db/models/federatedTrainingModel');
const User = require('../db/models/userModel');

// Get federated trainings for a user
const getFederatedTrainings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const trainingsAsTrainer = await FederatedTraining.find({ modelTrainer: userId })
      .populate('dataProviders.user')
      .populate('modelTrainer');

    const trainingsAsProvider = await FederatedTraining.find({
      'dataProviders.user': userId,
    })
      .populate('modelTrainer')
      .populate('dataProviders.user');

    res.status(200).json({ trainingsAsTrainer, trainingsAsProvider });
  } catch (err) {
    console.error('Error fetching federated trainings:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new federated training project
const createFederatedTraining = async (req, res) => {
  try {
    const { projectName, description, userId, dataProviderEmails } = req.body;

    // Validate required fields
    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (
      !dataProviderEmails ||
      !Array.isArray(dataProviderEmails) ||
      dataProviderEmails.length === 0
    ) {
      return res.status(400).json({ error: 'At least one data provider email is required' });
    }

    // Trim and remove duplicate emails
    const trimmedEmails = dataProviderEmails.map(email => email.trim().toLowerCase());
    const uniqueEmails = [...new Set(trimmedEmails)];

    // Validate that data provider emails exist in the database
    const dataProviders = await User.find({ email: { $in: uniqueEmails } });

    if (dataProviders.length !== uniqueEmails.length) {
      const existingEmails = dataProviders.map(user => user.email);
      const invalidEmails = uniqueEmails.filter(email => !existingEmails.includes(email));
      return res.status(400).json({ error: `Invalid data provider emails: ${invalidEmails.join(', ')}` });
    }

    // Prepare dataProviders array for the FederatedTraining model
    const dataProvidersFormatted = dataProviders.map(provider => ({
      user: provider._id,
      status: 'invited', // Initial status
    }));

    // Create new FederatedTraining project
    const newTraining = new FederatedTraining({
      projectName: projectName.trim(),
      modelTrainer: userId,
      description: description ? description.trim() : '',
      dataProviders: dataProvidersFormatted,
    });

    const savedTraining = await newTraining.save();
    res.status(201).json(savedTraining);
  } catch (err) {
    console.error('Error creating federated training:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Invite additional data providers after project creation
const inviteDataProviders = async (req, res) => {
  try {
    const { trainingId, providerEmails } = req.body;

    if (!trainingId) {
      return res.status(400).json({ error: 'Training ID is required' });
    }

    if (!providerEmails || !Array.isArray(providerEmails) || providerEmails.length === 0) {
      return res.status(400).json({ error: 'At least one provider email is required' });
    }

    const training = await FederatedTraining.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Trim and remove duplicate emails
    const trimmedEmails = providerEmails.map(email => email.trim().toLowerCase());
    const uniqueEmails = [...new Set(trimmedEmails)];

    // Validate that provider emails exist in the database
    const providers = await User.find({ email: { $in: uniqueEmails } });

    if (providers.length !== uniqueEmails.length) {
      const existingEmails = providers.map(user => user.email);
      const invalidEmails = uniqueEmails.filter(email => !existingEmails.includes(email));
      return res.status(400).json({ error: `Invalid provider emails: ${invalidEmails.join(', ')}` });
    }

    // Add new data providers if they are not already invited
    providers.forEach(provider => {
      if (!training.dataProviders.some(dp => dp.user.toString() === provider._id.toString())) {
        training.dataProviders.push({ user: provider._id, status: 'invited' });
      }
    });

    await training.save();
    res.status(200).json({ message: 'Data providers invited successfully', training });
  } catch (err) {
    console.error('Error inviting data providers:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Respond to invitation
const respondToInvitation = async (req, res) => {
  try {
    const { trainingId, userId, response } = req.body;

    if (!trainingId || !userId || !response) {
      return res.status(400).json({ error: 'Training ID, User ID, and response are required' });
    }

    const validResponses = ['accepted', 'rejected'];
    if (!validResponses.includes(response)) {
      return res.status(400).json({ error: `Invalid response. Must be one of: ${validResponses.join(', ')}` });
    }

    const training = await FederatedTraining.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    const dataProvider = training.dataProviders.find(
      dp => dp.user.toString() === userId
    );

    if (!dataProvider) {
      return res.status(404).json({ error: 'You are not invited to this project' });
    }

    if (dataProvider.status !== 'invited') {
      return res.status(400).json({ error: `Invitation has already been ${dataProvider.status}` });
    }

    dataProvider.status = response;
    await training.save();

    res.status(200).json({ message: `Invitation ${response}`, training });
  } catch (err) {
    console.error('Error responding to invitation:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload dataset folder
const uploadDatasetFolder = async (req, res) => {
  try {
    const { trainingId, userId } = req.body;
    const datasetFolder = req.file ? req.file.path : null;

    if (!trainingId || !userId) {
      return res.status(400).json({ error: 'Training ID and User ID are required' });
    }

    if (!datasetFolder) {
      return res.status(400).json({ error: 'Dataset folder is required' });
    }

    const training = await FederatedTraining.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    const dataProvider = training.dataProviders.find(
      dp => dp.user.toString() === userId && dp.status === 'accepted'
    );

    if (!dataProvider) {
      return res.status(403).json({ error: 'Unauthorized to upload dataset' });
    }

    dataProvider.datasetFolder = datasetFolder;
    await training.save();

    res.status(200).json({ message: 'Dataset uploaded successfully', training });
  } catch (err) {
    console.error('Error uploading dataset folder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getFederatedTrainings,
  createFederatedTraining,
  inviteDataProviders,
  respondToInvitation,
  uploadDatasetFolder,
};

// src/controllers/federatedTrainingController.js

const FederatedTraining = require('../db/models/federatedTrainingModel');
const User = require('../db/models/userModel');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const axios = require('axios');
const { approveSingleCell } = require('../services/geminiService'); // Updated import
// URL of the Python Kernel Server
const kernelServerURL = 'http://localhost:5001';

/**
 * Recursively build the folder structure
 * @param {string} dirPath - Absolute path to the directory
 * @returns {Promise<Array>} - Folder structure as an array of objects
 */
const buildFolderStructure = async (dirPath) => {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  const structure = await Promise.all(
    items.map(async (item) => {
      if (item.isDirectory()) {
        return {
          name: item.name,
          type: 'folder',
          children: await buildFolderStructure(path.join(dirPath, item.name)),
        };
      } else {
        return {
          name: item.name,
          type: 'file',
        };
      }
    })
  );
  return structure;
};

/**
 * Get the folder structure for a data provider
 */
const getFolderStructure = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required.' });
    }

    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found.' });
    }

    // Find the data provider
    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId);

    if (!provider) {
      return res.status(403).json({ error: 'You are not authorized to view this project.' });
    }

    if (!provider.datasetFolder) {
      return res.status(400).json({ error: 'No dataset folder found for this data provider.' });
    }

    // Construct the absolute path to the dataset folder
    const datasetFolderPath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      training.projectFolder,
      provider.datasetFolder
    );

    // Check if the folder exists
    try {
      const stats = await fs.stat(datasetFolderPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Provided path is not a directory.' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Dataset folder not found.' });
    }

    // Build the folder structure
    const folderStructure = await buildFolderStructure(datasetFolderPath);

    res.status(200).json({ folderStructure });
  } catch (err) {
    console.error('Error fetching folder structure:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get federated trainings for a user, both as a trainer and as a provider.
 */
const getFederatedTrainings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch trainings where the user is the trainer
    const trainingsAsTrainer = await FederatedTraining.find({ modelTrainer: userId })
      .populate('dataProviders.user', 'name email') // Populate only name and email
      .populate('modelTrainer', 'name email');

    // Fetch trainings where the user is a data provider
    const trainingsAsProvider = await FederatedTraining.find({
      'dataProviders.user': userId,
    })
      .populate('modelTrainer', 'name email')
      .populate('dataProviders.user', 'name email');

    res.status(200).json({ trainingsAsTrainer, trainingsAsProvider });
  } catch (err) {
    console.error('Error fetching federated trainings:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new federated training project.
 */
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
      trainingHistory: [], // Initialize empty training history
    });

    const savedTraining = await newTraining.save();

    // Create a folder for the project in DatasetUploads
    const projectFolderName = `project-${savedTraining._id}`;
    const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', projectFolderName);

    await fs.mkdir(projectFolderPath, { recursive: true });
    console.log(`Created project folder: ${projectFolderPath}`);

    // Update the project with the projectFolder
    savedTraining.projectFolder = projectFolderName;
    await savedTraining.save();

    res.status(201).json(savedTraining);
  } catch (err) {
    // Handle duplicate project name error
    if (err.code === 11000 && err.keyPattern && err.keyPattern.projectName) {
      return res.status(400).json({ error: 'Project name already exists. Please choose a different name.' });
    }

    console.error('Error creating federated training:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Invite additional data providers after project creation.
 */
const inviteDataProviders = async (req, res) => {
  try {
    const { projectId, providerEmails } = req.body; // Changed from trainingId to projectId

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!providerEmails || !Array.isArray(providerEmails) || providerEmails.length === 0) {
      return res.status(400).json({ error: 'At least one provider email is required' });
    }

    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

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
        console.log(`Invited new data provider: ${provider.email}`);
      }
    });

    await training.save();
    res.status(200).json({ message: 'Data providers invited successfully', training });
  } catch (err) {
    console.error('Error inviting data providers:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Respond to an invitation as a data provider.
 */
const respondToInvitation = async (req, res) => {
  try {
    const { trainingId, userId, response: userResponse } = req.body;

    if (!trainingId || !userId || !userResponse) {
      return res.status(400).json({ error: 'Training ID, User ID, and response are required' });
    }

    const validResponses = ['accepted', 'rejected'];
    if (!validResponses.includes(userResponse)) {
      return res.status(400).json({ error: `Invalid response. Must be one of: ${validResponses.join(', ')}` });
    }

    const training = await FederatedTraining.findById(trainingId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    const dataProvider = training.dataProviders.find(
      dp => dp.user._id.toString() === userId
    );

    if (!dataProvider) {
      return res.status(404).json({ error: 'You are not invited to this project' });
    }

    if (dataProvider.status !== 'invited') {
      return res.status(400).json({ error: `Invitation has already been ${dataProvider.status}` });
    }

    dataProvider.status = userResponse;
    await training.save();

    console.log(`Data provider ${userId} has ${userResponse} the invitation.`);

    res.status(200).json({ message: `Invitation ${userResponse}`, training });
  } catch (err) {
    console.error('Error responding to invitation:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Upload dataset folder for a data provider.
 */
const uploadDatasetFolder = async (req, res) => {
  try {
    const { projectId } = req.params; // Extract projectId from URL params
    const { userId, datasetDescription } = req.body;

    // Validate required fields
    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }

    // Fetch the federated training project
    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Find the data provider
    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId);

    if (!provider) {
      return res.status(403).json({ error: 'You are not authorized to upload datasets for this project' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Ensure that relativePath is an array
    let relativePaths = req.body.relativePath;
    if (!Array.isArray(relativePaths)) {
      relativePaths = [relativePaths];
    }

    if (relativePaths.length !== req.files.length) {
      return res.status(400).json({ error: 'Number of files and relative paths do not match' });
    }

    // Assign a unique dataset folder if not already set
    if (!provider.datasetFolder) {
      provider.datasetFolder = `dataset-${provider.user._id}`;
      // Create the dataset folder
      const datasetFolderPath = path.join(
        __dirname,
        '../assets/DatasetUploads',
        training.projectFolder,
        provider.datasetFolder
      );
      await fs.mkdir(datasetFolderPath, { recursive: true });
      console.log(`Created dataset folder: ${datasetFolderPath}`);
    }

    const datasetFolderPath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      training.projectFolder,
      provider.datasetFolder
    );

    // Iterate through each file and its corresponding relative path
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = relativePaths[i];

      if (!relativePath) {
        console.warn(`Missing relativePath for file: ${file.originalname}`);
        continue; // Skip files without a relativePath
      }

      // Construct the full target path
      const targetPath = path.join(datasetFolderPath, relativePath);

      // Ensure the target directory exists
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Move the file from the temp directory to the target path
      await fs.rename(file.path, targetPath);
      console.log(`Moved file ${file.originalname} to ${targetPath}`);
    }

    // Update dataset description
    if (datasetDescription) {
      provider.datasetDescription = datasetDescription.trim();
    }

    await training.save();

    res.status(200).json({ message: 'Dataset uploaded successfully', training });
  } catch (err) {
    console.error('Error in uploadDatasetFolder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update dataset description for a data provider.
 */
const updateDatasetDescription = async (req, res) => {
  try {
    const { projectId, datasetFolder } = req.params;
    const { userId, datasetDescription } = req.body;

    if (!projectId || !datasetFolder || !userId || datasetDescription === undefined) {
      return res.status(400).json({ error: 'Project ID, Dataset Folder, User ID, and Dataset Description are required' });
    }

    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId && dp.datasetFolder === datasetFolder);

    if (!provider) {
      return res.status(403).json({ error: 'You are not authorized to update this dataset' });
    }

    provider.datasetDescription = datasetDescription;
    await training.save();

    console.log(`Dataset description updated for provider ${userId} in dataset ${datasetFolder}`);

    res.status(200).json({ message: 'Dataset description updated successfully', training });
  } catch (err) {
    console.error('Error updating dataset description:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get project details for Data Provider.
 */
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId)
      .populate('modelTrainer', 'name email')
      .populate('dataProviders.user', 'name email');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Check if the user is a data provider for this project
    const isDataProvider = training.dataProviders.some(dp => dp.user._id.toString() === userId);

    if (!isDataProvider) {
      return res.status(403).json({ error: 'You are not authorized to view this project' });
    }

    res.status(200).json({ training });
  } catch (err) {
    console.error('Error fetching project details:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a dataset folder for a data provider.
 */
const deleteDatasetFolder = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { datasetFolder, userId } = req.body; // datasetFolder from body

    console.log('Delete Dataset Request:', { projectId, datasetFolder, userId });

    if (!projectId || !datasetFolder || !userId) {
      console.warn('Missing Parameters:', { projectId, datasetFolder, userId });
      return res.status(400).json({ error: 'Project ID, Dataset Folder, and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      console.warn('FederatedTraining Not Found:', projectId);
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Find the data provider
    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId);

    if (!provider) {
      console.warn('Data Provider Not Found:', userId);
      return res.status(403).json({ error: 'You are not authorized to delete datasets for this project' });
    }

    if (provider.datasetFolder !== datasetFolder) {
      console.warn('Dataset Folder Mismatch:', { expected: provider.datasetFolder, received: datasetFolder });
      return res.status(400).json({ error: 'Dataset folder does not match' });
    }

    const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', training.projectFolder);
    const folderPath = path.join(projectFolderPath, provider.datasetFolder);

    console.log('Deleting Folder:', folderPath);

    // Remove the directory and its contents
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`Deleted dataset folder: ${folderPath}`);

    // Update the provider's datasetFolder and datasetDescription fields
    provider.datasetFolder = null;
    provider.datasetDescription = ''; // Clear description as well
    await training.save();

    res.status(200).json({ message: 'Dataset deleted successfully', training });
  } catch (err) {
    console.error('Error deleting dataset folder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Count files in a dataset folder.
 */
const countFilesInFolder = async (req, res) => {
  try {
    const { datasetFolder } = req.body;

    if (!datasetFolder) {
      return res.status(400).json({ error: 'Dataset folder is required' });
    }

    const training = await FederatedTraining.findOne({ 'dataProviders.datasetFolder': datasetFolder });

    if (!training) {
      return res.status(404).json({ error: 'Dataset folder not found in any project' });
    }

    const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', training.projectFolder);
    const folderPath = path.join(projectFolderPath, datasetFolder);

    // Check if the folder exists
    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Provided path is not a directory' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Dataset folder not found' });
    }

    /**
     * Recursively count files in a directory.
     * @param {string} dir - Directory path.
     * @returns {Promise<number>} - Number of files.
     */
    const countFiles = async (dir) => {
      let count = 0;
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const resPath = path.resolve(dir, file.name);
        if (file.isDirectory()) {
          count += await countFiles(resPath);
        } else {
          count += 1;
        }
      }
      return count;
    };

    const fileCount = await countFiles(folderPath);

    res.status(200).json({ fileCount });
  } catch (err) {
    console.error('Error counting files:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get trainer project details.
 */
const getTrainerProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId)
      .populate('modelTrainer', 'name email')
      .populate('dataProviders.user', 'name email');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Verify that the requesting user is the model trainer
    if (training.modelTrainer._id.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to view this project' });
    }

    /**
     * Recursively count files in a directory.
     * @param {string} dir - Directory path.
     * @returns {Promise<number>} - Number of files.
     */
    const countFiles = async (dir) => {
      let count = 0;
      try {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const resPath = path.resolve(dir, file.name);
          if (file.isDirectory()) {
            count += await countFiles(resPath);
          } else {
            count += 1;
          }
        }
      } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
      }
      return count;
    };

    // Gather dataProviders info
    const dataProvidersInfo = await Promise.all(
      training.dataProviders.map(async (provider) => {
        let fileCount = 0;
        if (provider.datasetFolder) {
          const folderPath = path.join(
            __dirname,
            '../assets/DatasetUploads',
            training.projectFolder,
            provider.datasetFolder
          );
          fileCount = await countFiles(folderPath);
        }

        return {
          name: provider.user.name,
          email: provider.user.email,
          status: provider.status,
          datasetFolder: provider.datasetFolder || null, // Added datasetFolder
          filesUploaded: provider.datasetFolder ? fileCount : 0, // Number of files uploaded
          datasetDescription: provider.datasetDescription || '',
        };
      })
    );

    // Prepare the response object
    const trainerProjectDetails = {
      projectName: training.projectName,
      description: training.description,
      dataProviders: dataProvidersInfo,
      trainingHistory: training.trainingHistory, // Include training history here
      createdAt: training.createdAt,
    };

    res.status(200).json({ trainerProjectDetails });
  } catch (err) {
    console.error('Error fetching trainer project details:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new training session without notebook upload.
 */
const createTrainingSession = async (req, res) => {
  const { projectId } = req.params;
  const { sessionName, notebookName, userId } = req.body;

  if (!sessionName || !notebookName || !userId) {
    return res.status(400).json({ error: 'Session name, notebook name, and user ID are required.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (federatedTraining.modelTrainer.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }

    const duplicateSession = federatedTraining.trainingHistory.some(
      (session) => session.sessionName.toLowerCase() === sessionName.toLowerCase()
    );

    if (duplicateSession) {
      return res.status(400).json({
        error: `Training session "${sessionName}" already exists.`,
      });
    }

    const newSession = {
      trainingId: new mongoose.Types.ObjectId(), // Ensure unique trainingId
      sessionName: sessionName.trim(),
      notebookName: notebookName.trim(),
      notebookPath: '', // Will be set after creating the notebook file
      cells: [], // Initialize with empty cells
      files: [],
      createdAt: new Date(),
    };

    // Create the notebook file in the project directory
    const projectFolderPath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      federatedTraining.projectFolder
    );

    // Ensure the project directory exists
    await fs.mkdir(projectFolderPath, { recursive: true });

    // Generate the notebook file name and path
    const notebookFileName = `${newSession.trainingId}_${newSession.notebookName}.ipynb`;
    const notebookFilePath = path.join(projectFolderPath, notebookFileName);

    // Initialize an empty notebook structure
    const nb = {
      cells: [],
      metadata: {},
      nbformat: 4,
      nbformat_minor: 5,
    };

    // Write the notebook file
    await fs.writeFile(notebookFilePath, JSON.stringify(nb, null, 2));

    // Update notebookPath in the training session
    newSession.notebookPath = notebookFileName;

    // Add the new session to the training history
    federatedTraining.trainingHistory.push(newSession);
    await federatedTraining.save();

    res.status(201).json({
      message: 'Training session created successfully.',
      trainingSession: newSession,
    });
  } catch (error) {
    console.error('Error creating training session:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Upload additional files to a training session.
 */
const uploadFilesToTraining = async (req, res) => {
  try {
    const { projectId, trainingId } = req.params;
    const { userId } = req.body; // Extract userId from form data

    console.log('Received upload request:');
    console.log('Project ID:', projectId);
    console.log('Training ID:', trainingId);
    console.log('User ID:', userId);

    // Validate required fields
    if (!projectId || !trainingId || !userId) {
      return res.status(400).json({ error: 'Project ID, Training ID, and User ID are required.' });
    }

    // Fetch the federated training project
    const training = await FederatedTraining.findById(projectId).populate('modelTrainer').populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found.' });
    }

    // Determine if the uploader is the Model Trainer
    const isModelTrainer = training.modelTrainer._id.toString() === userId;
    const modelTrainerId = training.modelTrainer._id.toString();
    console.log('Model Trainer:', modelTrainerId);
    console.log(`Is Model Trainer: ${isModelTrainer}`);

    if (!isModelTrainer) {
      return res.status(403).json({ error: 'Only the model trainer can upload files to the project directory.' });
    }

    // Find the specific training session
    const trainingSession = training.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required.' });
    }

    // Define the target directory as the project folder
    const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', training.projectFolder);

    // Ensure the project directory exists
    await fs.mkdir(projectFolderPath, { recursive: true });

    // Iterate through each file and move them to the project directory
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = file.originalname; // Using original filename

      // Construct the full target path
      const targetPath = path.join(projectFolderPath, relativePath);

      // Move the file from the temp directory to the target path
      await fs.rename(file.path, targetPath);
      console.log(`Moved file ${file.originalname} to ${targetPath}`);

      // Optionally, update trainingSession.files if needed
      trainingSession.files.push({
        filename: file.originalname,
        filepath: relativePath,
      });
    }

    // Save the training document
    await training.save();

    // Rebuild project folder structure
    const folderStructure = await buildFolderStructure(projectFolderPath);
    const projectFolderStructure = [
      {
        name: training.projectFolder,
        type: 'folder',
        children: folderStructure,
      },
    ];

    res.status(200).json({
      message: 'Files uploaded successfully.',
      files: trainingSession.files,
      projectFolderStructure: projectFolderStructure,
    });
  } catch (err) {
    console.error('Error in uploadFilesToTraining:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


/**
 * Download a specific file from a training session.
 */
const downloadFileFromTraining = async (req, res) => {
  const { projectId, trainingId, fileId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const file = trainingSession.files.find((f) => f._id.toString() === fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const projectFolderName = federatedTraining.projectFolder;
    const projectFolderPath = path.join(__dirname, '../assets/DatasetUploads', projectFolderName);
    const filePath = path.join(projectFolderPath, file.filepath);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'File does not exist on the server.' });
    }

    console.log(`Downloading file: ${filePath}`);

    res.download(filePath, file.filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ error: 'An error occurred while downloading the file.' });
      }
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'An error occurred while downloading the file.' });
  }
};

/**
 * List all training sessions (Training History) for a project.
 */
const listTrainingHistory = async (req, res) => {
  const { projectId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingHistory = federatedTraining.trainingHistory.map((session) => ({
      trainingId: session.trainingId, // Use session.trainingId
      sessionName: session.sessionName,
      createdAt: session.createdAt,
    }));

    res.status(200).json({ trainingHistory });
  } catch (error) {
    console.error('Error listing training history:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get details of a specific training session.
 */

const getTrainingSessionDetails = async (req, res) => {
  const { projectId, trainingId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId)
      .populate('modelTrainer', 'name email')
      .populate('dataProviders.user', 'name email');

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Find the training session with the matching trainingId
    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Ensure cells include approved and rejectionReason fields
    // Ensure trainingSession.cells is an array
    const cells = Array.isArray(trainingSession.cells)
      ? trainingSession.cells.map((cell) => ({
          cellId: cell.cellId,
          type: cell.type,
          code: cell.code,
          output: cell.output,
          status: cell.status,
          approved: cell.approved,
          rejectionReason: cell.rejectionReason,
        }))
      : [];

    // Function to count files in a directory
    const countFiles = async (dir) => {
      let count = 0;
      try {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const resPath = path.resolve(dir, file.name);
          if (file.isDirectory()) {
            count += await countFiles(resPath);
          } else {
            count += 1;
          }
        }
      } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
      }
      return count;
    };

    // Function to build folder structure
    const buildFolderStructure = async (dirPath) => {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      const structure = await Promise.all(
        items.map(async (item) => {
          if (item.isDirectory()) {
            return {
              name: item.name,
              type: 'folder',
              children: await buildFolderStructure(path.join(dirPath, item.name)),
            };
          } else {
            return {
              name: item.name,
              type: 'file',
            };
          }
        })
      );
      return structure;
    };

    // Gather dataProviders info
    const dataProvidersInfo = await Promise.all(
      federatedTraining.dataProviders.map(async (provider) => {
        let fileCount = 0;
        let folderStructure = [];
        if (provider.datasetFolder) {
          const folderPath = path.join(
            __dirname,
            '../assets/DatasetUploads',
            federatedTraining.projectFolder,
            provider.datasetFolder
          );

          // Count files
          fileCount = await countFiles(folderPath);

          // Build folder structure
          const children = await buildFolderStructure(folderPath);

          // Wrap the folderStructure with the datasetFolder name
          folderStructure = [
            {
              name: provider.datasetFolder,
              type: 'folder',
              children: children,
            },
          ];
        }

        return {
          userId: provider.user._id,
          name: provider.user.name,
          email: provider.user.email,
          status: provider.status,
          datasetFolder: provider.datasetFolder || null,
          filesUploaded: fileCount,
          datasetDescription: provider.datasetDescription || '',
          folderStructure: folderStructure,
        };
      })
    );

    // Build project folder structure
    const projectFolderPath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      federatedTraining.projectFolder
    );

    let projectFolderStructure = [];
    try {
      const projectChildren = await buildFolderStructure(projectFolderPath);
      projectFolderStructure = [
        {
          name: federatedTraining.projectFolder,
          type: 'folder',
          children: projectChildren,
        },
      ];
    } catch (err) {
      console.error('Error building project folder structure:', err.message);
    }

    res.status(200).json({
      trainingSession: {
        trainingId: trainingSession.trainingId,
        sessionName: trainingSession.sessionName,
        notebookName: trainingSession.notebookName,
        notebookPath: trainingSession.notebookPath,
        files: trainingSession.files,
        cells: Array.isArray(cells) ? cells : [],
        dataProviders: dataProvidersInfo,
        projectFolderStructure: projectFolderStructure, // Include project folder structure
        createdAt: trainingSession.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching training session details:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Add a new cell to a training session.
 */
const addCell = async (req, res) => {
  const { projectId, trainingId } = req.params;
  const { type } = req.body;

  if (!type || !['code', 'markdown'].includes(type)) {
    return res.status(400).json({ error: 'Invalid cell type.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const newCellId = uuidv4(); // Generate a unique UUID
    const newCell = {
      cellId: newCellId,
      type,
      code: '',
      output: '',
      status: 'pending',
      approved: type === 'markdown', // Automatically approve markdown cells
      rejectionReason: '',
    };

    trainingSession.cells.push(newCell);

    // Get the notebook file path
    const notebookFilePath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      federatedTraining.projectFolder,
      trainingSession.notebookPath
    );

    // Add the new cell to the notebook
    let nb;
    try {
      const nbContent = await fs.readFile(notebookFilePath, 'utf-8');
      nb = JSON.parse(nbContent);
    } catch (err) {
      // If notebook doesn't exist, create a new one
      nb = {
        cells: [],
        metadata: {},
        nbformat: 4,
        nbformat_minor: 5,
      };
    }

    // Add the new cell to the notebook with an 'id' field
    nb.cells.push({
      cell_type: type,
      source: '',
      metadata: { id: newCellId }, // Assign the UUID as the 'id'
      outputs: [],
      execution_count: null,
    });

    // Save the updated notebook
    await fs.writeFile(notebookFilePath, JSON.stringify(nb, null, 2));

    await federatedTraining.save();

    res.status(201).json({ cell: newCell });
  } catch (error) {
    console.error('Error adding cell:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



/**
 * Get all cells in a training session.
 */
const getCells = async (req, res) => {
  const { projectId, trainingId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const cells = trainingSession.cells || [];

    res.status(200).json({ cells });
  } catch (error) {
    console.error('Error fetching cells:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Delete a cell from a training session.
 */
const deleteCell = async (req, res) => {
  const { projectId, trainingId, cellId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const cellIndex = trainingSession.cells.findIndex(
      (c) => c.cellId.toString() === cellId
    );

    if (cellIndex === -1) {
      return res.status(404).json({ error: 'Cell not found.' });
    }

    trainingSession.cells.splice(cellIndex, 1);
    await federatedTraining.save();

    res.status(200).json({ message: 'Cell deleted successfully.' });
  } catch (error) {
    console.error('Error deleting cell:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


/**
 * Update a cell's code in a training session.
 */
const updateCell = async (req, res) => {
  const { projectId, trainingId, cellId } = req.params;
  const { newCode } = req.body;

  if (typeof newCode !== 'string') {
    return res.status(400).json({ error: 'Invalid code content.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const cell = trainingSession.cells.find(
      (c) => c.cellId.toString() === cellId
    );

    if (!cell) {
      return res.status(404).json({ error: 'Cell not found.' });
    }

    cell.code = newCode;
    cell.status = 'pending';
    cell.output = '';
    cell.approved = false; // Reset approval status upon code update
    cell.rejectionReason = '';

    // Get the notebook file path
    const notebookFilePath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      federatedTraining.projectFolder,
      trainingSession.notebookPath
    );

    // Update the cell in the notebook
    let nb;
    try {
      const nbContent = await fs.readFile(notebookFilePath, 'utf-8');
      nb = JSON.parse(nbContent);
    } catch (err) {
      // If notebook doesn't exist, create a new one
      nb = {
        cells: [],
        metadata: {},
        nbformat: 4,
        nbformat_minor: 5,
      };
    }

    const nbCellIndex = nb.cells.findIndex(
      (c) => c.metadata && c.metadata.id === cell.cellId.toString()
    );

    if (nbCellIndex !== -1) {
      nb.cells[nbCellIndex].source = newCode;
    }

    // Save the updated notebook
    await fs.writeFile(notebookFilePath, JSON.stringify(nb, null, 2));

    await federatedTraining.save();

    res.status(200).json({ message: 'Cell updated successfully.' });
  } catch (error) {
    console.error('Error updating cell:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Execute a specific code cell in a training session.
 * Sends all code cells for context and evaluates only the target cell.
 */
const executeCell = async (req, res) => {
  const { projectId, trainingId, cellId } = req.params;

  try {
    // Fetch the federated training project
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Find the specific training session
    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Find all code cells in the training session
    const allCodeCells = trainingSession.cells.filter((c) => c.type === 'code');

    if (allCodeCells.length === 0) {
      return res.status(400).json({ error: 'No code cells available for execution.' });
    }

    // Find the specific cell to execute
    const targetCell = trainingSession.cells.find((c) => c.cellId.toString() === cellId);

    if (!targetCell) {
      return res.status(404).json({ error: 'Cell not found.' });
    }

    if (targetCell.type !== 'code') {
      return res.status(400).json({ error: 'Only code cells can be executed.' });
    }

    if (!targetCell.code.trim()) {
      return res.status(400).json({ error: 'Cannot execute empty code.' });
    }

    // Extract datasetFolders from dataProviders
    const datasetFolders = federatedTraining.dataProviders
      .filter(dp => dp.datasetFolder)
      .map(dp => dp.datasetFolder);

    // Prepare all code cells' code
    const allCellsCode = allCodeCells.map(cell => ({
      cellId: cell.cellId,
      code: cell.code,
      type: cell.type,
    }));

    // Call the approveSingleCell service with all code cells and the target cell
    const approvalResult = await approveSingleCell(allCellsCode, targetCell, datasetFolders);

    // Debugging log
    console.log(`Approval Result for Cell ${cellId}:`, approvalResult);

    // Update the target cell based on approval result
    if (approvalResult.approved) {
      // Update cell status to 'executing'
      targetCell.status = 'executing';
      targetCell.output = 'Executing...';
      await federatedTraining.save();

      // Define the notebook file path
      const notebookFilePath = path.join(
        __dirname,
        '../assets/DatasetUploads',
        federatedTraining.projectFolder,
        trainingSession.notebookPath
      );

      // Find the cell index based on cellId
      const cellIndex = trainingSession.cells.findIndex(c => c.cellId.toString() === cellId);
      if (cellIndex === -1) {
        return res.status(404).json({ error: 'Cell index not found.' });
      }

      // Initialize the kernel for the notebook if not already initialized
      try {
        await axios.post(`${kernelServerURL}/init_kernel`, {
          notebook_path: notebookFilePath,
        });
      } catch (error) {
        // If the kernel is already initialized, the server responds with a 200 or 409 status
        if (error.response && (error.response.status !== 200 && error.response.status !== 409)) {
          console.error('Error initializing kernel:', error.message);
          targetCell.status = 'error';
          targetCell.output = 'Error initializing kernel.';
          await federatedTraining.save();
          return res.status(500).json({ error: 'Error initializing kernel.' });
        }
      }

      // Execute the cell
      try {
        const response = await axios.post(`${kernelServerURL}/execute_cell`, {
          notebook_path: notebookFilePath,
          cell_index: cellIndex,
        });

        const { outputs } = response.data;

        // Update the cell's output and status
        targetCell.output = outputs.join('\n') || '';
        targetCell.status = 'executed';

        await federatedTraining.save();
        return res.status(200).json({ output: targetCell.output, error: null });

      } catch (error) {
        console.error('Error executing cell:', error.response ? error.response.data : error.message);
        targetCell.status = 'error';
        targetCell.output = error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : 'Error executing cell.';
        await federatedTraining.save();
        return res.status(500).json({ error: 'Error executing cell.', details: targetCell.output });
      }

    } else {
      // If not approved, update the cell as rejected
      targetCell.status = 'rejected';
      targetCell.rejectionReason = approvalResult.reason;
      await federatedTraining.save();
      return res.status(400).json({ error: 'Cell execution rejected.', reason: approvalResult.reason });
    }

  } catch (error) {
    console.error('Error executing cell:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Approve all code cells in a training session.
 * Sends all code cells for context and evaluates only the specified cells.
 */
const approveCodeHandler = async (req, res) => {
  try {
    const { projectId, trainingId } = req.params;
    const { cells } = req.body; // Expecting an array of cell objects

    if (!projectId || !trainingId) {
      return res.status(400).json({ error: 'Project ID and Training ID are required.' });
    }

    if (!cells || !Array.isArray(cells)) {
      return res.status(400).json({ error: 'Cells are required and should be an array.' });
    }

    // Fetch the federated training project with populated dataProviders
    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      console.error(`FederatedTraining project with ID ${projectId} not found.`);
      return res.status(404).json({ error: 'Federated training project not found.' });
    }

    // Find the specific training session
    const trainingSession = training.trainingHistory.find(session => session.trainingId.toString() === trainingId);

    if (!trainingSession) {
      console.error(`Training session with ID ${trainingId} not found in project ${projectId}.`);
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Extract datasetFolders from training.dataProviders
    const datasetFolders = training.dataProviders
      .filter(dp => dp.datasetFolder)
      .map(dp => dp.datasetFolder);

    // Debugging logs
    console.log(`Approving cells for projectId: ${projectId}, trainingId: ${trainingId}`);
    console.log(`Dataset Folders: ${datasetFolders.join(', ')}`);
    console.log(`Number of Cells to Approve: ${cells.length}`);

    // Find all code cells in the training session
    const allCodeCells = trainingSession.cells.filter((c) => c.type === 'code');

    // Prepare all code cells' code
    const allCellsCode = allCodeCells.map(cell => ({
      cellId: cell.cellId,
      code: cell.code,
      type: cell.type,
    }));

    // Map of cells to approve
    const targetCellsMap = {};
    cells.forEach(cell => {
      if (cell.cellId && cell.code) {
        targetCellsMap[cell.cellId] = cell.code;
      }
    });

    // For each target cell, perform approval
    const approvalPromises = cells.map(async (cell) => {
      const fullCell = allCodeCells.find(c => c.cellId === cell.cellId);
      if (!fullCell) {
        return { cellId: cell.cellId, approved: false, reason: 'Cell not found.' };
      }

      // Use the approveSingleCell function to evaluate the target cell with context
      const approval = await approveSingleCell(allCellsCode, fullCell, datasetFolders);
      return approval;
    });

    // Await all approvals
    const approvalResults = await Promise.all(approvalPromises);

    // Update the training session based on approval results
    approvalResults.forEach((result) => {
      const cell = trainingSession.cells.find(c => c.cellId === result.cellId);
      if (cell) {
        cell.approved = result.approved;
        if (result.approved) {
          cell.status = 'approved'; // Define 'approved' status if needed
          cell.rejectionReason = '';
        } else {
          cell.status = 'rejected';
          cell.rejectionReason = result.reason;
        }
      }
    });

    // Save the updated training session
    await training.save();

    res.status(200).json(approvalResults);
  } catch (err) {
    console.error('Error in approveCodeHandler:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



// controllers/federatedTrainingController.js

const shutdownKernel = async (req, res) => {
  const { projectId, trainingId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.find(
      (session) => session.trainingId.toString() === trainingId
    );

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Define the notebook path
    const notebookFilePath = path.join(
      __dirname,
      '../assets/DatasetUploads',
      federatedTraining.projectFolder,
      trainingSession.notebookPath
    );

    // Shutdown the kernel
    try {
      const response = await axios.post(`${kernelServerURL}/shutdown_kernel`, {
        notebook_path: notebookFilePath,
      });

      // Update training session status if needed
      // ...

      return res.status(200).json({ message: 'Kernel shutdown successfully.' });
    } catch (error) {
      console.error('Error shutting down kernel:', error.response ? error.response.data : error.message);
      return res.status(500).json({ error: 'Error shutting down kernel.' });
    }

  } catch (error) {
    console.error('Error shutting down kernel:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


/**
 * Export all controller functions.
 */
module.exports = {
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
  getFolderStructure,

  addCell,
  getCells,
  deleteCell,
  executeCell,
  updateCell,
  shutdownKernel,
  approveCodeHandler,
};
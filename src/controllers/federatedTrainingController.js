// src/controllers/federatedTrainingController.js
const FederatedTraining = require('../db/models/federatedTrainingModel');
const User = require('../db/models/userModel');
const path = require('path');
const fs = require('fs').promises;

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

// Updated `uploadDatasetFolder` to handle replacing existing datasets
const uploadDatasetFolder = async (req, res) => {
  try {
    const { trainingId, userId, datasetDescription } = req.body;
    let relativePaths = req.body.relativePath;

    if (!trainingId || !userId) {
      return res.status(400).json({ error: 'Training ID and User ID are required' });
    }

    const training = await FederatedTraining.findById(trainingId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId);

    if (!provider) {
      return res.status(403).json({ error: 'You are not authorized to upload datasets for this project' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!Array.isArray(relativePaths)) {
      relativePaths = [relativePaths];
    }

    // If a dataset already exists, delete it
    if (provider.datasetFolder) {
      const existingFolderPath = path.join(__dirname, '../assets/DatasetUploads', provider.datasetFolder);
      try {
        await fs.rm(existingFolderPath, { recursive: true, force: true });
        provider.datasetFolder = ''; // Clear the datasetFolder field
        provider.datasetDescription = ''; // Clear the description as well
      } catch (err) {
        console.error('Error deleting existing dataset folder:', err.message);
        return res.status(500).json({ error: 'Failed to delete existing dataset folder' });
      }
    }

    // Create a new folder for the uploaded dataset
    const folderName = `provider-${userId}-${Date.now()}`;
    const baseUploadPath = path.join(__dirname, '../assets/DatasetUploads', folderName);

    await fs.mkdir(baseUploadPath, { recursive: true });

    // Move uploaded files to the target directory while preserving folder structure
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = relativePaths[i] || file.originalname;
      const targetPath = path.join(baseUploadPath, relativePath);

      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      await fs.rename(file.path, targetPath);
    }

    // Update the provider's datasetFolder and datasetDescription fields
    provider.datasetFolder = folderName;
    provider.datasetDescription = datasetDescription || '';
    await training.save();

    res.status(200).json({ training });
  } catch (err) {
    console.error('Error uploading dataset folder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New controller function to update dataset description
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

    res.status(200).json({ message: 'Dataset description updated successfully', training });
  } catch (err) {
    console.error('Error updating dataset description:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// New controller function to get project details for Data Provider
const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId)
      .populate('modelTrainer')
      .populate('dataProviders.user');

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

// New controller function to delete dataset folder
const deleteDatasetFolder = async (req, res) => {
  try {
    const { projectId, datasetFolder } = req.params;
    const { userId } = req.body; // Assuming userId is sent in the body for authorization

    if (!projectId || !datasetFolder || !userId) {
      return res.status(400).json({ error: 'Project ID, Dataset Folder, and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId).populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Find the data provider
    const provider = training.dataProviders.find(dp => dp.user._id.toString() === userId);

    if (!provider) {
      return res.status(403).json({ error: 'You are not authorized to delete datasets for this project' });
    }

    if (provider.datasetFolder !== datasetFolder) {
      return res.status(400).json({ error: 'Dataset folder does not match' });
    }

    const folderPath = path.join(__dirname, '../assets/DatasetUploads', datasetFolder);

    // Remove the directory and its contents
    await fs.rm(folderPath, { recursive: true, force: true });

    // Update the provider's datasetFolder field
    provider.datasetFolder = null;
    await training.save();

    res.status(200).json({ message: 'Dataset deleted successfully', training });
  } catch (err) {
    console.error('Error deleting dataset folder:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// New controller function to count files in a dataset folder
const countFilesInFolder = async (req, res) => {
  try {
    const { datasetFolder } = req.body;

    if (!datasetFolder) {
      return res.status(400).json({ error: 'Dataset folder is required' });
    }

    const folderPath = path.join(__dirname, '../assets/DatasetUploads', datasetFolder);

    // Check if the folder exists
    try {
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Provided path is not a directory' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Dataset folder not found' });
    }

    // Function to recursively count files
    const countFiles = async (dir) => {
      let count = 0;
      const files = await fs.readdir(dir, { withFileTypes: true });
      for (const file of files) {
        const res = path.resolve(dir, file.name);
        if (file.isDirectory()) {
          count += await countFiles(res);
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

const getTrainerProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!projectId || !userId) {
      return res.status(400).json({ error: 'Project ID and User ID are required' });
    }

    const training = await FederatedTraining.findById(projectId)
      .populate('modelTrainer')
      .populate('dataProviders.user');

    if (!training) {
      return res.status(404).json({ error: 'Federated training project not found' });
    }

    // Verify that the requesting user is the model trainer
    if (training.modelTrainer._id.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to view this project' });
    }

    // Function to recursively count files in a directory
    const countFiles = async (dir) => {
      let count = 0;
      try {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const res = path.resolve(dir, file.name);
          if (file.isDirectory()) {
            count += await countFiles(res);
          } else {
            count += 1;
          }
        }
      } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
      }
      return count;
    };

    const dataProvidersInfo = await Promise.all(
      training.dataProviders.map(async (provider) => {
        let fileCount = 0;
        if (provider.datasetFolder) {
          const folderPath = path.join(__dirname, '../assets/DatasetUploads', provider.datasetFolder);
          fileCount = await countFiles(folderPath);
        }

        return {
          name: provider.user.name,
          email: provider.user.email,
          status: provider.status,
          filesUploaded: provider.datasetFolder ? fileCount : 0,
          datasetDescription: provider.datasetDescription || '',
        };
      })
    );

    // Prepare the response object
    const trainerProjectDetails = {
      projectName: training.projectName,
      description: training.description,
      dataProviders: dataProvidersInfo,
      createdAt: training.createdAt,
    };

    res.status(200).json({ trainerProjectDetails });
  } catch (err) {
    console.error('Error fetching trainer project details:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new training session with an uploaded notebook
const createTrainingSession = async (req, res) => {
  const { projectId } = req.params;
  const { sessionName } = req.body;
  const notebook = req.file;

  if (!notebook) {
    return res.status(400).json({ error: 'Notebook file is required.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Generate a session name if not provided
    const newSessionName = sessionName || `Training Session ${federatedTraining.trainingHistory.length + 1}`;

    // Create a new training session
    const newTrainingSession = {
      sessionName: newSessionName,
      notebookPath: notebook.path,
      files: [], // Initially empty; files can be uploaded later
    };

    federatedTraining.trainingHistory.push(newTrainingSession);
    await federatedTraining.save();

    res.status(201).json({
      message: 'Training session created successfully.',
      trainingSession: federatedTraining.trainingHistory[federatedTraining.trainingHistory.length - 1],
    });
  } catch (error) {
    console.error('Error creating training session:', error);
    res.status(500).json({ error: 'An error occurred while creating the training session.' });
  }
};

// List all training sessions (Training History) for a project
const listTrainingHistory = async (req, res) => {
  const { projectId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId).populate('dataProviders.user', 'name email');

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.status(200).json({
      trainingHistory: federatedTraining.trainingHistory,
    });
  } catch (error) {
    console.error('Error listing training history:', error);
    res.status(500).json({ error: 'An error occurred while fetching training history.' });
  }
};

// Get details of a specific training session
const getTrainingSessionDetails = async (req, res) => {
  const { projectId, trainingId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.id(trainingId);

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    res.status(200).json({
      trainingSession,
    });
  } catch (error) {
    console.error('Error fetching training session details:', error);
    res.status(500).json({ error: 'An error occurred while fetching training session details.' });
  }
};

// Upload additional files to a training session
const uploadFilesToTraining = async (req, res) => {
  const { projectId, trainingId } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'At least one file is required to upload.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.id(trainingId);

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Add each uploaded file to the training session's files array
    files.forEach((file) => {
      trainingSession.files.push({
        filename: file.originalname,
        filepath: file.path,
      });
    });

    await federatedTraining.save();

    res.status(200).json({
      message: 'Files uploaded successfully.',
      files: trainingSession.files,
    });
  } catch (error) {
    console.error('Error uploading files to training session:', error);
    res.status(500).json({ error: 'An error occurred while uploading files to the training session.' });
  }
};

// Download a specific file from a training session
const downloadFileFromTraining = async (req, res) => {
  const { projectId, trainingId, fileId } = req.params;

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.id(trainingId);

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    const file = trainingSession.files.id(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Implement any necessary checks to ensure the file does not violate data privacy
    // For example, restrict downloading of certain file types or sensitive files

    const filePath = path.resolve(file.filepath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File does not exist on the server.' });
    }

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

// Analyze a code cell before execution using GPT-4
const analyzeCodeCell = async (req, res) => {
  const { projectId, trainingId } = req.params;
  const { codeCell } = req.body;

  if (!codeCell || typeof codeCell !== 'string') {
    return res.status(400).json({ error: 'Valid code cell content is required.' });
  }

  try {
    const federatedTraining = await FederatedTraining.findById(projectId);

    if (!federatedTraining) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const trainingSession = federatedTraining.trainingHistory.id(trainingId);

    if (!trainingSession) {
      return res.status(404).json({ error: 'Training session not found.' });
    }

    // Craft the prompt for GPT-4
    const prompt = `
You are a security assistant. Analyze the following Python code cell and determine if it accesses or prints raw data from data providers. 
Respond with "APPROVED" if the code does not access or print any raw data, or "FLAGGED" followed by a brief explanation if it does.

Code Cell:
${codeCell}
`;

    // Call GPT-4 API
    const response = await openai.createCompletion({
      model: 'text-davinci-004', // Use the appropriate GPT-4 model identifier
      prompt: prompt,
      max_tokens: 150,
      temperature: 0,
    });

    const gptOutput = response.data.choices[0].text.trim();

    if (gptOutput.startsWith('APPROVED')) {
      return res.status(200).json({ status: 'approved' });
    } else if (gptOutput.startsWith('FLAGGED')) {
      const feedback = gptOutput.replace('FLAGGED', '').trim();
      return res.status(200).json({ status: 'flagged', feedback });
    } else {
      // Handle unexpected responses
      return res.status(500).json({ error: 'Unexpected response from code analysis.' });
    }
  } catch (error) {
    console.error('Error analyzing code cell:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the code cell.' });
  }
};



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
  createTrainingSession,
  listTrainingHistory,
  getTrainingSessionDetails,
  uploadFilesToTraining,
  downloadFileFromTraining,
  analyzeCodeCell,
};

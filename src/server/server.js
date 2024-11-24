// src/server.js

const express = require('express');
const cors = require('cors');
const connectToDatabase = require('../db/db');
const path = require('path');

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/UserImageUpload', express.static(path.join(__dirname, '../assets/UserImageUpload')));
app.use('/DatasetUploads', express.static(path.join(__dirname, '../assets/DatasetUploads'))); // Serve dataset uploads

// Connect to MongoDB
connectToDatabase();

// Routes
const userRoutes = require('../api/userRoutes');
const datasetRoutes = require('../api/datasetRoutes'); // Import dataset routes
const federatedTrainingRoutes = require('../api/federatedTrainingRoutes');

app.use('/api/users', userRoutes);
app.use('/api/datasets', datasetRoutes); // Use dataset routes
app.use('/api/federated-training', federatedTrainingRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

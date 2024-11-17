const express = require('express');
const cors = require('cors');
const connectToDatabase = require('../db/db');
const path = require('path');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/UserImageUpload', express.static(path.join(__dirname, '../assets/UserImageUpload')));

// Connect to MongoDB
connectToDatabase();

// Routes
const userRoutes = require('../api/userRoutes');
const datasetRoutes = require('../api/datasetRoutes'); // Import dataset routes

app.use('/api/users', userRoutes);
app.use('/api/datasets', datasetRoutes); // Use dataset routes

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

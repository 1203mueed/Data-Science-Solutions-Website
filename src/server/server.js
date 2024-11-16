const express = require('express');
const cors = require('cors'); // Add this line
const connectToDatabase = require('../db/db');

const app = express();

// Enable CORS
app.use(cors()); // Add this line
app.use(express.json());

// Connect to MongoDB
connectToDatabase();

// Example user routes
const userRoutes = require('../api/userRoutes');
app.use('/api/users', userRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

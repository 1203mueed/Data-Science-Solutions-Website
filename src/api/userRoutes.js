const express = require('express');
const multer = require('multer');
const path = require('path');
const { createUser, loginUser } = require('../controllers/userController');

const router = express.Router();

// Multer setup for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/UserImageUpload')); // New upload path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post('/signup', upload.single('image'), createUser); // Signup with image upload
router.post('/login', loginUser); // Login

module.exports = router;

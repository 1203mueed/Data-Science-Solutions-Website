const express = require('express');
const multer = require('multer');
const { createUser } = require('../controllers/userController');

const router = express.Router();

// Multer setup for handling image uploads
const upload = multer({ dest: 'uploads/' });

router.post('/signup', upload.single('image'), createUser);

module.exports = router;

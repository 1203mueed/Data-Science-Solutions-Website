const User = require('../db/models/userModel');
const path = require('path');
const bcrypt = require('bcrypt'); // Ensure bcrypt is required for password hashing

// Signup controller
const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Set image path if uploaded, otherwise null
    const image = req.file
      ? `http://localhost:5000/UserImageUpload/${req.file.filename}`
      : null;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({
      email,
      password: hashedPassword,
      image,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login controller
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Respond with user info, including userId
    res.status(200).json({
      userId: user._id, // Include userId
      email: user.email,
      image: user.image,
      plan: user.plan,
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createUser, loginUser };

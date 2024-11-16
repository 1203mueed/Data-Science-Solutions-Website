const User = require('../db/models/userModel');

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const image = req.file ? req.file.path : null;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create and save the new user
    const user = new User({
      email,
      password,
      image,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' }); // Success response
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' }); // Error response
  }
};

module.exports = { createUser };

const mongoose = require('./db');
const User = require('./models/userModel');

async function testUserModel() {
  try {
    // Test user creation
    const user = new User({
      email: 'testuser@example.com',
      password: 'testpassword',
      image: null,
      plan: 'free',
    });

    await user.save();
    console.log('Test user created:', user);

    // Fetch user from database
    const fetchedUser = await User.findOne({ email: 'testuser@example.com' });
    console.log('Fetched user:', fetchedUser);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error testing user model:', error);
    mongoose.connection.close();
  }
}

testUserModel();

const User = require('./models/userModel');

async function testUserModel() {
  try {
    // Create a new user
    const newUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      image: null,
    });

    console.log('User created successfully:', newUser);

    // Fetch all users
    const allUsers = await User.find();
    console.log('All users:', allUsers);
  } catch (error) {
    console.error('Error testing user model:', error);
  }
}

testUserModel();

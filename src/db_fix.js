const mongoose = require('mongoose');
const User = require('./db/models/userModel'); // Adjust the path to your userModel

const deleteAllUsers = async () => {
  try {
    // Connect to the database
    await mongoose.connect('mongodb+srv://abdulmueed1203:mueedmueed@499testing.t0r2x.mongodb.net/499testing?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB!');

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from the database.`);

    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Error deleting users:', err);
    process.exit(1);
  }
};

deleteAllUsers();

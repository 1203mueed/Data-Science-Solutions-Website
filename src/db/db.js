// const mongoose = require('mongoose');

// // Replace with your MongoDB connection string
// const uri = "mongodb+srv://abdulmueed1203:mueedmueed@499testing.t0r2x.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Connected to MongoDB!'))
//   .catch((error) => console.error('Error connecting to MongoDB:', error));

// // Export Mongoose for models
// module.exports = mongoose;


const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb+srv://abdulmueed1203:mueedmueed@499testing.t0r2x.mongodb.net/499testing?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectToDatabase;



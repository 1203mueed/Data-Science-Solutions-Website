const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String }, // Optional profile image
  plan: { type: String, default: 'free' },
  notebooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notebook' }],
  datasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' }],
  papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }],
  federatedTrainingsAsTrainer: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'FederatedTraining' },
  ], // Projects where the user is a model trainer
  federatedTrainingsAsProvider: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'FederatedTraining' },
  ], // Projects where the user is a data provider
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

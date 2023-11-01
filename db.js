const mongoose = require('mongoose');

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Successfully connected MongoDB');
  } catch (err) {
    console.log('Error connecting to MongoDB');
  }
}

module.exports = connectMongoDB;

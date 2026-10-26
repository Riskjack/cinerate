const mongoose = require('mongoose');

// Connects to MongoDB using the MONGO_URI from the .env file.
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env first.');
  }
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
};

module.exports = connectDB;

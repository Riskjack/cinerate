// Run with:  npm run seed
// Wipes the movie and review collections and re-inserts the sample movies.
// User accounts are NOT touched.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const movies = require('./movies');

(async () => {
  try {
    await connectDB();
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log(`Inserted ${movies.length} sample movies.`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

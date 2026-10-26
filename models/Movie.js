const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  genre: { type: String, required: true, trim: true },
  releaseYear: { type: Number, required: true, min: 1888, max: 2100 },
  posterUrl: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

movieSchema.index({ title: 'text' });

module.exports = mongoose.model('Movie', movieSchema);

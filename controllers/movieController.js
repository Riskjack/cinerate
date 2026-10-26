const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { validateMovie } = require('../utils/validate');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/movies?search=&genre=&sort=rating|year|newest|title&order=asc|desc
// Returns every movie together with its average rating and review count.
exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre, sort, order } = req.query;
    const match = {};
    if (search && search.trim()) match.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (genre && genre !== 'All') match.genre = genre;

    const dir = order === 'asc' ? 1 : -1;
    const sortStage = {
      rating: { averageRating: dir, reviewCount: -1 },
      year: { releaseYear: dir },
      title: { title: order === 'desc' ? -1 : 1 },
    }[sort] || { createdAt: -1 };

    const movies = await Movie.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'movieId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' },
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $round: [{ $avg: '$reviews.rating' }, 1] },
              0,
            ],
          },
        },
      },
      { $project: { reviews: 0 } },
      { $sort: sortStage },
    ]);

    res.json(movies);
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/genres  -> list of distinct genres for the filter dropdown
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genre');
    res.json(genres.sort());
  } catch (err) {
    next(err);
  }
};

// GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });

    const [stats] = await Review.aggregate([
      { $match: { movieId: movie._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    res.json({
      ...movie.toObject(),
      averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
      reviewCount: stats ? stats.count : 0,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/movies  (login required)
exports.createMovie = async (req, res, next) => {
  try {
    const errors = validateMovie(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const { title, description, genre, releaseYear, posterUrl } = req.body;
    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      genre: genre.trim(),
      releaseYear: Number(releaseYear),
      posterUrl: posterUrl.trim(),
    });
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

// PUT /api/movies/:id  (login required)
exports.updateMovie = async (req, res, next) => {
  try {
    const errors = validateMovie(req.body, true);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const allowed = ['title', 'description', 'genre', 'releaseYear', 'posterUrl'];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    const movie = await Movie.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};


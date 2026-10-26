const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { validateReview } = require('../utils/validate');

// GET /api/movies/:movieId/reviews  (public)
exports.getReviewsForMovie = async (req, res, next) => {
  try {
    const reviews = await Review.find({ movieId: req.params.movieId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/movies/:movieId/reviews  (login required)
// One review per user per movie: if one already exists it is UPDATED instead.
exports.upsertReview = async (req, res, next) => {
  try {
    const errors = validateReview(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const movie = await Movie.findById(req.params.movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });

    const existing = await Review.findOne({ userId: req.user._id, movieId: movie._id });
    let review;
    let created = false;

    if (existing) {
      existing.rating = Number(req.body.rating);
      existing.comment = (req.body.comment || '').trim();
      review = await existing.save();
    } else {
      review = await Review.create({
        userId: req.user._id,
        movieId: movie._id,
        rating: Number(req.body.rating),
        comment: (req.body.comment || '').trim(),
      });
      created = true;
    }

    await review.populate('userId', 'name');
    res.status(created ? 201 : 200).json(review);
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id  (login required, owner only)
exports.updateReview = async (req, res, next) => {
  try {
    const errors = validateReview(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(' ') });

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }

    review.rating = Number(req.body.rating);
    review.comment = (req.body.comment || '').trim();
    await review.save();
    await review.populate('userId', 'name');
    res.json(review);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reviews/:id  (login required, owner only)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};

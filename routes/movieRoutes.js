const router = require('express').Router();
const {
  getMovies, getGenres, getMovieById, createMovie, updateMovie,
} = require('../controllers/movieController');
const { getReviewsForMovie, upsertReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getMovies);
router.get('/genres', getGenres); // must come before '/:id'
router.post('/', protect, createMovie);

router.get('/:id', getMovieById);
router.put('/:id', protect, updateMovie);

// Reviews that belong to a movie
router.get('/:movieId/reviews', getReviewsForMovie);
router.post('/:movieId/reviews', protect, upsertReview);

module.exports = router;

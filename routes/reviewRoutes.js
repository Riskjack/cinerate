const router = require('express').Router();
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

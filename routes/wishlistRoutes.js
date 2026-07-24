const express = require('express');
const router = express.Router();

const {
  getWishlist,
  toggleWishlist
} = require('../controllers/wishlistController');

const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getWishlist);
router.post('/toggle', verifyToken, toggleWishlist);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  loginUser,
  getProfile
} = require('../controllers/authController');

const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerCustomer);
router.post('/login', authLimiter, loginUser);
router.get('/me', verifyToken, getProfile);

module.exports = router;
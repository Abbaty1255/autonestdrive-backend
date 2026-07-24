const express = require('express');
const router = express.Router();

const {
  createCheckoutSession,
  getCustomerReservations
} = require('../controllers/reservationController');

const { verifyToken } = require('../middleware/auth');

router.post('/create-checkout', verifyToken, createCheckoutSession);
router.get('/my-reservations', verifyToken, getCustomerReservations);

module.exports = router;
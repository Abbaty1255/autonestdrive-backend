const stripe = require('../config/stripe');
const db = require('../config/db');
const sendEmail = require('../config/nodemailer');

exports.createCheckoutSession = async (req, res, next) => {
  const { vehicleId } = req.body;
  const customerId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM vehicles WHERE id = $1',
      [vehicleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle unavailable'
      });
    }

    const car = result.rows[0];

    if (car.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Reservation Deposit: ${car.make} ${car.model} (${car.year})`,
              description: `Vehicle ID: ${car.id}`
            },
            unit_amount: 9900
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/?reservation=success`,
      cancel_url: `${process.env.CLIENT_URL}/?reservation=cancelled`,
      metadata: {
        vehicleId: car.id,
        customerId
      }
    });

    res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    next(error);

  }
};
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { vehicleId, customerId } = session.metadata;

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO reservations
        (customer_id, vehicle_id, stripe_session_id, amount_paid, payment_status, reservation_status)
        VALUES ($1, $2, $3, 99.00, 'Paid', 'Active')`,
        [customerId, vehicleId, session.id]
      );

      await client.query(
        `UPDATE vehicles
         SET status='Reserved'
         WHERE id=$1`,
        [vehicleId]
      );

      await client.query('COMMIT');

      const car = (
        await db.query(
          'SELECT * FROM vehicles WHERE id=$1',
          [vehicleId]
        )
      ).rows[0];

      const customer = (
        await db.query(
          'SELECT * FROM customers WHERE id=$1',
          [customerId]
        )
      ).rows[0];
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

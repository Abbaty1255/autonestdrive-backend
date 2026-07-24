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
        message: 'Vehicle not found'
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
              name: `${car.make} ${car.model} (${car.year}) Reservation`
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
        vehicleId,
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
  res.json({
    received: true
  });
};

exports.getCustomerReservations = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, v.make, v.model, v.year, v.price
       FROM reservations r
       JOIN vehicles v
       ON r.vehicle_id = v.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    next(error);
  }
};
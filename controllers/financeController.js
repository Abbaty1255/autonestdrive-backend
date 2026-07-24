const db = require('../config/db');
const sendEmail = require('../config/nodemailer');

exports.submitApplication = async (req, res, next) => {
  const {
    vehicle_id,
    first_name,
    last_name,
    email,
    phone,
    employment_status,
    annual_income,
    residential_address,
    residential_status,
    requested_amount
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO finance_applications
      (customer_id, vehicle_id, first_name, last_name, email, phone, employment_status, annual_income, residential_address, residential_status, requested_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        req.user ? req.user.id : null,
        vehicle_id,
        first_name,
        last_name,
        email,
        phone,
        employment_status,
        annual_income,
        residential_address,
        residential_status,
        requested_amount
      ]
    );

    await sendEmail({
      to: email,
      subject: 'Finance Application Received',
      html: `<h3>Thank you ${first_name}</h3>
      <p>Your finance application has been received and is under review.</p>`
    });

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerApplications = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM finance_applications
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
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
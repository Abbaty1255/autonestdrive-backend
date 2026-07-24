const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../config/nodemailer');

exports.registerCustomer = async (req, res, next) => {
  const { full_name, email, phone, address, password } = req.body;

  try {
    const existing = await db.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO customers
      (full_name,email,phone,address,password_hash)
      VALUES($1,$2,$3,$4,$5)
      RETURNING id,full_name,email,phone,address,created_at`,
      [full_name, email, phone, address, password_hash]
    );

    const customer = result.rows[0];

    const token = jwt.sign(
      {
        id: customer.id,
        role: 'customer',
        email: customer.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    await sendEmail({
      to: customer.email,
      subject: 'Welcome to AutoNest Drive',
      html: `<h2>Welcome ${customer.full_name}</h2>
      <p>Your account has been created successfully.</p>`
    });

    res.status(201).json({
      success: true,
      token,
      user: customer
    });

  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {

    const admin = await db.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    if (admin.rows.length > 0) {
      const valid = await bcrypt.compare(
        password,
        admin.rows[0].password_hash
      );

      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        {
          id: admin.rows[0].id,
          role: 'admin',
          email: admin.rows[0].email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        success: true,
        token,
        role: 'admin',
        user: admin.rows[0]
      });
    }

    const customer = await db.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (customer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const valid = await bcrypt.compare(
      password,
      customer.rows[0].password_hash
    );

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: customer.rows[0].id,
        role: 'customer',
        email: customer.rows[0].email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    delete customer.rows[0].password_hash;

    res.json({
      success: true,
      token,
      role: 'customer',
      user: customer.rows[0]
    });

  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {

    if (req.user.role === 'admin') {
      const admin = await db.query(
        'SELECT id,full_name,email,role FROM admin_users WHERE id=$1',
        [req.user.id]
      );

      return res.json({
        success: true,
        user: admin.rows[0]
      });
    }

    const customer = await db.query(
      'SELECT id,full_name,email,phone,address,created_at FROM customers WHERE id=$1',
      [req.user.id]
    );

    res.json({
      success: true,
      user: customer.rows[0]
    });

  } catch (error) {
    next(error);
  }
};
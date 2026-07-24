const db = require('../config/db');
const sendEmail = require('../config/nodemailer');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalVehicles = (await db.query('SELECT COUNT(*) FROM vehicles')).rows[0].count;
    const totalCustomers = (await db.query('SELECT COUNT(*) FROM customers')).rows[0].count;
    const totalReservations = (await db.query('SELECT COUNT(*) FROM reservations')).rows[0].count;
    const pendingFinance = (
      await db.query("SELECT COUNT(*) FROM finance_applications WHERE status = 'Under Review'")
    ).rows[0].count;

    res.json({
      success: true,
      stats: {
        totalVehicles: Number(totalVehicles),
        totalCustomers: Number(totalCustomers),
        totalReservations: Number(totalReservations),
        pendingFinance: Number(pendingFinance)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, phone, address, created_at FROM customers ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getFinanceApplications = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT f.*, v.make, v.model
       FROM finance_applications f
       LEFT JOIN vehicles v ON f.vehicle_id = v.id
       ORDER BY f.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservations = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, c.full_name AS customer_name, c.email AS customer_email,
              v.make, v.model
       FROM reservations r
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN vehicles v ON r.vehicle_id = v.id
       ORDER BY r.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.addVehicle = async (req, res) => {
  res.json({
    success: true,
    message: 'Add vehicle endpoint ready'
  });
};

exports.updateVehicle = async (req, res) => {
  res.json({
    success: true,
    message: 'Update vehicle endpoint ready'
  });
};

exports.deleteVehicle = async (req, res) => {
  res.json({
    success: true,
    message: 'Delete vehicle endpoint ready'
  });
};

exports.updateFinanceStatus = async (req, res) => {
  res.json({
    success: true,
    message: 'Finance status update endpoint ready'
  });
};
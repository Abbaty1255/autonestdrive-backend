const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  updateFinanceStatus,
  getCustomers,
  getFinanceApplications,
  getReservations
} = require('../controllers/adminController');

const { verifyAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.use(verifyAdmin);

router.get('/stats', getDashboardStats);

router.post('/vehicles', upload.array('images', 10), addVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', deleteVehicle);

router.get('/customers', getCustomers);

router.get('/finance', getFinanceApplications);
router.patch('/finance/:id', updateFinanceStatus);

router.get('/reservations', getReservations);

module.exports = router;
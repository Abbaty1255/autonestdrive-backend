const express = require('express');
const router = express.Router();

const {
  submitApplication,
  getCustomerApplications
} = require('../controllers/financeController');

const { verifyToken } = require('../middleware/auth');

router.post('/apply', submitApplication);
router.get('/my-applications', verifyToken, getCustomerApplications);

module.exports = router;
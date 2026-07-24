require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

try {
  app.use('/api/vehicles', require('./routes/vehicleRoutes'));
} catch (err) {}

try {
  app.use('/api/reservations', require('./routes/reservationRoutes'));
} catch (err) {}

try {
  app.use('/api/finance', require('./routes/financeRoutes'));
} catch (err) {}

try {
  app.use('/api/wishlist', require('./routes/wishlistRoutes'));
} catch (err) {}

try {
  app.use('/api/admin', require('./routes/adminRoutes'));
} catch (err) {}

try {
  app.use('/api/contact', require('./routes/contactRoutes'));
} catch (err) {}

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AutoNest Drive Backend is running.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

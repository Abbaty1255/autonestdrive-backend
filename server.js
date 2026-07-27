require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Test email settings
console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
console.log("SMTP USER:", process.env.SMTP_USER);
console.log("EMAIL FROM:", process.env.EMAIL_FROM);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AutoNest Drive Backend is running.'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
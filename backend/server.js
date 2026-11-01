const express = require('express');
const cors = require('cors');
const { seedRestaurants } = require('./seed/seedRestaurants');

const restaurantRoutes = require('./routes/restaurants');
const bookingRoutes   = require('./routes/bookings');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Request logger (dev) ──────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

// ── Seed database on startup ──────────────────────────────────────────────────
seedRestaurants();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders',      bookingRoutes);   // backward compat with frontend
app.use('/api/bookings',    bookingRoutes);   // REST alias

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 DineSpot backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;

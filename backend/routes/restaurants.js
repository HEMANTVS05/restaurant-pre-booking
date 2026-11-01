// routes/restaurants.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');

// Helper: parse tags JSON safely
const parseRestaurant = (r) => ({
  ...r,
  tags: (() => { try { return JSON.parse(r.tags || '[]'); } catch { return []; } })(),
  availableTables: r.available_tables,
  totalTables: r.total_tables,
  availableSeats: r.available_seats,
  totalSeats: r.total_seats,
  image: r.image_url,
  priceRange: r.price_range,
  openTime: r.open_time,
  closeTime: r.close_time,
});

// GET /api/restaurants  (optionally filter by ?region=...)
router.get('/', (req, res) => {
  try {
    const { region, q } = req.query;
    let stmt, rows;

    if (region) {
      stmt = db.prepare(`SELECT * FROM restaurants WHERE LOWER(region) LIKE LOWER(?)  ORDER BY rating DESC`);
      rows = stmt.all(`%${region}%`);
    } else if (q) {
      stmt = db.prepare(`SELECT * FROM restaurants WHERE LOWER(region) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?) ORDER BY rating DESC`);
      rows = stmt.all(`%${q}%`, `%${q}%`);
    } else {
      rows = db.prepare('SELECT * FROM restaurants ORDER BY rating DESC').all();
    }

    res.json(rows.map(parseRestaurant));
  } catch (err) {
    console.error('GET /restaurants error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

// GET /api/restaurants/:id
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json(parseRestaurant(row));
  } catch (err) {
    console.error('GET /restaurants/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant' });
  }
});

module.exports = router;

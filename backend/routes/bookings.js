// routes/bookings.js
const express = require('express');
const router = express.Router();
const db = require('../database/database');

// POST /api/orders
// Body: { userEmail, orderDetails: { restaurantId, date, time, people, menuItems } }
router.post('/', (req, res) => {
  const { userEmail, orderDetails } = req.body;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!userEmail) return res.status(400).json({ success: false, message: 'userEmail is required' });
  if (!orderDetails) return res.status(400).json({ success: false, message: 'orderDetails is required' });

  const { restaurantId, date, time, people, menuItems } = orderDetails;

  if (!restaurantId) return res.status(400).json({ success: false, message: 'restaurantId is required' });
  if (!date) return res.status(400).json({ success: false, message: 'date is required' });
  if (!time) return res.status(400).json({ success: false, message: 'time is required' });

  const guests = parseInt(people, 10);
  if (isNaN(guests) || guests < 1 || guests > 20) {
    return res.status(400).json({ success: false, message: 'guests must be between 1 and 20' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // ── Check restaurant exists ───────────────────────────────────────────────
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(restaurantId);
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found' });
  }

  // ── Find best available table and book atomically ─────────────────────────
  const bookingTx = db.transaction(() => {
    // IDs of tables already booked for this slot
    const bookedRows = db.prepare(`
      SELECT table_id FROM bookings
      WHERE restaurant_id = ? AND booking_date = ? AND booking_time = ?
        AND status != 'cancelled'
    `).all(restaurantId, date, time);

    const bookedIds = bookedRows.map(b => b.table_id);

    // Build query depending on whether any tables are already booked
    let availableTable;
    if (bookedIds.length === 0) {
      // No bookings yet – all tables are free
      availableTable = db.prepare(`
        SELECT * FROM restaurant_tables
        WHERE restaurant_id = ? AND capacity >= ?
        ORDER BY capacity ASC
        LIMIT 1
      `).get(restaurantId, guests);
    } else {
      // Exclude already-booked table IDs
      const placeholders = bookedIds.map(() => '?').join(',');
      availableTable = db.prepare(`
        SELECT * FROM restaurant_tables
        WHERE restaurant_id = ? AND capacity >= ?
          AND id NOT IN (${placeholders})
        ORDER BY capacity ASC
        LIMIT 1
      `).get(restaurantId, guests, ...bookedIds);
    }

    if (!availableTable) {
      return {
        success: false,
        status: 409,
        message: 'No table available for the selected time slot and guest count'
      };
    }

    // Insert the booking
    const result = db.prepare(`
      INSERT INTO bookings
        (user_email, restaurant_id, table_id, booking_date, booking_time, guests, menu_items, location, fee_amount, payment_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 50.0, 'paid', 'pending')
    `).run(
      userEmail,
      restaurantId,
      availableTable.id,
      date,
      time,
      guests,
      JSON.stringify(menuItems || []),
      restaurant.region
    );

    return {
      success: true,
      bookingId: result.lastInsertRowid,
      tableNumber: availableTable.table_number,
      tableCapacity: availableTable.capacity,
      feeAmount: 50.0,
      paymentStatus: 'paid',
      message: `Table ${availableTable.table_number} booked successfully. Status is Pending Approval.`
    };
  });

  try {
    const result = bookingTx();
    return res.status(result.status || 200).json(result);
  } catch (err) {
    console.error('POST /orders error:', err);
    return res.status(500).json({ success: false, message: 'Unexpected error processing booking' });
  }
});

// GET /api/orders?email=...  – all bookings for a user
router.get('/', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'email query param required' });

  try {
    const rows = db.prepare(`
      SELECT b.*,
             r.name       AS restaurant_name,
             r.address    AS restaurant_address,
             rt.table_number,
             rt.capacity
      FROM   bookings b
      JOIN   restaurants r  ON b.restaurant_id = r.id
      LEFT   JOIN restaurant_tables rt ON b.table_id = rt.id
      WHERE  b.user_email = ?
      ORDER  BY b.created_at DESC
    `).all(email);

    const parsed = rows.map(b => ({
      ...b,
      menu_items: (() => { try { return JSON.parse(b.menu_items || '[]'); } catch { return []; } })()
    }));

    res.json(parsed);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// GET /api/orders/admin - fetch all bookings for admin
router.get('/admin', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT b.*,
             r.name       AS restaurant_name,
             r.address    AS restaurant_address,
             rt.table_number,
             rt.capacity
      FROM   bookings b
      JOIN   restaurants r  ON b.restaurant_id = r.id
      LEFT   JOIN restaurant_tables rt ON b.table_id = rt.id
      ORDER  BY b.created_at DESC
    `).all();

    const parsed = rows.map(b => ({
      ...b,
      menu_items: (() => { try { return JSON.parse(b.menu_items || '[]'); } catch { return []; } })()
    }));

    res.json(parsed);
  } catch (err) {
    console.error('GET /orders/admin error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin bookings' });
  }
});

// PUT /api/orders/:id/status - update booking status (admin)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ success: false, message: 'status is required' });

  try {
    const result = db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (err) {
    console.error('PUT /orders/:id/status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

module.exports = router;

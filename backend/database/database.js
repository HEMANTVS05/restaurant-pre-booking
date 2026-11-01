const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'dinespot.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
// Enforce foreign keys
db.pragma('foreign_keys = ON');

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    region           TEXT NOT NULL,
    address          TEXT,
    cuisine          TEXT,
    rating           REAL DEFAULT 0,
    total_tables     INTEGER DEFAULT 0,
    available_tables INTEGER DEFAULT 0,
    total_seats      INTEGER DEFAULT 0,
    available_seats  INTEGER DEFAULT 0,
    image_url        TEXT,
    price_range      TEXT,
    tags             TEXT,
    open_time        TEXT,
    close_time       TEXT,
    phone            TEXT,
    lat              REAL,
    lng              REAL,
    created_at       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS restaurant_tables (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number  INTEGER NOT NULL,
    capacity      INTEGER NOT NULL,
    status        TEXT DEFAULT 'available'
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email    TEXT NOT NULL,
    restaurant_id TEXT NOT NULL REFERENCES restaurants(id),
    table_id      INTEGER REFERENCES restaurant_tables(id),
    booking_date  TEXT NOT NULL,
    booking_time  TEXT NOT NULL,
    guests        INTEGER NOT NULL,
    menu_items    TEXT,
    location      TEXT,
    fee_amount    REAL DEFAULT 50.0,
    payment_status TEXT DEFAULT 'pending',
    status        TEXT DEFAULT 'pending',
    created_at    TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;

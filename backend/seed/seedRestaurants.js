// seed/seedRestaurants.js
// Idempotent seed – skips restaurants that already exist in SQLite.

const db = require('../database/database');
const { RESTAURANTS_DB } = require('../data');

function seedRestaurants() {
  const insertRestaurant = db.prepare(`
    INSERT OR IGNORE INTO restaurants
      (id, name, region, address, cuisine, rating, total_tables, available_tables,
       total_seats, available_seats, image_url, price_range, tags,
       open_time, close_time, phone, lat, lng)
    VALUES
      (@id, @name, @region, @address, @cuisine, @rating, @totalTables, @availableTables,
       @totalSeats, @availableSeats, @image, @priceRange, @tags,
       @openTime, @closeTime, @phone, @lat, @lng)
  `);

  const insertTable = db.prepare(`
    INSERT OR IGNORE INTO restaurant_tables (restaurant_id, table_number, capacity)
    SELECT @restaurantId, @tableNumber, @capacity
    WHERE NOT EXISTS (
      SELECT 1 FROM restaurant_tables
      WHERE restaurant_id = @restaurantId AND table_number = @tableNumber
    )
  `);

  const seedAll = db.transaction(() => {
    let seeded = 0;
    for (const r of RESTAURANTS_DB) {
      const result = insertRestaurant.run({
        id: r.id,
        name: r.name,
        region: r.region,
        address: r.address,
        cuisine: r.cuisine,
        rating: r.rating,
        totalTables: r.totalTables,
        availableTables: r.availableTables,
        totalSeats: r.totalSeats,
        availableSeats: r.availableSeats,
        image: r.image,
        priceRange: r.priceRange,
        tags: JSON.stringify(r.tags),
        openTime: r.openTime,
        closeTime: r.closeTime,
        phone: r.phone,
        lat: r.lat,
        lng: r.lng
      });

      if (result.changes > 0) {
        seeded++;
        // Generate sensible tables for each restaurant
        const tableSizes = [2, 2, 4, 4, 4, 6, 6];
        for (let i = 0; i < r.totalTables; i++) {
          insertTable.run({
            restaurantId: r.id,
            tableNumber: i + 1,
            capacity: tableSizes[i % tableSizes.length]
          });
        }
      }
    }
    return seeded;
  });

  const seeded = seedAll();
  if (seeded > 0) {
    console.log(`✅ Seeded ${seeded} restaurants into SQLite`);
  } else {
    console.log('✅ Restaurant data already present – skipped seed');
  }
}

module.exports = seedRestaurants;

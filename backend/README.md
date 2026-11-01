# DineSpot Backend

## Tech Stack
- **Node.js** + **Express.js**
- **SQLite** via `better-sqlite3`

## How to Run

```bash
cd backend
npm install
npm run dev        # starts server on http://localhost:5000
```

## Database

The SQLite database is stored at:
```
backend/database/dinespot.db
```

Tables are **auto-created** when the server starts. No manual setup needed.

Restaurant seed data is migrated from `data.js` **idempotently** (only inserted if not already present).

## Schema

| Table                | Purpose                          |
|----------------------|----------------------------------|
| `restaurants`        | Restaurant listing               |
| `restaurant_tables`  | Individual tables per restaurant |
| `bookings`           | Customer reservations            |
| `users`              | User accounts (future use)       |

## API Endpoints

| Method | Route                        | Description                      |
|--------|------------------------------|----------------------------------|
| GET    | `/api/restaurants`           | All restaurants                  |
| GET    | `/api/restaurants?q=adyar`   | Filter by region/name            |
| GET    | `/api/restaurants/:id`       | Single restaurant                |
| POST   | `/api/orders`                | Create a booking                 |
| GET    | `/api/orders?email=x@y.com`  | Fetch bookings for a user        |

### POST /api/orders – Example

```json
{
  "userEmail": "user@example.com",
  "orderDetails": {
    "restaurantId": "ann001",
    "date": "2026-10-15",
    "time": "19:30",
    "people": "4",
    "menuItems": ["Paneer Butter Masala", "Dal Makhani"]
  }
}
```

## Inspecting the Database

Use **DB Browser for SQLite** (free): https://sqlitebrowser.org/  
Open `backend/database/dinespot.db` to browse tables and run queries.

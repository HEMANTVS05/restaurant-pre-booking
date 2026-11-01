# DineSpot: Architecture Diagrams & Visual Reference
**Supplement to Comprehensive_Project_Info.md**

---

## 1. Full Folder / File Structure

```
Restaurant Pre-Booking Website/
│
├── frontend/                         ← React Application (Vite)
│   └── src/
│       ├── main.jsx                  ← Entry point, wraps app in AuthProvider
│       ├── App.jsx                   ← Route definitions
│       ├── index.css                 ← Global design tokens (colors, fonts)
│       │
│       ├── context/
│       │   └── AuthContext.jsx       ← Global user session state (login/logout)
│       │
│       ├── components/               ← Reusable UI components
│       │   ├── Navbar.jsx / .css     ← Top navigation (links to profile, admin, logout)
│       │   ├── Hero.jsx / .css       ← Landing section with search + region chips
│       │   ├── RestaurantCard.jsx    ← Individual restaurant display card
│       │   └── MapComponent.jsx      ← Leaflet interactive map
│       │
│       └── pages/                    ← Full-page views (1:1 with routes)
│           ├── Home.jsx / .css       ← Discovery page, search results grid
│           ├── Login.jsx / .css      ← Login & Register forms
│           ├── OrderSummary.jsx/.css ← Menu selection + booking form + fee
│           ├── Profile.jsx / .css    ← User booking history
│           └── Admin.jsx / .css      ← Hotel admin dashboard
│
├── backend/                          ← Node.js / Express Server
│   ├── server.js                     ← App entry, middleware, route mounting
│   ├── data.js                       ← Source of truth for restaurant seed data
│   ├── package.json
│   │
│   ├── database/
│   │   ├── database.js               ← SQLite connection, schema, WAL pragma
│   │   └── dinespot.db               ← The actual SQLite database file
│   │
│   ├── seed/
│   │   └── seedRestaurants.js        ← Idempotent seeder (runs once on startup)
│   │
│   └── routes/
│       ├── restaurants.js            ← GET endpoints for restaurant data
│       └── bookings.js               ← POST/GET/PUT endpoints for reservations
│
├── PPT_Content.md                    ← Slide content for review presentation
├── Comprehensive_Project_Info.md     ← This document
└── legacy/                           ← Original HTML/CSS/JS prototype
    └── index.html
```

---

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph Browser["User's Browser (Port 5173)"]
        A["React UI (Vite)"] --> B[React Router DOM]
        B --> P1[Home Page]
        B --> P2[Login Page]
        B --> P3[Order Summary]
        B --> P4[Profile Page]
        B --> P5[Admin Dashboard]
        P1 --> C[AuthContext Provider]
        P3 --> C
        P4 --> C
    end

    subgraph Express["Express.js Server (Port 5000)"]
        E1["GET /api/restaurants"] 
        E2["GET /api/restaurants?q="]
        E3["POST /api/orders"]
        E4["GET /api/orders?email="]
        E5["GET /api/orders/admin"]
        E6["PUT /api/orders/:id/status"]
    end

    subgraph SQLite["SQLite Database (dinespot.db)"]
        T1[(restaurants)]
        T2[(restaurant_tables)]
        T3[(bookings)]
    end

    Browser -- "fetch() API Calls (CORS)" --> Express
    Express -- "SQL Queries (better-sqlite3)" --> SQLite
    T1 --> T2
    T1 --> T3
    T2 --> T3
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    RESTAURANTS {
        text id PK
        text name
        text region
        text address
        real rating
        text cuisine
        real lat
        real lng
    }

    RESTAURANT_TABLES {
        int id PK
        text restaurant_id FK
        int table_number
        int capacity
    }

    BOOKINGS {
        int id PK
        text user_email
        text restaurant_id FK
        int table_id FK
        text booking_date
        text booking_time
        int guests
        text menu_items
        text location
        real fee_amount
        text payment_status
        text status
        text created_at
    }

    RESTAURANTS ||--o{ RESTAURANT_TABLES : "has"
    RESTAURANTS ||--o{ BOOKINGS : "receives"
    RESTAURANT_TABLES ||--o{ BOOKINGS : "is allocated to"
```

---

## 4. Application Data Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant F as React Frontend
    participant B as Express Backend
    participant DB as SQLite DB

    User->>F: Clicks region chip "Anna Nagar"
    F->>B: GET /api/restaurants?q=Anna Nagar
    B->>DB: SELECT * FROM restaurants WHERE region LIKE '%anna nagar%'
    DB-->>B: Returns 3 restaurant rows
    B-->>F: JSON array of restaurants
    F->>F: Updates state → AnimatePresence re-renders grid
    F->>F: Map flyToBounds() to Anna Nagar GPS coordinates

    User->>F: Clicks "Book Now" on a restaurant
    F->>F: Saves restaurant to localStorage
    F->>F: Navigates to /order-summary

    User->>F: Selects menu items, date, time, guests
    User->>F: Clicks "Pay ₹50 & Confirm"
    F->>B: POST /api/orders { userEmail, orderDetails }
    B->>B: Validate inputs
    B->>DB: BEGIN TRANSACTION
    B->>DB: SELECT booked table_ids for this slot
    DB-->>B: Returns booked table list
    B->>DB: SELECT best available table (capacity >= guests, NOT IN booked)
    DB-->>B: Returns Table #3 (capacity 4)
    B->>DB: INSERT INTO bookings (status=pending, payment=paid)
    DB-->>B: Success, booking id=7
    B->>B: COMMIT TRANSACTION
    B-->>F: { success: true, tableNumber: 3, fee: 50.0 }
    F->>F: Shows success confirmation screen
```

---

## 5. Module Dependency Map

```mermaid
graph LR
    AC[AuthContext] --> NB[Navbar]
    AC --> OS[OrderSummary]
    AC --> PR[Profile]
    AC --> AD[Admin]

    HM[Home] --> HR[Hero]
    HM --> RC[RestaurantCard]
    HM --> MP[MapComponent]
    HR -- onSearch prop --> HM
    HM -- filtered list --> MP

    OS -- POST /api/orders --> BK_ROUTE[bookings.js route]
    PR -- GET /api/orders --> BK_ROUTE
    AD -- GET /api/orders/admin --> BK_ROUTE
    AD -- PUT /api/orders/:id/status --> BK_ROUTE
    HM -- GET /api/restaurants --> RS_ROUTE[restaurants.js route]

    BK_ROUTE --> DB[(SQLite DB)]
    RS_ROUTE --> DB
```

---

## 6. Table Allocation Algorithm (Flowchart)

```mermaid
flowchart TD
    A[POST /api/orders received] --> B{Validate inputs}
    B -- Invalid --> C[Return 400 Error]
    B -- Valid --> D{Restaurant exists in DB?}
    D -- No --> E[Return 404 Not Found]
    D -- Yes --> F[BEGIN SQL Transaction]
    F --> G[Query: Get all table_ids booked for this restaurant + date + time]
    G --> H{Any tables already booked?}
    H -- No --> I[Query: SELECT table WHERE capacity >= guests ORDER BY capacity ASC]
    H -- Yes --> J[Query: SELECT table WHERE capacity >= guests AND id NOT IN booked_ids ORDER BY capacity ASC]
    I --> K{Available table found?}
    J --> K
    K -- No --> L[Return 409 Conflict: No table available]
    K -- Yes --> M[INSERT booking row with allocated table_id, status=pending, fee=50, payment=paid]
    M --> N[COMMIT Transaction]
    N --> O[Return 200: success, tableNumber, feeAmount]
```

---

## 7. Booking Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Customer confirms booking (POST /api/orders)
    Pending --> Accepted: Admin clicks Accept
    Pending --> Rejected: Admin clicks Reject
    Accepted --> Completed: Admin marks Completed
    Rejected --> [*]
    Completed --> [*]
```

---

## 8. Page Route Map

| URL Path | Component | Access | Purpose |
|---|---|---|---|
| `/` | `Home.jsx` | Public | Restaurant discovery, search, region filter |
| `/login` | `Login.jsx` | Public | Login / Register / Guest access |
| `/order-summary` | `OrderSummary.jsx` | Logged-in Users | Menu selection, reservation form, fee payment |
| `/profile` | `Profile.jsx` | Logged-in Users | View personal booking history + status |
| `/admin` | `Admin.jsx` | Unrestricted* | Hotel management – accept/reject/complete |

> *In a production app, `/admin` would be protected with role-based authentication.

---

## 9. Key React Components Summary

| Component | File | Role |
|---|---|---|
| `AuthContext` | `context/AuthContext.jsx` | Global user state, login/logout |
| `Navbar` | `components/Navbar.jsx` | Navigation, profile/admin links |
| `Hero` | `components/Hero.jsx` | Search bar, animated region chips |
| `RestaurantCard` | `components/RestaurantCard.jsx` | Individual restaurant UI with "Book Now" |
| `MapComponent` | `components/MapComponent.jsx` | Leaflet map + flyTo animation |
| `Home` | `pages/Home.jsx` | Orchestrator for search + grid + map |
| `Login` | `pages/Login.jsx` | Auth forms |
| `OrderSummary` | `pages/OrderSummary.jsx` | Menu, booking form, fee display |
| `Profile` | `pages/Profile.jsx` | User order history dashboard |
| `Admin` | `pages/Admin.jsx` | Hotel-side reservation management |

---

## 10. Backend API Code Reference

### Restaurant Search (GET)
```js
// routes/restaurants.js
router.get('/', (req, res) => {
  const { q } = req.query;
  if (q) {
    const rows = db.prepare(
      `SELECT * FROM restaurants WHERE region LIKE ? OR name LIKE ? OR cuisine LIKE ?`
    ).all(`%${q}%`, `%${q}%`, `%${q}%`);
    return res.json(rows);
  }
  res.json(db.prepare('SELECT * FROM restaurants').all());
});
```

### Table Allocation Algorithm (POST)
```js
// routes/bookings.js - The core algorithm
const bookedRows = db.prepare(
  `SELECT table_id FROM bookings
   WHERE restaurant_id = ? AND booking_date = ? AND booking_time = ?
   AND status != 'cancelled'`
).all(restaurantId, date, time);

const bookedIds = bookedRows.map(b => b.table_id);

// Conditional: choose correct query based on whether tables are booked
let availableTable;
if (bookedIds.length === 0) {
  availableTable = db.prepare(
    `SELECT * FROM restaurant_tables
     WHERE restaurant_id = ? AND capacity >= ?
     ORDER BY capacity ASC LIMIT 1`
  ).get(restaurantId, guests);
} else {
  const placeholders = bookedIds.map(() => '?').join(',');
  availableTable = db.prepare(
    `SELECT * FROM restaurant_tables
     WHERE restaurant_id = ? AND capacity >= ?
     AND id NOT IN (${placeholders})
     ORDER BY capacity ASC LIMIT 1`
  ).get(restaurantId, guests, ...bookedIds);
}
```

# DineSpot: Comprehensive Project Documentation
**A Modern Restaurant Discovery and Pre-Booking Web Application**

---

## 1. Project Overview & Objective
**DineSpot** is a comprehensive, full-stack web application designed to streamline the restaurant reservation process in Chennai. 
The objective of the project is to provide a seamless, luxurious user experience where customers can discover restaurants by region, view exact locations on an interactive map, pre-order their meals, and securely book a table based on real-time availability. 

Simultaneously, the platform provides a dedicated Admin dashboard for hotel staff to manage incoming reservation requests, process booking fees, and track the status of customer orders.

---

## 2. Technology Stack & Libraries

### Frontend (Client-Side)
* **Framework:** React.js (Version 18)
* **Build Tool:** Vite (for ultra-fast Hot Module Replacement and optimized production builds)
* **Routing:** React Router DOM (Client-side routing without page reloads)
* **Animations:** Framer Motion (Complex scroll animations, DOM transitions, and spring physics)
* **Mapping:** Leaflet.js & `react-leaflet` (Interactive maps with dark-mode CARTO tile layers)
* **Icons:** Lucide React
* **Styling:** Vanilla CSS3 (Custom utility classes, Flexbox/Grid layouts, CSS variables for theming)

### Backend (Server-Side)
* **Runtime:** Node.js
* **Framework:** Express.js (REST API development and routing)
* **Middleware:** CORS (Cross-Origin Resource Sharing), built-in JSON body parsers
* **Database Driver:** `better-sqlite3` (Synchronous, high-performance SQLite driver)

### Database
* **Engine:** SQLite (File-based relational database)
* **Mode:** WAL (Write-Ahead Logging) enabled for superior concurrent read/write operations.

---

## 3. System Architecture
DineSpot follows a **3-Tier Client-Server Architecture**:

1. **Presentation Tier (React Frontend):** Runs in the user's browser. It handles state management (Context API), UI rendering, animation handling, and form validation. It communicates asynchronously with the backend via `fetch` API calls.
2. **Application Tier (Node/Express Backend):** Listens on port 5000. It receives REST API requests, validates payload integrity (e.g., date formats, guest counts), and executes complex business logic (e.g., table allocation algorithms).
3. **Data Tier (SQLite Database):** Stores all persistent data locally in `dinespot.db`. It handles foreign-key constraints and ensures data integrity through transactional SQL queries.

---

## 4. Database Schema & Design
The relational database consists of 4 core tables:

### A. `users` (For future scaling)
* `id` (INTEGER, PK), `email` (TEXT), `name` (TEXT)

### B. `restaurants`
Stores the catalog of available dining venues.
* `id` (TEXT, PK): Unique identifier (e.g., 'ann001').
* `name`, `region`, `address`: Basic details.
* `lat`, `lng`: GPS coordinates for Leaflet maps.

### C. `restaurant_tables`
Stores physical table inventory per restaurant.
* `id` (INTEGER, PK)
* `restaurant_id` (TEXT, FK): Links to `restaurants`.
* `table_number` (INTEGER): Identifier inside the restaurant.
* `capacity` (INTEGER): How many guests this specific table seats.

### D. `bookings`
The central transaction table.
* `id` (INTEGER, PK)
* `user_email` (TEXT)
* `restaurant_id` (TEXT, FK)
* `table_id` (INTEGER, FK): The specific table allocated.
* `booking_date` & `booking_time` (TEXT)
* `guests` (INTEGER)
* `menu_items` (TEXT): Stringified JSON array of pre-ordered food.
* `location` (TEXT): Region string.
* `fee_amount` (REAL): Fixed booking fee (₹50.00).
* `payment_status` (TEXT): Default 'paid'.
* `status` (TEXT): Default 'pending'. Can be updated to 'accepted', 'rejected', or 'completed'.

---

## 5. API Endpoints Documentation

| Method | Endpoint | Description | Payload / Query |
|--------|----------|-------------|-----------------|
| **GET** | `/api/restaurants` | Fetch all restaurants | *None* |
| **GET** | `/api/restaurants?q=region`| Fetch restaurants filtered by region | `q` (string) |
| **POST** | `/api/orders` | Create a new booking | `{ userEmail, orderDetails: { restaurantId, date, time, people, menuItems } }` |
| **GET** | `/api/orders` | Fetch bookings for a specific user | `?email=user@test.com` |
| **GET** | `/api/orders/admin` | Fetch ALL bookings across the platform | *None* |
| **PUT** | `/api/orders/:id/status` | Update a booking's status | `{ status: "accepted" }` |

---

## 6. Detailed Module Implementations

### A. Authentication & Global State
* **File:** `context/AuthContext.jsx`
* **Implementation:** Wraps the entire application. Provides `login()`, `logout()`, and `user` state globally. Uses browser `localStorage` to ensure users remain logged in even after refreshing the page. Supports a "Continue as Guest" bypass.

### B. Dynamic Search & Interactive Map
* **Files:** `Home.jsx`, `Hero.jsx`, `MapComponent.jsx`
* **Implementation:** The Hero component contains "Region Chips" (e.g., Anna Nagar, Adyar). Clicking a chip sends a request to the backend. The backend filters restaurants via SQL `LIKE` clauses and returns the array. 
* **Map Logic:** The frontend passes the new array to the `react-leaflet` component. A custom invisible component (`MapController`) listens for changes to this array, calculates the exact GPS bounding box containing all markers (`L.latLngBounds`), and uses Leaflet's `flyToBounds()` to trigger a cinematic map zoom.

### C. Booking & Smart Table Allocation
* **Files:** `OrderSummary.jsx` (Frontend), `routes/bookings.js` (Backend)
* **Frontend:** Collects Date, Time, Guests, and Menu (Veg/Non-Veg tabs). Simulates a payment gateway by displaying a fixed ₹50 booking fee before submission.
* **Backend Logic (The Algorithm):** When the `POST` request hits the server, the backend executes an atomic database transaction. 
  1. It queries the database for all `table_id`s already booked at that specific `restaurant_id`, `booking_date`, and `booking_time`.
  2. It then searches the `restaurant_tables` table for tables where `capacity >= requested_guests`, **excluding** the tables found in step 1.
  3. It orders the available tables by `capacity ASC` and limits the result to `1`. 
  4. This guarantees that a party of 2 receives a 2-seater table (saving larger tables for larger parties) and strictly prevents double-booking.

### D. Multi-Role Dashboards
* **Files:** `Profile.jsx` (User), `Admin.jsx` (Hotel)
* **Profile:** Queries the backend using the active user's email. Renders their order history with real-time status badges (Pending, Accepted, Rejected, Completed) and payment/fee details.
* **Admin:** Unrestricted query to fetch all incoming platform orders. Features an interface to `Accept` or `Reject` pending orders, and to mark accepted orders as `Completed`. Clicking these buttons sends a `PUT` request to the API, immediately updating the status across the entire database.

---

## 7. UI/UX Design & Aesthetic Choices
* **Luxury Theme:** Black and dark charcoal backgrounds paired with subtle gold/accent borders. Creates a premium, high-end dining feel.
* **Micro-interactions:** Extensive use of `framer-motion` for page-load reveals (`initial={opacity: 0, y: 30}`), hover scaling on buttons, and smooth modal transitions.
* **Feedback loops:** Instead of native browser alerts, dynamic UI state text ("Processing Payment...", "Table Confirmed", "Pending Approval") gives the user continuous context.

---

## 8. Development Challenges & Solutions

**Challenge 1: Preventing Table Double-Booking**
* *Problem:* In a highly concurrent environment, two users might try to book the exact same table at the exact same time.
* *Solution:* Implemented SQLite `db.transaction()`. If the query logic succeeds, it commits. If an error occurs, it rolls back automatically, guaranteeing data integrity.

**Challenge 2: Efficient UI Re-rendering with Maps**
* *Problem:* Re-rendering the entire Map component every time a search filter changed caused screen flickering and heavy DOM loading.
* *Solution:* Instead of re-mounting the map, implemented a sub-component inside the Leaflet `MapContainer` that accesses the native map instance via `useMap()` hook. This allows the map layer to remain persistent while only the internal camera animates via `flyToBounds()`.

**Challenge 3: Transitioning from Mock Data to Relational Data**
* *Problem:* The legacy codebase used a massive, deeply nested JavaScript array to store mock data, which was not scalable.
* *Solution:* Built an idempotent backend seed script (`seedRestaurants.js`). On the very first server launch, it parses the legacy JS array, normalizes it, and inserts the data into the structured SQLite schema (generating 17 restaurants and 280 physical tables).

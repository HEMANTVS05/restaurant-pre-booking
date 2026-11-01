# DineSpot: Restaurant Pre-Booking System
**Project Review Presentation Content (Review 1 & 2)**

---

## 🛑 REVIEW 1 TOPICS

### 1. Functional & Non-Functional Requirements
**Functional Requirements:**
* **Authentication:** User login, registration, and guest access.
* **Discovery & Search:** Search restaurants by name, cuisine, or specific location/region chips.
* **Interactive Mapping:** Dynamic map automatically locating and showing restaurants in the selected region.
* **Menu Pre-ordering:** Browse and select items from Veg/Non-Veg menus before arriving.
* **Smart Table Reservation:** Specify date, time, and guest count. The system automatically allocates the best-fit table.
* **Payment Processing:** Integrated booking fee calculation (₹50) and payment status tracking.
* **User Dashboard:** Dedicated profile page to track past and upcoming reservations with their live status.
* **Admin Dashboard:** Hotel-side portal to review, Accept, Reject, and Complete pending pre-booking requests.

**Non-Functional Requirements:**
* **Usability:** Premium, luxury-themed UI with fluid animations (Framer Motion) for a highly interactive experience.
* **Performance:** Blazing fast load times powered by Vite and optimized React rendering.
* **Concurrency:** Transaction-based database locking to prevent double-booking of the same table.
* **Responsiveness:** Fluid CSS design that adapts to mobile, tablet, and desktop screens.

### 2. System Architecture
* **Architecture Type:** Client-Server / 3-Tier Architecture.
* **Presentation Layer (Frontend):** Built with React.js. Handles UI rendering, form validation, and client-side routing (React Router).
* **Application Layer (Backend):** Built with Node.js and Express.js. Exposes RESTful APIs to process business logic (e.g., table allocation algorithm).
* **Data Layer (Database):** SQLite database ensuring robust, file-based relational data persistence.

### 3. Use Case Diagram (Slide Content)
**Actors:** Customer, Hotel Administrator
* **Customer Use Cases:** 
  * Login / Continue as Guest
  * Search / Filter Restaurants by Region
  * View Restaurant Locations on Map
  * Pre-order Menu Items
  * Book Table & Pay Booking Fee
  * View Order History & Status
* **Hotel Administrator Use Cases:**
  * View All Pending Reservations
  * Accept / Reject Reservations
  * Mark Accepted Reservations as Completed

### 4. ER (Entity-Relationship) Diagram Description
* **`users`**: `id` (PK), `email`, `name`
* **`restaurants`**: `id` (PK), `name`, `region`, `address`, `rating`, `lat`, `lng`
* **`restaurant_tables`**: `id` (PK), `restaurant_id` (FK), `table_number`, `capacity`
* **`bookings`**: `id` (PK), `user_email`, `restaurant_id` (FK), `table_id` (FK), `booking_date`, `booking_time`, `guests`, `menu_items`, `location`, `fee_amount`, `payment_status`, `status` (pending/accepted/rejected)
* *Relationships:* A Restaurant has multiple Tables (1:N) and multiple Bookings (1:N). A User has multiple Bookings (1:N).

### 5. Module Description
1. **Authentication Module:** Manages user state locally using React Context API (`AuthContext`).
2. **Search & Map Module:** Handles region-based filtering and triggers Leaflet map `flyTo` animations dynamically.
3. **Reservation Engine Module:** The core backend logic that calculates the smallest available table that fits the requested guest count using SQL transactions.
4. **Admin Module:** Dedicated interface fetching all cross-restaurant data, allowing state updates (PUT requests) for reservation statuses.

### 6. Technology Stack
* **Frontend:** React.js, Vite, React Router DOM
* **UI & Styling:** Vanilla CSS, Framer Motion (Animations), Lucide React (Icons), React-Leaflet (Maps)
* **Backend:** Node.js, Express.js, CORS
* **Database:** SQLite (via `better-sqlite3` library)

### 7. UI Design
* **Theme:** High-end, premium luxury aesthetic (Dark theme with Gold/Accent highlights).
* **Interactions:** Scroll-based animations, morphing headers, hover-responsive chips, and dynamic pop-ups.
* **Typography:** Elegant combinations of 'Playfair Display' (serif) and 'Outfit' (sans-serif).

---

## 🛑 REVIEW 2 TOPICS

### 1. Frontend Development
* Migrated from legacy HTML/JS to a component-based React architecture.
* Created modular components (`Hero`, `RestaurantCard`, `MapComponent`, `Navbar`).
* Implemented `AnimatePresence` for smooth DOM additions/removals (e.g., showing/hiding search results).

### 2. Backend Development
* Built a custom Express server (`server.js`) replacing mock frontend data arrays.
* Implemented modular routing (`routes/restaurants.js`, `routes/bookings.js`).
* Added global error handling and startup database seeding for immediate use.

### 3. Database Integration
* Transitioned from in-memory JavaScript objects to a fully relational SQLite database.
* Configured `dinespot.db` with WAL (Write-Ahead Logging) mode for better concurrent read/write performance.
* Implemented an idempotent seed script that automatically populates restaurants and tables on the first run.

### 4. API Development
Developed a fully RESTful API suite:
* `GET /api/restaurants` & `GET /api/restaurants?q=region` (Search)
* `POST /api/orders` (Creates booking, calculates fee, allocates table)
* `GET /api/orders?email=...` (Fetches specific user's history)
* `GET /api/orders/admin` (Fetches all platform bookings)
* `PUT /api/orders/:id/status` (Updates booking state)

### 5. Module-wise Implementation
* **MapComponent:** Integrated `react-leaflet`. When the user clicks a region chip, the frontend passes the filtered list to the Map, which uses `L.latLngBounds` to automatically animate and zoom into that specific neighborhood.
* **Booking Logic:** When POSTing an order, the backend runs a SQL transaction that checks all tables for that restaurant, excludes tables already booked at that date/time, and selects the table with the `MIN(capacity)` that satisfies the guest count.

### 6. Screenshots (What to capture for your slides)
1. **Home Page:** The Hero section with the search bar and region chips.
2. **Search Result:** The "Found X results in Region" badge, grid of restaurants, and the Map zoomed into the area.
3. **Menu/Booking Page:** The Veg/Non-Veg tab interface and the date/time form with the "Pay ₹50" button.
4. **User Profile:** The clean dashboard showing a Pending/Accepted order.
5. **Admin Dashboard:** The hotel-side view showing the Accept/Reject buttons.

### 7. Progress Completed
* 100% of the proposed features are implemented. 
* Frontend and Backend are fully integrated.
* Database is fully functional with persistent storage.

### 8. Challenges Faced
* **Complex Table Allocation:** Designing the SQL query to find the *best-fit* table (smallest available table that accommodates the guest count) while simultaneously ensuring it isn't already booked for that specific date and time.
* **Map Animations:** Ensuring the Leaflet map correctly re-centers and animates (`flyToBounds`) dynamically when React state (filtered restaurants) updates without re-mounting the entire map component.
* **Database Concurrency:** Handling potential double-bookings by wrapping the table selection and booking insertion inside a strict SQLite `db.transaction()` block.

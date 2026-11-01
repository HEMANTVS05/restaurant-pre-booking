// script.js — COMPLETE VERSION with Region-Based Restaurant Search

// ================================================================
// 1. MENU TOGGLE FUNCTIONS
// ================================================================
function showveg() {
    document.getElementById("veg-menu").style.display = "block";
    document.getElementById("nonveg-menu").style.display = "none";
    document.getElementById("veg-toggle-btn")?.classList.add("active");
    document.getElementById("nonveg-toggle-btn")?.classList.remove("active");
}

function shownonveg() {
    document.getElementById("veg-menu").style.display = "none";
    document.getElementById("nonveg-menu").style.display = "block";
    document.getElementById("nonveg-toggle-btn")?.classList.add("active");
    document.getElementById("veg-toggle-btn")?.classList.remove("active");
}

// ================================================================
// 2. REGION SEARCH & RESTAURANT LISTING
// ================================================================

function quickSearch(region) {
    const input = document.getElementById("region-input");
    if (input) input.value = region;
    searchRegion();
}

function searchRegion() {
    const input = document.getElementById("region-input");
    const query = input ? input.value.trim() : "";

    const resultsDiv   = document.getElementById("search-results");
    const noResultsDiv = document.getElementById("no-results");
    const grid         = document.getElementById("restaurant-grid");
    const header       = document.getElementById("results-header");

    if (!query) {
        alert("Please enter a region name to search.");
        return;
    }

    // Animate the search button
    const btn = document.getElementById("search-btn");
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching…';
        btn.disabled = true;
    }

    // Small delay for UX feel
    setTimeout(() => {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-search"></i> Search';
            btn.disabled = false;
        }

        // Use the restaurants database (loaded via restaurants-data.js)
        const results = searchRestaurantsByRegion(query);

        if (results.length === 0) {
            if (resultsDiv)  resultsDiv.style.display  = "none";
            if (noResultsDiv) {
                noResultsDiv.style.display = "block";
                document.getElementById("no-results-region").textContent = query;
            }
            return;
        }

        // Show results
        if (noResultsDiv) noResultsDiv.style.display = "none";
        if (resultsDiv)  resultsDiv.style.display   = "block";

        // Results summary
        const available = results.filter(r => r.availableTables > 0).length;
        if (header) {
            header.innerHTML = `
                Found <strong>${results.length}</strong> restaurant${results.length !== 1 ? "s" : ""} in
                <strong>${capitalise(query)}</strong> &mdash;
                <span style="color:#4ade80;font-weight:600;">${available} with available tables</span>
            `;
        }

        // Render cards
        if (grid) {
            grid.innerHTML = "";
            results.forEach(r => {
                grid.appendChild(buildRestaurantCard(r));
            });
        }

        // Restore selected card highlight if we already picked one
        const saved = getSelectedRestaurant();
        if (saved) highlightSelectedCard(saved.id);

        // ── Show map with markers for results ──
        updateMap(results, query);

    }, 550);
}

function capitalise(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
}

// Build a single restaurant card DOM element
function buildRestaurantCard(r) {
    const isFull     = r.availableTables === 0;
    const isLimited  = !isFull && r.availableTables <= 3;

    const badgeClass = isFull ? "badge-full" : (isLimited ? "badge-limited" : "badge-available");
    const badgeText  = isFull ? "⛔ Fully Booked" : (isLimited ? `⚠️ Only ${r.availableTables} left` : `✅ ${r.availableTables} tables free`);
    const tableClass = isFull ? "tables-full" : (isLimited ? "tables-limited" : "tables-available");

    const saved = getSelectedRestaurant();
    const isSelected = saved && saved.id === r.id;

    const card = document.createElement("div");
    card.className = "restaurant-card" + (isSelected ? " selected-card" : "");
    card.id = `card-${r.id}`;

    const tagHTML = r.tags.map(t => `<span class="card-tag">${t}</span>`).join("");

    let btnHTML = "";
    if (isFull) {
        btnHTML = `<button class="select-restaurant-btn is-full" disabled>Fully Booked</button>`;
    } else if (isSelected) {
        btnHTML = `<button class="select-restaurant-btn is-selected" id="sel-btn-${r.id}">✓ Selected</button>`;
    } else {
        btnHTML = `<button class="select-restaurant-btn can-book" id="sel-btn-${r.id}" onclick="selectRestaurant('${r.id}')">Book Here</button>`;
    }

    card.innerHTML = `
        <div class="card-img-wrapper">
            <img src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'">
            <span class="card-availability-badge ${badgeClass}">${badgeText}</span>
            <span class="price-tag">${r.priceRange}</span>
        </div>
        <div class="card-body">
            <div class="card-top">
                <div class="card-name">${r.name}</div>
                <div class="card-rating"><i class="fas fa-star"></i> ${r.rating}</div>
            </div>
            <div class="card-cuisine"><i class="fas fa-utensils" style="margin-right:5px;font-size:0.75rem;"></i>${r.cuisine}</div>
            <div class="card-address"><i class="fas fa-map-marker-alt"></i> ${r.address}</div>
            <div class="card-stats">
                <div class="card-stat">
                    <span class="stat-val ${tableClass}">${r.availableTables}</span>
                    <span class="stat-lbl">Tables Free</span>
                </div>
                <div class="card-stat">
                    <span class="stat-val" style="color:#93c5fd;">${r.availableSeats}</span>
                    <span class="stat-lbl">Seats Open</span>
                </div>
                <div class="card-stat">
                    <span class="stat-val" style="color:rgba(255,255,255,0.5);">${r.totalTables}</span>
                    <span class="stat-lbl">Total Tables</span>
                </div>
            </div>
            <div class="card-tags">${tagHTML}</div>
            <hr class="card-divider">
            <div class="card-footer">
                <span class="card-hours"><i class="fas fa-clock" style="margin-right:4px;color:#ffd200;"></i>${r.openTime} – ${r.closeTime}</span>
                ${btnHTML}
            </div>
        </div>
    `;

    return card;
}

// ================================================================
// 3. RESTAURANT SELECTION
// ================================================================

function selectRestaurant(restaurantId) {
    const restaurant = RESTAURANTS_DB.find(r => r.id === restaurantId);
    if (!restaurant) return;

    if (restaurant.availableTables === 0) {
        alert("Sorry, this restaurant is fully booked right now!");
        return;
    }

    // Save to localStorage
    localStorage.setItem("selectedRestaurant", JSON.stringify({
        id:      restaurant.id,
        name:    restaurant.name,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        region:  restaurant.region,
        rating:  restaurant.rating,
        phone:   restaurant.phone
    }));

    // Update UI immediately
    highlightSelectedCard(restaurantId);
    updateRestaurantBanner(restaurant);
    updateBookingRestaurantInfo(restaurant);
    updateNoRestaurantWarning(false);

    // Announce
    showToast(`✅ ${restaurant.name} selected! Now pick your menu items below.`);
}

function getSelectedRestaurant() {
    try {
        return JSON.parse(localStorage.getItem("selectedRestaurant") || "null");
    } catch {
        return null;
    }
}

function clearRestaurantSelection() {
    localStorage.removeItem("selectedRestaurant");
    restoreRestaurantUI();
    // Remove selected-card highlight from all cards
    document.querySelectorAll(".restaurant-card").forEach(c => c.classList.remove("selected-card"));
    document.querySelectorAll(".select-restaurant-btn.is-selected").forEach(btn => {
        const cardId = btn.id.replace("sel-btn-", "");
        const restaurant = RESTAURANTS_DB.find(r => r.id === cardId);
        if (restaurant && restaurant.availableTables > 0) {
            btn.className = "select-restaurant-btn can-book";
            btn.textContent = "Book Here";
            btn.disabled = false;
            btn.onclick = () => selectRestaurant(cardId);
        }
    });
    document.getElementById("selected-restaurant-banner") &&
        (document.getElementById("selected-restaurant-banner").style.display = "none");
}

function highlightSelectedCard(restaurantId) {
    // Remove old highlights
    document.querySelectorAll(".restaurant-card.selected-card").forEach(c => c.classList.remove("selected-card"));

    // Highlight chosen card
    const card = document.getElementById(`card-${restaurantId}`);
    if (card) card.classList.add("selected-card");

    // Update all "Book Here" buttons
    document.querySelectorAll(".select-restaurant-btn.can-book").forEach(btn => {
        const rid = btn.id.replace("sel-btn-", "");
        if (rid !== restaurantId) return;
        btn.className = "select-restaurant-btn is-selected";
        btn.textContent = "✓ Selected";
        btn.disabled = true;
        btn.onclick = null;
    });
}

function updateRestaurantBanner(restaurant) {
    const banner = document.getElementById("selected-restaurant-banner");
    const text   = document.getElementById("selected-banner-text");
    if (!banner) return;
    if (text) text.textContent = `${restaurant.name} selected! Scroll down to choose menu items.`;
    banner.style.display = "flex";
}

function updateBookingRestaurantInfo(restaurant) {
    const wrapper = document.getElementById("booking-restaurant-info");
    const nameEl  = document.getElementById("bri-name");
    const metaEl  = document.getElementById("bri-meta");
    if (!wrapper) return;
    if (nameEl) nameEl.textContent = restaurant.name;
    if (metaEl) metaEl.textContent = `${capitalise(restaurant.region)} · ${restaurant.cuisine} · ⭐ ${restaurant.rating}`;
    wrapper.style.display = "flex";
}

function updateNoRestaurantWarning(show) {
    const warn = document.getElementById("no-restaurant-warning");
    if (warn) warn.style.display = show ? "flex" : "none";
}

// Called on page load to restore UI from localStorage
function restoreRestaurantUI() {
    const restaurant = getSelectedRestaurant();
    if (restaurant) {
        updateBookingRestaurantInfo(restaurant);
        updateNoRestaurantWarning(false);
    } else {
        const wrapper = document.getElementById("booking-restaurant-info");
        if (wrapper) wrapper.style.display = "none";
        updateNoRestaurantWarning(true);
    }
}

// ================================================================
// 4. TOAST NOTIFICATION
// ================================================================
function showToast(message) {
    const existing = document.getElementById("fp-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "fp-toast";
    toast.textContent = message;
    Object.assign(toast.style, {
        position:    "fixed",
        bottom:      "32px",
        left:        "50%",
        transform:   "translateX(-50%) translateY(20px)",
        background:  "linear-gradient(135deg, #f7971e, #ffd200)",
        color:       "#111",
        padding:     "14px 28px",
        borderRadius:"50px",
        fontFamily:  "Poppins, sans-serif",
        fontWeight:  "700",
        fontSize:    "0.92rem",
        boxShadow:   "0 8px 30px rgba(0,0,0,0.4)",
        zIndex:      "9999",
        opacity:     "0",
        transition:  "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        whiteSpace:  "nowrap",
        maxWidth:    "90vw",
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity   = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity   = "0";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ================================================================
// 5. DATA PERSISTENCE
// ================================================================
function saveOrderHistory(email, orderData) {
    try {
        const allOrders = JSON.parse(localStorage.getItem("orderHistory") || "{}");
        if (!allOrders[email]) allOrders[email] = [];
        allOrders[email].push({
            ...orderData,
            savedAt:   new Date().toISOString(),
            timestamp: Date.now()
        });
        localStorage.setItem("orderHistory", JSON.stringify(allOrders));
        console.log("✅ Order history saved for:", email);
    } catch (error) {
        console.error("❌ Error saving order history:", error);
    }
}

// ================================================================
// 6. BOOK NOW FUNCTION
// ================================================================
async function bookNow() {
    // 1. Must have selected a restaurant
    const restaurant = getSelectedRestaurant();
    if (!restaurant) {
        showToast("⚠️ Please select a restaurant from the Explore section first!");
        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
        return;
    }

    // 2. Must be logged in
    const userEmail = localStorage.getItem("userEmail");
    const username  = localStorage.getItem("username");
    if (!userEmail) {
        alert("❌ Please login first to book a table!");
        window.location.href = "login-page.html";
        return;
    }

    // 3. Booking details
    const date   = document.getElementById("date")?.value;
    const time   = document.getElementById("time")?.value;
    const people = document.getElementById("people")?.value;

    if (!date)   { alert("Please select a date!");        return; }
    if (!time)   { alert("Please select a time slot!");   return; }
    if (!people || people < 1 || people > 20) {
        alert("Please enter number of guests (1–20)!");
        return;
    }

    // 4. Menu items
    const menuItems   = document.querySelectorAll(".menu-item");
    const vegItems    = [];
    const nonvegItems = [];

    menuItems.forEach(item => {
        if (item.checked) {
            const name = item.parentElement.textContent.trim();
            if (item.getAttribute("data-type") === "veg")    vegItems.push(name);
            else if (item.getAttribute("data-type") === "nonveg") nonvegItems.push(name);
        }
    });

    if (vegItems.length === 0 && nonvegItems.length === 0) {
        alert("Please select at least one menu item!");
        return;
    }

    // 5. Save everything to localStorage
    localStorage.setItem("bookingDate",   date);
    localStorage.setItem("bookingTime",   time);
    localStorage.setItem("bookingPeople", people);
    localStorage.setItem("vegItems",      JSON.stringify(vegItems));
    localStorage.setItem("nonvegItems",   JSON.stringify(nonvegItems));
    // Restaurant already in localStorage

    // 6. Go to order summary
    window.location.href = "order-summary.html";
}

// ================================================================
// 7. NAVBAR LOGIN HANDLER
// ================================================================
function setupNavbarLogin() {
    const navLoginBtn = document.getElementById("nav-login-btn");
    if (!navLoginBtn) return;

    const username  = localStorage.getItem("username");
    const userEmail = localStorage.getItem("userEmail");

    if (username && userEmail) {
        navLoginBtn.innerHTML = `<i class="fas fa-user"></i> ${username}`;
        navLoginBtn.onclick = function() {
            if (confirm("Logout?")) {
                const orderHistory    = localStorage.getItem("orderHistory");
                const selectedRestaurant = localStorage.getItem("selectedRestaurant");
                localStorage.clear();
                if (orderHistory) localStorage.setItem("orderHistory", orderHistory);
                if (selectedRestaurant) localStorage.setItem("selectedRestaurant", selectedRestaurant);
                location.reload();
            }
        };
    } else {
        navLoginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In`;
        navLoginBtn.onclick = function() {
            window.location.href = "login-page.html";
        };
    }
}

// ================================================================
// 8. RESTORE MENU CHECKBOXES & FORM FIELDS
// ================================================================
function restoreMenuCheckboxes() {
    const vegItems    = JSON.parse(localStorage.getItem("vegItems"))    || [];
    const nonvegItems = JSON.parse(localStorage.getItem("nonvegItems")) || [];
    const allItems    = [...vegItems, ...nonvegItems];

    if (allItems.length > 0) {
        document.querySelectorAll(".menu-item").forEach(checkbox => {
            const label = checkbox.parentElement.textContent.trim();
            if (allItems.some(item => item.includes(label))) {
                checkbox.checked = true;
            }
        });
    }
}

function restoreFormFields() {
    const bookingDate   = localStorage.getItem("bookingDate");
    const bookingTime   = localStorage.getItem("bookingTime");
    const bookingPeople = localStorage.getItem("bookingPeople");

    if (bookingDate) {
        const el = document.getElementById("date");
        if (el) el.value = bookingDate;
    }
    if (bookingTime) {
        const el = document.getElementById("time");
        if (el) el.value = bookingTime;
    }
    if (bookingPeople) {
        const el = document.getElementById("people");
        if (el) el.value = bookingPeople;
    }
}

function showRestoreButton() {
    const userEmail = localStorage.getItem("userEmail");
    const restoreBtn = document.getElementById("restore-order-btn");
    if (!restoreBtn || !userEmail) return;

    try {
        const allOrders = JSON.parse(localStorage.getItem("orderHistory") || "{}");
        restoreBtn.style.display = (allOrders[userEmail]?.length > 0) ? "flex" : "none";
    } catch {
        restoreBtn.style.display = "none";
    }
}

function restoreOrder() {
    window.location.href = "order-summary.html";
}

// ================================================================
// 9. LEAFLET MAP ENGINE
// ================================================================
let _mapInstance  = null;  // singleton Leaflet map
let _mapMarkers   = [];    // track markers to clear on new search

function initMap() {
    if (_mapInstance) return _mapInstance;

    const mapEl = document.getElementById("region-map");
    if (!mapEl || typeof L === "undefined") return null;

    _mapInstance = L.map("region-map", {
        zoomControl: true,
        scrollWheelZoom: false,   // nicer UX inside a page
        attributionControl: true,
    });

    // CartoDB Dark Matter tiles — zero API key needed
    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
        }
    ).addTo(_mapInstance);

    return _mapInstance;
}

// Returns an SVG pin icon coloured by availability
function makeMarkerIcon(restaurant) {
    const isFull    = restaurant.availableTables === 0;
    const isLimited = !isFull && restaurant.availableTables <= 3;
    const color     = isFull ? "#f87171" : (isLimited ? "#facc15" : "#4ade80");
    const glow      = isFull ? "rgba(248,113,113,0.5)" : (isLimited ? "rgba(250,204,21,0.5)" : "rgba(74,222,128,0.5)");

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Pin body -->
  <path d="M17 2C9.82 2 4 7.82 4 15c0 9.25 13 25 13 25S30 24.25 30 15C30 7.82 24.18 2 17 2z"
        fill="${color}" filter="url(#glow)" opacity="0.95"/>
  <!-- White dot centre -->
  <circle cx="17" cy="15" r="5.5" fill="white" opacity="0.9"/>
</svg>`;

    return L.divIcon({
        className: "",
        html: svg,
        iconSize:   [34, 42],
        iconAnchor: [17, 42],
        popupAnchor:[0, -44],
    });
}

// Rich HTML popup for a restaurant
function buildPopupHTML(r) {
    const isFull    = r.availableTables === 0;
    const isLimited = !isFull && r.availableTables <= 3;
    const badgeClass = isFull ? "popup-badge-full" : (isLimited ? "popup-badge-limited" : "popup-badge-available");
    const badgeText  = isFull ? "⛔ Fully Booked" : (isLimited ? `⚠️ Only ${r.availableTables} table${r.availableTables !== 1 ? "s" : ""} left` : `✅ ${r.availableTables} tables available`);
    const tabColor   = isFull ? "#f87171" : (isLimited ? "#facc15" : "#4ade80");
    const seatColor  = "#93c5fd";

    return `
<div class="map-popup">
    <div class="map-popup-name">${r.name}</div>
    <div class="map-popup-cuisine">${r.cuisine} &bull; ${r.priceRange} &bull; ⭐ ${r.rating}</div>
    <div class="map-popup-stats">
        <div class="map-popup-stat">
            <span class="val" style="color:${tabColor}">${r.availableTables}</span>
            <span class="lbl">Tables</span>
        </div>
        <div class="map-popup-stat">
            <span class="val" style="color:${seatColor}">${r.availableSeats}</span>
            <span class="lbl">Seats</span>
        </div>
        <div class="map-popup-stat">
            <span class="val" style="color:rgba(255,255,255,0.45)">${r.totalTables}</span>
            <span class="lbl">Total</span>
        </div>
    </div>
    <hr class="map-popup-divider">
    <div class="map-popup-address">
        <i class="fas fa-map-marker-alt"></i>
        <span>${r.address}</span>
    </div>
    <div class="map-popup-badge ${badgeClass}">${badgeText}</div>
</div>`;
}

// Main function: show / refresh map with given restaurant list
function updateMap(restaurants, regionName) {
    if (!restaurants || restaurants.length === 0) {
        const panel = document.getElementById("map-panel");
        if (panel) panel.classList.remove("visible");
        return;
    }

    // Show the panel
    const panel = document.getElementById("map-panel");
    if (panel) panel.classList.add("visible");

    // Update header text
    const mapTitle    = document.getElementById("map-title");
    const mapSubtitle = document.getElementById("map-subtitle");
    if (mapTitle)    mapTitle.textContent    = `${capitalise(regionName)} — Restaurant Map`;
    if (mapSubtitle) mapSubtitle.textContent = `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} pinned`;

    // Init or reuse map
    const map = initMap();
    if (!map) return;

    // Clear old markers
    _mapMarkers.forEach(m => m.remove());
    _mapMarkers = [];

    const bounds = [];

    restaurants.forEach(r => {
        if (!r.lat || !r.lng) return;

        const marker = L.marker([r.lat, r.lng], { icon: makeMarkerIcon(r) })
            .addTo(map)
            .bindPopup(buildPopupHTML(r), {
                maxWidth: 240,
                minWidth: 200,
                className: "fp-popup",
            });

        _mapMarkers.push(marker);
        bounds.push([r.lat, r.lng]);
    });

    // Fit map to markers with smooth padding
    if (bounds.length === 1) {
        map.setView(bounds[0], 15, { animate: true });
    } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], animate: true, maxZoom: 15 });
    }

    // Invalidate size after panel becomes visible (layout reflow)
    setTimeout(() => map.invalidateSize(), 100);
}

// ================================================================
// 9. PAGE INITIALISATION
// ================================================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ script.js loaded");

    setupNavbarLogin();

    // Default date
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("date");
    if (dateInput) { dateInput.value = today; dateInput.min = today; }

    // Restore previous session data
    restoreMenuCheckboxes();
    restoreFormFields();
    showRestoreButton();

    // Initialise menu display
    if (document.getElementById("veg-menu")) showveg();

    // Restore restaurant selection UI
    restoreRestaurantUI();

    // Allow Enter key in region search input
    const regionInput = document.getElementById("region-input");
    if (regionInput) {
        regionInput.addEventListener("keydown", e => {
            if (e.key === "Enter") searchRegion();
        });
    }

    // ── Smooth scroll for hero CTA links (JS fallback for full control) ──
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href").slice(1);
            const target   = document.getElementById(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
});

// ================================================================
// 10. GLOBAL EXPORTS
// ================================================================
window.showveg                  = showveg;
window.shownonveg               = shownonveg;
window.bookNow                  = bookNow;
window.searchRegion             = searchRegion;
window.quickSearch              = quickSearch;
window.selectRestaurant         = selectRestaurant;
window.clearRestaurantSelection = clearRestaurantSelection;
window.restoreOrder             = restoreOrder;
window.restoreRestaurantUI      = restoreRestaurantUI;
window.restoreMenuCheckboxes    = restoreMenuCheckboxes;
window.restoreFormFields        = restoreFormFields;
window.showRestoreButton        = showRestoreButton;
window.updateMap                = updateMap;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import RestaurantCard from '../components/RestaurantCard';

import { MapPin, X } from 'lucide-react';
import './Home.css';

const API = import.meta.env.VITE_API_URL || '';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null); // currently selected area chip
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load ALL restaurants on mount
  useEffect(() => {
    fetch(`${API}/api/restaurants`)
      .then(res => res.json())
      .then(data => {
        setRestaurants(data);
        setFilteredRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching restaurants:', err);
        setLoading(false);
      });
  }, []);

  // Called by Hero – either chip click or form submit
  const handleSearch = async (query) => {
    const q = query.trim();
    if (!q) {
      clearFilter();
      return;
    }

    setActiveRegion(q);

    try {
      const res = await fetch(`${API}/api/restaurants?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setFilteredRestaurants(data);
    } catch (err) {
      console.error('Search error:', err);
      const lower = q.toLowerCase();
      setFilteredRestaurants(
        restaurants.filter(r =>
          r.region.toLowerCase().includes(lower) || r.name.toLowerCase().includes(lower)
        )
      );
    }

    // Scroll to results
    setTimeout(() => {
      document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const clearFilter = () => {
    setActiveRegion(null);
    setFilteredRestaurants(restaurants);
  };

  const handleBook = (restaurant) => {
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    navigate('/order-summary');
  };

  const isFiltered = activeRegion !== null;

  return (
    <div className="home-page">
      <Hero onSearch={handleSearch} activeRegion={activeRegion} />

      <section className="restaurants-section container" id="restaurants">

        {/* Section header – static title OR dynamic region result */}
        <AnimatePresence mode="wait">
          {isFiltered ? (
            <motion.div
              key="filtered-header"
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="region-result-row">
                <span className="region-count-badge">
                  {filteredRestaurants.length}
                </span>
                <div>
                  <span className="section-subtitle">
                    <MapPin size={13} style={{ marginRight: '5px' }} />
                    Showing results in
                  </span>
                  <h2 className="section-title" style={{ marginTop: '0.3rem' }}>
                    <span className="luxury-text">{activeRegion}</span>
                  </h2>
                </div>
                <button className="clear-filter-btn" onClick={clearFilter} title="Show all">
                  <X size={16} /> Show All
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="default-header"
              className="section-header"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="section-subtitle">Exquisite Selection</span>
              <h2 className="section-title">
                The Culinary <span className="luxury-text">Collection</span>
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restaurant grid */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Curating experiences...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredRestaurants.length > 0 ? (
              <motion.div
                key={activeRegion || 'all'}
                className="restaurants-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {filteredRestaurants.map((restaurant, idx) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onBook={handleBook}
                    index={idx % 3}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="no-results"
                className="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>No culinary destinations in <strong>{activeRegion}</strong>.</p>
                <button
                  className="btn btn-outline"
                  style={{ marginTop: '2rem' }}
                  onClick={clearFilter}
                >
                  View All Restaurants
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}


      </section>
    </div>
  );
};

export default Home;

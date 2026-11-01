import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

const REGIONS = [
  'Ramapuram', 'Anna Nagar', 'T. Nagar', 'Adyar',
  'Velachery', 'Porur', 'Mylapore', 'Koyambedu', 'Saidapet'
];

const Hero = ({ onSearch, activeRegion }) => {
  const [query, setQuery] = useState('');
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChip = (region) => {
    setQuery(region);
    onSearch(region);
  };

  return (
    <section className="hero-section">
      <motion.div className="hero-background" style={{ y: y1 }}>
        <div className="overlay"></div>
      </motion.div>

      <motion.div
        className="hero-content container"
        style={{ opacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="hero-kicker">Curated Dining Experiences</span>
        <h1 className="hero-title">
          Discover the Art of <br />
          <span className="luxury-text">Gastronomy</span>
        </h1>
        <p className="hero-subtitle">
          Exclusive reservations at the most sought-after culinary destinations in Chennai.
        </p>

        <motion.form
          className="search-bar"
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search by neighborhood or cuisine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Find Table</button>
        </motion.form>

        {/* Region chips */}
        <motion.div
          className="region-chips"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="chips-label">
            <MapPin size={14} /> Available areas:
          </span>
          {REGIONS.map((region, i) => {
            const isActive = activeRegion?.toLowerCase() === region.toLowerCase();
            return (
              <motion.button
                key={region}
                type="button"
                className={`region-chip ${isActive ? 'active' : ''}`}
                onClick={() => handleChip(region)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 + i * 0.05 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                {region}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

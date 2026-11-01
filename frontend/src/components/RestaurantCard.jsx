import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star } from 'lucide-react';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant, onBook, index }) => {
  return (
    <motion.div 
      className="restaurant-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="card-image-wrapper">
        <img src={restaurant.image} alt={restaurant.name} className="card-image" />
        <div className="rating-badge">
          <Star size={12} fill="currentColor" />
          <span>{restaurant.rating}</span>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-header flex justify-between items-center">
          <h3 className="restaurant-name">{restaurant.name}</h3>
          <span className="price-range">{restaurant.priceRange}</span>
        </div>
        
        <p className="cuisine luxury-text">{restaurant.cuisine}</p>
        
        <div className="details-grid">
          <div className="detail-item flex items-center">
            <MapPin size={14} />
            <span>{restaurant.region.charAt(0).toUpperCase() + restaurant.region.slice(1)}</span>
          </div>
          <div className="detail-item flex items-center">
            <Clock size={14} />
            <span>{restaurant.openTime} - {restaurant.closeTime}</span>
          </div>
        </div>
        
        <div className="card-footer">
          <button className="btn btn-outline w-full hover-fill" onClick={() => onBook(restaurant)}>
            Reserve Table
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;

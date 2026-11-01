import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Utensils, CheckSquare } from 'lucide-react';
import './OrderSummary.css';

const API = import.meta.env.VITE_API_URL || '';

const vegMenu = [
  'Chana Masala', 'Baingan Bharta', 'Dal Makhani', 'Malai Kofta', 
  'Bhindi Masala', 'Rajma Masala', 'Sarson Ka Saag', 'Veg Pulao',
  'Gobi Manchurian', 'Kadai Paneer', 'Methi Matar Malai', 'Aloo Baingan',
  'Mushroom Masala', 'Matar Paneer', 'Navratan Korma', 'Paneer Butter Masala'
];

const nonvegMenu = [
  'Mutton Korma', 'Prawn Masala', 'Rogan Josh', 'Tandoori Chicken',
  'Keema Pav', 'Chicken Tikka', 'Goan Fish Curry', 'Lamb Vindaloo',
  'Egg Curry', 'Chili Chicken', 'Mutton Biryani', 'Chicken Stew',
  'Beef Roast', 'Fish Fry', 'Chicken Cafreal', 'Crab Masala'
];

const OrderSummary = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingPeople, setBookingPeople] = useState('2');
  
  const [activeMenu, setActiveMenu] = useState('veg');
  const [selectedItems, setSelectedItems] = useState([]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      setRestaurant(JSON.parse(savedRestaurant));
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!bookingDate || !bookingTime || !bookingPeople) {
      setBookingError('Please complete all reservation details.');
      return;
    }
    if (selectedItems.length === 0) {
      setBookingError('Please select at least one menu item.');
      return;
    }

    setIsSubmitting(true);
    const orderDetails = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date: bookingDate,
      time: bookingTime,
      people: bookingPeople,
      menuItems: selectedItems
    };

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, orderDetails })
      });
      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setBookingError(data.message || 'Reservation failed. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setBookingError('Cannot reach the server. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant) return null;

  if (isSuccess) {
    return (
      <div className="order-page">
        <motion.div 
          className="success-container text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-subtitle">Reservation Confirmed</span>
          <h2 className="success-title luxury-text">L'attente est Terminée</h2>
          <p className="success-message">Your table and menu at {restaurant.name} are secured.</p>
          
          <div className="booking-details-box">
            <div className="detail-row flex justify-between">
              <span>Date</span>
              <span className="detail-value">{bookingDate}</span>
            </div>
            <div className="detail-row flex justify-between">
              <span>Time</span>
              <span className="detail-value">{bookingTime}</span>
            </div>
            <div className="detail-row flex justify-between">
              <span>Guests</span>
              <span className="detail-value">{bookingPeople}</span>
            </div>
            <div className="detail-row flex flex-col items-start" style={{ gap: '0.5rem', borderBottom: 'none' }}>
              <span>Pre-Ordered Menu</span>
              <div className="menu-tags">
                {selectedItems.map((item, idx) => (
                  <span key={idx} className="menu-tag">{item}</span>
                ))}
              </div>
            </div>
          </div>
          
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            Return to Collection
          </button>
        </motion.div>
      </div>
    );
  }

  const currentMenu = activeMenu === 'veg' ? vegMenu : nonvegMenu;

  return (
    <div className="order-page">
      <div className="order-container container">
        
        {/* Left Column: Restaurant & Menu */}
        <motion.div 
          className="restaurant-summary"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={restaurant.image} alt={restaurant.name} className="summary-img" />
          <div className="summary-info">
            <span className="section-subtitle">Venue Details</span>
            <h2>{restaurant.name}</h2>
            <p className="text-muted">{restaurant.address}</p>
          </div>

          <div className="menu-section">
            <h3 className="menu-title">Select Your Menu</h3>
            <div className="menu-tabs">
              <button 
                className={`menu-tab ${activeMenu === 'veg' ? 'active' : ''}`}
                onClick={() => setActiveMenu('veg')}
              >
                Vegetarian
              </button>
              <button 
                className={`menu-tab ${activeMenu === 'nonveg' ? 'active' : ''}`}
                onClick={() => setActiveMenu('nonveg')}
              >
                Non-Vegetarian
              </button>
            </div>

            <div className="menu-grid">
              {currentMenu.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`menu-item ${selectedItems.includes(item) ? 'selected' : ''}`}
                  onClick={() => toggleItem(item)}
                >
                  <CheckSquare size={16} className="check-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            {selectedItems.length > 0 && (
              <p className="menu-selection-count">
                {selectedItems.length} item(s) selected
              </p>
            )}
          </div>
        </motion.div>

        {/* Right Column: Reservation Form */}
        <motion.div 
          className="booking-form-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="form-header">
            <h3>Reserve Your Table</h3>
            <p>Select your preferred date and time.</p>
          </div>
          
          <form onSubmit={handleBooking} className="booking-form">
            <div className="form-group">
              <label>Date</label>
              <div className="input-with-icon">
                <Calendar size={18} strokeWidth={1.5} />
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Time</label>
              <div className="input-with-icon">
                <Clock size={18} strokeWidth={1.5} />
                <input 
                  type="time" 
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Guests</label>
              <div className="input-with-icon">
                <Users size={18} strokeWidth={1.5} />
                <select 
                  value={bookingPeople}
                  onChange={(e) => setBookingPeople(e.target.value)}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {bookingError && (
              <p className="booking-error">{bookingError}</p>
            )}

            <div className="fee-summary">
              <span>Booking Fee</span>
              <span className="fee-amount">₹50.00</span>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Processing Payment...' : 'Pay ₹50 & Confirm'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSummary;

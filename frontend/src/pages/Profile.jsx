import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Users, Coffee, CheckCircle, Clock3, XCircle } from 'lucide-react';
import './Profile.css';

const API = import.meta.env.VITE_API_URL || '';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`${API}/api/orders?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
      case 'accepted':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return <Clock3 size={18} className="text-yellow-500" />;
    }
  };

  return (
    <div className="profile-page container">
      <motion.div 
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="section-subtitle">Your Account</span>
        <h2 className="section-title">Welcome, <span className="luxury-text">{user?.name}</span></h2>
        <div className="profile-actions">
          <button className="btn btn-outline" onClick={handleLogout}>Sign Out</button>
        </div>
      </motion.div>

      <div className="orders-section">
        <h3 className="section-subtitle" style={{marginBottom: '2rem'}}>Booking History</h3>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your reservations...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-results">
            <p>You have no reservations yet.</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Explore Restaurants</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id} 
                className="order-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="order-header">
                  <h4>{order.restaurant_name}</h4>
                  <div className={`status-badge ${order.status}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="order-details-grid">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{order.booking_date}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{order.booking_time}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={16} />
                    <span>{order.guests} Guests (Table {order.table_number})</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{order.location || order.restaurant_address}</span>
                  </div>
                </div>

                <div className="order-menu">
                  <div className="menu-header">
                    <Coffee size={16} />
                    <span>Pre-ordered Menu</span>
                  </div>
                  <div className="menu-tags">
                    {order.menu_items && order.menu_items.length > 0 ? (
                      order.menu_items.map((item, i) => (
                        <span key={i} className="menu-tag">{item}</span>
                      ))
                    ) : (
                      <span className="text-muted">No items pre-ordered</span>
                    )}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="fee-info">
                    <span>Booking Fee: ₹{order.fee_amount || 50}</span>
                    <span className={`payment-status ${order.payment_status}`}>
                      ({order.payment_status?.toUpperCase()})
                    </span>
                  </div>
                  <span className="booking-date-text">Booked on {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

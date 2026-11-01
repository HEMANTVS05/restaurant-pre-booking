import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, X, Clock, MapPin, Calendar, Users, Coffee } from 'lucide-react';
import './Admin.css';

const API = 'http://localhost:5000';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // For this demo, anyone visiting /admin can see this. In a real app, restrict by role.
  useEffect(() => {
    fetch(`${API}/api/orders/admin`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching admin orders:', err);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error connecting to server');
    }
  };

  return (
    <div className="admin-page container">
      <motion.div 
        className="admin-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="section-subtitle">Hotel Management</span>
        <h2 className="section-title">Reservation <span className="luxury-text">Dashboard</span></h2>
      </motion.div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      ) : (
        <div className="admin-grid">
          {orders.length === 0 ? (
            <p className="no-results">No pre-booking requests found.</p>
          ) : (
            orders.map((order, idx) => (
              <motion.div 
                key={order.id} 
                className="admin-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="admin-card-header">
                  <div>
                    <h3>{order.restaurant_name}</h3>
                    <span className="user-email">{order.user_email}</span>
                  </div>
                  <div className={`status-badge ${order.status}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div className="admin-card-body">
                  <div className="detail-row">
                    <Calendar size={14} /> <span>{order.booking_date} | {order.booking_time}</span>
                  </div>
                  <div className="detail-row">
                    <Users size={14} /> <span>{order.guests} Guests (Table {order.table_number})</span>
                  </div>
                  <div className="detail-row">
                    <MapPin size={14} /> <span>{order.location || order.restaurant_address}</span>
                  </div>
                  
                  <div className="admin-menu">
                    <span className="text-muted text-sm"><Coffee size={14} className="inline mr-1" /> Menu Requested:</span>
                    <div className="menu-tags">
                      {order.menu_items?.map((item, i) => (
                        <span key={i} className="menu-tag small">{item}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="fee-row">
                    <span>Fee: ₹{order.fee_amount || 50}</span>
                    <span className={`payment-status ${order.payment_status}`}>({order.payment_status?.toUpperCase()})</span>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="admin-actions">
                    <button 
                      className="btn-action reject"
                      onClick={() => updateStatus(order.id, 'rejected')}
                    >
                      <X size={16} /> Reject
                    </button>
                    <button 
                      className="btn-action accept"
                      onClick={() => updateStatus(order.id, 'accepted')}
                    >
                      <Check size={16} /> Accept
                    </button>
                  </div>
                )}
                
                {order.status === 'accepted' && (
                   <div className="admin-actions">
                    <button 
                      className="btn-action complete"
                      onClick={() => updateStatus(order.id, 'completed')}
                    >
                      <Check size={16} /> Mark Completed
                    </button>
                 </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;

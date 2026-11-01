import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="brand">
          DINE<span className="luxury-text">SPOT</span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <div className="user-menu flex items-center" style={{ gap: '1.5rem' }}>
              <Link to="/profile" className="user-name hover-effect" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                M. {user.name} (Orders)
              </Link>
              <Link to="/admin" className="user-name hover-effect" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
                Admin
              </Link>
              <button className="nav-link-btn" onClick={handleLogout}>
                <LogOut size={16} /> SIGN OUT
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-link-btn flex items-center gap">
              <User size={16} style={{marginRight: '8px'}} /> SIGN IN
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || (!isLogin && !name) || !password) {
      alert("Please fill in all required fields.");
      return;
    }
    
    login({ email, name: isLogin ? email.split('@')[0] : name });
    navigate('/');
  };

  const handleGoogleLogin = () => {
    login({ email: 'user@example.com', name: 'Guest' });
    navigate('/');
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <span className="section-subtitle">Exclusive Access</span>
          <h2 className="login-title">
            {isLogin ? (
              <>Welcome <span className="luxury-text">Back</span></>
            ) : (
              <>Become a <span className="luxury-text">Member</span></>
            )}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Request Access'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="btn btn-outline w-full google-btn" onClick={handleGoogleLogin}>
          Continue as Guest
        </button>

        <p className="toggle-auth">
          {isLogin ? "Not a member yet? " : "Already hold a membership? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Inquire here' : 'Sign in'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

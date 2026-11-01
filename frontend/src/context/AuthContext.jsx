import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is in localStorage
    const savedUserEmail = localStorage.getItem('userEmail');
    const savedUserName = localStorage.getItem('username');
    if (savedUserEmail) {
      setUser({ email: savedUserEmail, name: savedUserName });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('username', userData.name || userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

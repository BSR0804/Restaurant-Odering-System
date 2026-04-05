import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import LandingPage from '../pages/LandingPage';
import MenuPage from '../pages/MenuPage';
import CheckoutPage from '../pages/CheckoutPage';
import SuccessPage from '../pages/SuccessPage';
import AccountPage from '../pages/AccountPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { socket, API_BASE_URL } from '../api';

function UserMode() {
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState(null);
  const [prefetchedMenu, setPrefetchedMenu] = useState(null);

  // Prefetch menu data immediately on app load (while user is on landing page)
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/menu`)
      .then(res => setPrefetchedMenu(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    socket.on('menu_update', (data) => {
      if (!data.is_available) {
        // Automatically eject from cart if unavailable
        setCart(prev => prev.filter(item => item.id !== data.id));
      }
    });

    return () => socket.off('menu_update');
  }, []);

  useEffect(() => {
    // Basic table detection from URL ?table=X
    const params = new URLSearchParams(window.location.search);
    const tableId = params.get('table');
    if (tableId) setTable(tableId);
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.id !== item.id);
    });
  };

  const clearCart = () => setCart([]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "345892520340-fbk4bokr6r5hkg5f46qn80rjcqvj3nqj.apps.googleusercontent.com"}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MenuPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} tableNumber={table} prefetchedMenu={prefetchedMenu} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} clearCart={clearCart} tableNumber={table} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default UserMode;

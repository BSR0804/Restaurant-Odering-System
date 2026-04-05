import React, { useEffect } from 'react';
import UserMode from './modes/UserMode';
import AdminMode from './modes/AdminMode';
import { API_BASE_URL } from './api';

function App() {
  // Mode selection via environment variable
  // Default to user mode if not specified
  const mode = import.meta.env.VITE_APP_MODE || 'user';

  // Keep-alive ping to prevent Railway cold starts
  useEffect(() => {
    const keepAlive = () => {
      fetch(`${API_BASE_URL}/health`).catch(() => {});
    };
    
    keepAlive(); // Immediate ping on load
    const interval = setInterval(keepAlive, 10 * 60 * 1000); // Every 10 minutes
    return () => clearInterval(interval);
  }, []);

  if (mode === 'admin') {
    return <AdminMode />;
  }

  return <UserMode />;
}

export default App;

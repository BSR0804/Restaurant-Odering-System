import React from 'react';
import UserMode from './modes/UserMode';
import AdminMode from './modes/AdminMode';

function App() {
  // Mode selection via environment variable
  // Default to user mode if not specified
  const mode = import.meta.env.VITE_APP_MODE || 'user';

  if (mode === 'admin') {
    return <AdminMode />;
  }

  return <UserMode />;
}

export default App;

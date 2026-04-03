import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, items, total } = location.state || {};

  if (!token) {
      return (
          <div className="screen container" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Something went wrong. Order not found.</p>
              <button className="btn-primary" onClick={() => navigate('/')}>Return to Menu</button>
          </div>
      );
  }

  return (
    <div className="screen container" style={{ textAlign: 'center', padding: '120px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '300', marginBottom: '8px' }}>Thank you.</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '0.05em' }}>Your order is being prepared.</p>
      </motion.div>

      <div className="menu-item" style={{ margin: '64px 0', padding: '40px', display: 'block', borderStyle: 'solid' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>
          Collection Token
        </p>
        <h2 style={{ fontSize: '48px', fontWeight: '300', color: 'var(--text)', letterSpacing: '0.1em' }}>
          {token}
        </h2>
      </div>

      <div className="menu-item" style={{ textAlign: 'left', padding: '24px', marginBottom: '48px', display: 'block', background: 'transparent' }}>
        <h3 style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>Summary</h3>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{i.name} <span style={{ fontSize: '12px' }}>x {i.qty}</span></span>
            <span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <div style={{ height: '1px', background: 'var(--card-border)', margin: '20px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500', fontSize: '15px' }}>
            <span style={{ color: 'var(--text)' }}>Total Paid</span>
            <span>₹{total}</span>
        </div>
      </div>

      <button className="btn-add" onClick={() => navigate('/menu')} style={{ width: '100%', padding: '16px', fontSize: '14px' }}>
         Return to Menu
      </button>
    </div>
  );
};

export default SuccessPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = ({ cart, clearCart, tableNumber }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Step 1: Create Order on Backend
      const res = await axios.post('http://localhost:5000/api/orders/create', {
        table_number: tableNumber || 0,
        items: cart,
        total_amount: cartTotal
      });

      // Handle Mocking
      if (res.data.mock) {
          alert('Dev Mode: Skipping actual payment gateway.');
          completeOrder(res.data.id);
          return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
          alert('Razorpay script failed to load. Please check your connection.');
          setLoading(false);
          return;
      }

      const options = {
        key: 'rzp_test_mock', // Usually environment variable
        amount: res.data.amount,
        currency: res.data.currency,
        name: 'The Luxe Eatery',
        description: 'Quality dining in real-time',
        order_id: res.data.id,
        handler: async (response) => {
          await completeOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#ff4d6d'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Error initiating payment process.');
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (payId) => {
      try {
          const res = await axios.post('http://localhost:5000/api/orders/confirm', {
             table_number: tableNumber || 0,
             items: cart,
             total_amount: cartTotal,
             payment_id: payId
          });
          
          if (res.data.success) {
              clearCart();
              navigate('/success', { state: { token: res.data.token, items: cart, total: cartTotal } });
          }
      } catch (err) {
          console.error(err);
          alert('Order confirmation failed. Please contact staff.');
      }
  };

  if (cart.length === 0) {
      return (
          <div className="screen container" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
              <button className="btn-primary" onClick={() => navigate('/')}>Return to Menu</button>
          </div>
      );
  }

  return (
    <div className="screen container">
      {/* STICKY BRANDING LOGO */}
      <div className="logo-container" style={{ 
          position: 'fixed', 
          top: '40px', 
          left: '40px', 
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.3s ease'
      }}>
          <img 
              src="/logo.jfif" 
              alt="KC Logo" 
              style={{ 
                  height: 'inherit', 
                  width: 'auto', 
                  borderRadius: '12px', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.15)'
              }} 
          />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '120px 0 32px' }}>
        <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '5px' }}>
           <ChevronLeft size={20} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '300' }}>Review Order</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cart.map(item => (
          <div key={item.id} className="menu-item" style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontWeight: '500', fontSize: '15px' }}>{item.name} <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>x {item.qty}</span></div>
               {item.type === 'veg' ? (
                   <div style={{ border: '1.5px solid #4CAF50', padding: '1px', borderRadius: '2px', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '6px', height: '6px', background: '#4CAF50', borderRadius: '50%' }}></div>
                   </div>
               ) : (
                   <div style={{ border: '1.5px solid #F44336', padding: '1px', borderRadius: '2px', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '6px', height: '6px', background: '#F44336', borderRadius: '50%' }}></div>
                   </div>
               )}
            </div>
            <div style={{ fontWeight: '400', fontSize: '14px' }}>₹{item.price * item.qty}</div>
          </div>
        ))}

        <div className="menu-item" style={{ display: 'block', marginTop: '24px', background: 'transparent', borderTop: '1px solid var(--card-border)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Subtotal</span>
              <span style={{ fontSize: '14px' }}>₹{cartTotal}</span>
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>GST (5%)</span>
              <span style={{ fontSize: '14px' }}>₹{(cartTotal * 0.05).toFixed(2)}</span>
           </div>
           <div style={{ height: '1px', background: 'var(--card-border)', margin: '20px 0' }} />
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: '300', letterSpacing: '0.05em' }}>₹{(cartTotal * 1.05).toFixed(2)}</span>
           </div>
        </div>
      </div>

      <div style={{ padding: '32px 0 64px' }}>
        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}
          onClick={handlePayment}
          disabled={loading}
        >
          <CreditCard size={18} />
          {loading ? 'Processing...' : 'Pay safe with Razorpay'}
        </button>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '11px', marginTop: '16px', letterSpacing: '0.05em' }}>
           SECURE 256-BIT ENCRYPTED PAYMENT
        </p>
      </div>
    </div>
  );
};

export default CheckoutPage;

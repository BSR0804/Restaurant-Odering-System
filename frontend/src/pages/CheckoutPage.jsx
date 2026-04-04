import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, ShoppingBag, Truck, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = ({ cart, addToCart, removeFromCart, clearCart, tableNumber }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('google_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

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
        total_amount: cartTotal,
        user_email: JSON.parse(localStorage.getItem('google_user') || '{}').email || null
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
          name: user?.name || 'Customer',
          email: user?.email || 'customer@example.com',
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

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const completeOrder = async (payId) => {
      try {
          const scheduled_at = isScheduled ? `${scheduledDate}T${scheduledTime}:00` : null;

          const res = await axios.post('http://localhost:5000/api/orders/confirm', {
             table_number: tableNumber || 0,
             items: cart,
             total_amount: cartTotal,
             payment_id: payId,
             user_email: JSON.parse(localStorage.getItem('google_user') || '{}').email || null,
             scheduled_at // THE FIX: Pass scheduling info
          });
          
          if (res.data.success) {
              clearCart();
              const totalWithTax = (cartTotal * 1.05).toFixed(2);
              navigate('/success', { state: { 
                token: res.data.token, 
                orderId: res.data.order_id, 
                items: cart, 
                total: totalWithTax, 
                tableNumber,
                scheduled_at: res.data.scheduled_at
              } });
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
    <div className="screen container animate-global-fade">
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               {item.type === 'veg' ? (
                   <div style={{ border: '1.5px solid #4CAF50', padding: '1px', borderRadius: '2px', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '6px', height: '6px', background: '#4CAF50', borderRadius: '50%' }}></div>
                   </div>
               ) : (
                   <div style={{ border: '1.5px solid #F44336', padding: '1px', borderRadius: '2px', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <div style={{ width: '6px', height: '6px', background: '#F44336', borderRadius: '50%' }}></div>
                   </div>
               )}
               
               <div style={{ flex: 1 }}>
                 <div style={{ fontWeight: '500', fontSize: '15px', color: 'white' }}>{item.name}</div>
                 <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>₹{item.price}</div>
               </div>

               {/* QUANTITY CONTROLS */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button 
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                  >
                      <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                  <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                  >
                      <Plus size={14} />
                  </button>
               </div>
            </div>
            
            <div style={{ fontWeight: '400', fontSize: '14px', marginLeft: '24px' }}>₹{item.price * item.qty}</div>
          </div>
        ))}

        {/* SCHEDULING SECTION */}
        <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h4 style={{ fontSize: '15px', color: 'white', fontWeight: '500' }}>Schedule for Later?</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Pick a custom time for your meal (IST)</p>
              </div>
              <div 
                onClick={() => setIsScheduled(!isScheduled)}
                style={{ 
                    width: '44px', height: '24px', borderRadius: '12px', background: isScheduled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', 
                    border: `1px solid ${isScheduled ? '#22c55e' : 'rgba(255,255,255,0.1)'}`, position: 'relative', cursor: 'pointer', transition: 'all 0.2s' 
                }}
              >
                  <motion.div animate={{ x: isScheduled ? 22 : 0 }} style={{ width: '18px', height: '18px', borderRadius: '50%', background: isScheduled ? '#22c55e' : '#444', position: 'absolute', top: '2px', left: '2px' }} />
              </div>
           </div>

           {isScheduled && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px' }}>
                   <div style={{ flex: 1 }}>
                       <label style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Date</label>
                       <input 
                           type="date" 
                           min={new Date().toISOString().split('T')[0]}
                           value={scheduledDate}
                           onChange={(e) => setScheduledDate(e.target.value)}
                           style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
                       />
                   </div>
                   <div style={{ flex: 1 }}>
                       <label style={{ fontSize: '9px', color: '#555', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>Time (24h)</label>
                       <input 
                           type="time" 
                           value={scheduledTime}
                           onChange={(e) => setScheduledTime(e.target.value)}
                           style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
                       />
                   </div>
               </motion.div>
           )}
        </div>

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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Search, Utensils, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuPage = ({ cart, addToCart, removeFromCart, tableNumber }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/menu')
      .then(res => {
        setMenu(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (loading) return (
    <div className="screen glass" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="gradient-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>LUXE EATERY</div>
    </div>
  );

  return (
    <div className="screen">
      <div className="container" style={{ position: 'absolute', top: '40px', left: '0', right: '0', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
           <button 
             onClick={() => navigate('/')} 
             className="btn-ghost" 
             style={{ 
               padding: '10px 20px', 
               borderRadius: '99px', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '8px', 
               fontSize: '13px',
               marginLeft: '20px'
             }}
           >
             <ChevronLeft size={16} /> Back
           </button>
        </div>
      </div>

      <header className="header container animate-in" style={{ padding: '80px 0 40px', textAlign: 'center' }}>
        <img 
          src="/logo.jfif" 
          alt="KC Logo" 
          style={{ 
            height: '80px', 
            width: 'auto', 
            borderRadius: '12px', 
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }} 
        />
        <h1 className="menu-title" style={{ fontWeight: '800', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '16px' }}>KC RESTAURANT</h1>
        {tableNumber && tableNumber !== 'Walking' && (
          <div style={{ marginTop: '24px' }}>
            <span className="glass" style={{ padding: '8px 24px', borderRadius: '99px', fontSize: '12px', color: 'var(--text-dim)', border: '1px solid var(--card-border)', letterSpacing: '0.2em' }}>
              TABLE #{tableNumber}
            </span>
          </div>
        )}
      </header>

      {/* Categories */}
      <div className="category-scroll-wrapper" style={{ position: 'sticky', top: '0', background: 'var(--bg)', zIndex: 100, padding: '10px 0' }}>
        <div className="container" style={{ overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div style={{ display: 'flex', gap: '12px', paddingRight: '24px' }}>
            <div 
              className={`category-chip ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All
            </div>
            {menu.map(cat => (
              <div 
                key={cat.category}
                className={`category-chip ${activeCategory === cat.category ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.category)}
              >
                {cat.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container" style={{ flex: 1, paddingBottom: '120px' }}>
        {menu
          .filter(cat => activeCategory === 'All' || cat.category === activeCategory)
          .map(cat => (
            <div key={cat.category} className="animate-in">
              <div className="category-header">
                {cat.category}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cat.items.map(item => (
                  <div key={item.id} className="menu-item">
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text)' }}>{item.name}</div>
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
                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' }}>{item.description}</div>
                      <div style={{ color: 'var(--text)', fontSize: '14px', marginTop: '12px', fontWeight: '400' }}>₹{item.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <AnimatePresence>
                        {cart.find(i => i.id === item.id) && (
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
                          >
                            <button onClick={() => removeFromCart(item)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: '500', fontSize: '14px', width: '12px', textAlign: 'center' }}>
                              {cart.find(i => i.id === item.id).qty}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button onClick={() => addToCart(item)} className="btn-add">
                        {cart.find(i => i.id === item.id) ? <Plus size={14} /> : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100, x: '-50%' }}
          animate={{ y: 0, x: '-50%' }}
          className="cart-bar"
          onClick={() => navigate('/checkout')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              {cart.reduce((sum, i) => sum + i.qty, 0)}
            </div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>View Bag</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>₹{cartTotal}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MenuPage;

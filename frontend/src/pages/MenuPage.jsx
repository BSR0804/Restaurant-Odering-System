import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, ChevronLeft, AlertCircle, Leaf, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const MenuPage = ({ cart, addToCart, removeFromCart, tableNumber }) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [justRemoved, setJustRemoved] = useState(null);
  const [vegActive, setVegActive] = useState(false);
  const [nonVegActive, setNonVegActive] = useState(false);
  const navigate = useNavigate();

  const fetchMenu = () => {
    axios.get('http://localhost:5000/api/menu')
      .then(res => {
        setMenu(res.data);
        if (res.data.length > 0) setActiveCategory(res.data[0].category);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMenu();
    
    socket.on('menu_update', (data) => {
        const inCart = cart.find(i => i.id === data.id);
        if (inCart && !data.is_available) {
            setJustRemoved(inCart.name);
            setTimeout(() => setJustRemoved(null), 5000);
        }

        setMenu(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.map(item => item.id === data.id ? { ...item, is_available: data.is_available } : item)
        })));
    });

    return () => socket.off('menu_update');
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const filterItems = (items) => {
    if ((!vegActive && !nonVegActive) || (vegActive && nonVegActive)) return items;
    if (vegActive) return items.filter(i => i.type === 'veg');
    if (nonVegActive) return items.filter(i => i.type === 'non-veg');
    return items;
  };

  if (loading) return (
    <div className="screen glass" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="gradient-text" style={{ fontSize: '24px', fontWeight: 'bold' }}>LUXE EATERY</div>
    </div>
  );

  return (
    <div className="screen">
      <div className="container" style={{ position: 'absolute', top: '40px', left: '0', right: '0', zIndex: 100, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
           <button onClick={() => navigate('/')} className="btn-ghost" style={{ padding: '10px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginLeft: '20px' }}>
             <ChevronLeft size={16} /> Back
           </button>
        </div>
      </div>

      <header className="header container animate-in" style={{ padding: '60px 0 0', textAlign: 'center' }}>
        <img src="/logo.jfif" alt="KC Logo" style={{ height: '80px', width: 'auto', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
        
        {/* Veg/Non-Veg Filter */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '0 auto 12px', maxWidth: '280px' }}>
            {/* Veg Button */}
            <button 
                onClick={() => { 
                    setVegActive(!vegActive);
                    setNonVegActive(false); 
                }}
                style={{ 
                    height: '36px', padding: '0 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                    background: vegActive ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.03)',
                    borderColor: vegActive ? 'rgba(22,163,74,0.25)' : 'rgba(255,255,255,0.08)',
                    color: vegActive ? '#16a34a' : '#666'
                }}
            >
                <div style={{ 
                    width: '12px', height: '12px', borderRadius: '3px', border: '1.5px solid #16a34a',
                    background: vegActive ? '#16a34a' : 'transparent'
                }} />
                Veg
            </button>

            {/* Non-Veg Button */}
            <button 
                onClick={() => { 
                    setNonVegActive(!nonVegActive);
                    setVegActive(false); 
                }}
                style={{ 
                    height: '36px', padding: '0 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                    background: nonVegActive ? 'rgba(229,57,75,0.08)' : 'rgba(255,255,255,0.03)',
                    borderColor: nonVegActive ? 'rgba(229,57,75,0.25)' : 'rgba(255,255,255,0.08)',
                    color: nonVegActive ? '#e5394b' : '#666'
                }}
            >
                <div style={{ 
                    width: '0', height: '0', 
                    borderLeft: '7px solid transparent', borderRight: '7px solid transparent', 
                    borderBottom: '12px solid #e5394b',
                    position: 'relative'
                }}>
                    {!nonVegActive && (
                        <div style={{ 
                            position: 'absolute', top: '1.5px', left: '-5.5px', width: '0', height: '0',
                            borderLeft: '5.5px solid transparent', borderRight: '5.5px solid transparent',
                            borderBottom: '10px solid #0A0A0B' // Matches background
                        }} />
                    )}
                </div>
                Non-Veg
            </button>
        </div>

        {tableNumber && tableNumber !== 'Walking' && (
          <div style={{ marginBottom: '16px' }}>
            <span className="glass" style={{ padding: '6px 20px', borderRadius: '99px', fontSize: '9px', color: '#666', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.2em' }}>
              TABLE #{tableNumber}
            </span>
          </div>
        )}
      </header>

      {/* Categories */}
      <div className="category-scroll-wrapper" style={{ position: 'sticky', top: '0', background: 'var(--bg)', zIndex: 100, padding: '4px 0' }}>
        <div className="container" style={{ overflowX: 'auto', paddingLeft: '24px', paddingRight: '24px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            {menu.map(cat => (
              <div 
                key={cat.category} 
                className={`category-chip ${activeCategory === cat.category ? 'active' : ''}`} 
                onClick={() => {
                  setActiveCategory(cat.category);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {cat.category}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="container" style={{ flex: 1, paddingBottom: '140px', marginTop: '0' }}>
        <AnimatePresence mode="wait">
            {justRemoved && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 16px', borderRadius: '12px', color: '#ef4444', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> "{justRemoved}" is no longer available and removed from your bag.
                </motion.div>
            )}
        </AnimatePresence>

        {menu.filter(cat => cat.category === activeCategory).map(cat => {
            const filteredItems = filterItems(cat.items);
            return (
                <div key={cat.category}>
                    <div className="category-header" style={{ fontSize: '11px', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{cat.category}</div>
                    
                    <div style={{ marginTop: '0px', minHeight: '100px' }}>
                        <AnimatePresence mode="popLayout">
                            {filteredItems.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                                >
                                    <Utensils size={32} color="rgba(255,255,255,0.05)" />
                                    <span style={{ fontSize: '13px', color: '#444' }}>
                                        No {vegActive ? 'veg' : 'non-veg'} items in this category
                                    </span>
                                </motion.div>
                            ) : (
                                filteredItems.map(item => (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.25 }}
                                        className="menu-item"
                                        style={{ 
                                            opacity: item.is_available ? 1 : 0.4,
                                            pointerEvents: item.is_available ? 'auto' : 'none',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ 
                                                    fontWeight: '500', fontSize: '15px', color: 'white',
                                                    textDecoration: item.is_available ? 'none' : 'line-through'
                                                }}>
                                                    {item.name} 
                                                </span>
                                                <div style={{ 
                                                    width: '8px', height: '8px', borderRadius: '50%', 
                                                    background: item.type === 'veg' ? '#16a34a' : '#e5394b',
                                                    boxShadow: `0 0 8px ${item.type === 'veg' ? 'rgba(22,163,74,0.3)' : 'rgba(229,57,75,0.3)'}`
                                                }} />
                                            </div>
                                            <div style={{ color: 'white', fontSize: '14px', marginTop: '6px', fontWeight: '500' }}>₹{item.price}</div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {item.is_available ? (
                                                <>
                                                    <AnimatePresence>
                                                        {cart.find(i => i.id === item.id) && (
                                                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <button onClick={() => removeFromCart(item)} className="btn-ghost" style={{ padding: '4px' }}><Minus size={14} /></button>
                                                                <span style={{ fontSize: '14px', fontWeight: '600', width: '12px', textAlign: 'center' }}>{cart.find(i => i.id === item.id).qty}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                    <button onClick={() => addToCart(item)} className="btn-add">
                                                        {cart.find(i => i.id === item.id) ? <Plus size={14} /> : 'Add'}
                                                    </button>
                                                </>
                                            ) : (
                                                <div style={{ padding: '4px 12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '99px', fontSize: '11px', color: '#444' }}>Sold Out</div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            );
        })}
      </div>

      {cart.length > 0 && (
        <motion.div initial={{ y: 100, x: '-50%' }} animate={{ y: 0, x: '-50%' }} className="cart-bar" onClick={() => navigate('/checkout')}>
            <span style={{ fontWeight: '600' }}>{cart.reduce((sum, i) => sum + i.qty, 0)} Items</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '500' }}>View Bag</span>
                <div style={{ width: '4px', height: '4px', background: '#C9A96E', borderRadius: '50%' }} />
                <span style={{ fontWeight: '600' }}>₹{cartTotal}</span>
            </div>
        </motion.div>
      )}
    </div>
  );
};

export default MenuPage;

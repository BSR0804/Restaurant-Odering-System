import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Clock, CheckCircle, Package, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api';

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('google_user');
        if (!stored) {
            navigate('/');
            return;
        }
        const userData = JSON.parse(stored);
        setUser(userData);
        fetchOrders(userData.email);
    }, []);

    const fetchOrders = async (email) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/user/orders?email=${email}`);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('google_user');
        navigate('/');
    };

    const getScheduledTimeDisplay = (order) => {
        try {
            if (order.scheduled_at) {
                const d = new Date(order.scheduled_at);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
                }
            }
        } catch (e) {
            console.error("Date formatting error:", e);
        }
        
        // Metadata fallback if column is missing or date is invalid
        if (Array.isArray(order.items)) {
            const schedItem = order.items.find(i => i.name?.startsWith('⏰'));
            if (schedItem) {
                return schedItem.name.replace('⏰ SCHEDULED: ', '');
            }
        }
        return null;
    };

    return (
        <div className="screen container animate-global-fade">
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '60px 0 32px' }}>
                <button onClick={() => navigate('/menu')} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '5px' }}>
                <ChevronLeft size={20} />
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '300' }}>Your Account</h2>
            </div>

            {/* PROFILE CARD */}
            <div className="glass" style={{ padding: '32px', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <img 
                            src={user?.picture || "/logo.jpg"} 
                            alt="Profile" 
                            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent)' }} 
                        />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '4px' }}>{user?.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{user?.email}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>Order History</h4>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
                {loading ? (
                    // SHIMMER SKELETON UI
                    [1, 2, 3].map(i => (
                        <div key={i} className="menu-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px', gap: '16px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.01)', opacity: 0.5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ height: '20px', width: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} className="pulse" />
                                <div style={{ height: '20px', width: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} className="pulse" />
                            </div>
                            <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} className="pulse" />
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                        <ShoppingBag size={40} style={{ marginBottom: '16px' }} />
                        <p>No orders yet. Your history will appear here.</p>
                    </div>
                ) : (
                    orders.map(order => {
                        if (!order) return null;
                        const safeStatus = order.status || 'pending';
                        return (
                            <div key={order.id} className="menu-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px', gap: '16px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent)' }}>{order.token_number}</span>
                                            <div style={{ height: '4px', width: '4px', background: '#333', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Table {order.table_number || '0'}</span>
                                        </div>
                                        {getScheduledTimeDisplay(order) && (
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '5px', 
                                                padding: '3px 10px',
                                                background: 'rgba(201,169,110,0.1)',
                                                border: '1px solid rgba(201,169,110,0.2)',
                                                borderRadius: '6px',
                                                width: 'fit-content'
                                            }}>
                                                <div style={{ width: '3px', height: '3px', background: '#C9A96E', borderRadius: '50%' }} />
                                                <span style={{ fontSize: '9px', color: '#C9A96E', fontWeight: 'bold' }}>{getScheduledTimeDisplay(order)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '6px', 
                                        fontSize: '10px', 
                                        fontWeight: 'bold',
                                        background: safeStatus === 'complete' ? 'rgba(34,197,94,0.1)' : 'rgba(201,169,110,0.1)',
                                        color: safeStatus === 'complete' ? '#22c55e' : '#C9A96E',
                                        textTransform: 'uppercase'
                                    }}>
                                        {safeStatus}
                                    </div>
                                </div>

                            <div style={{ width: '100%' }}>
                                {Array.isArray(order.items) ? order.items.filter(i => !i.name.startsWith('⏰')).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--text-dim)' }}>
                                        <span>{item.name} × {item.qty}</span>
                                        <span>₹{item.price * item.qty}</span>
                                    </div>
                                )) : <p style={{ fontSize: '11px', color: '#444' }}>No items found</p>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#444', fontSize: '11px' }}>
                                    <Clock size={12} />
                                    {(() => {
                                        try {
                                            const d = new Date(order.created_at);
                                            if (isNaN(d.getTime())) return "Unknown date";
                                            return `${d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })} at ${d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}`;
                                        } catch (e) { return "Unknown date"; }
                                    })()}
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500' }}>₹{order.total_amount}</span>
                            </div>
                        </div>
                    );
                })
            )}
            </div>
        </div>
    );
};

export default AccountPage;

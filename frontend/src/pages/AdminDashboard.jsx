import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Bell, Clock, MapPin, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ user: '', pass: '' });
    const [error, setError] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginData.user === 'admin' && loginData.pass === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Invalid credentials');
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchOrders = () => {
            setLoading(true);
            axios.get('http://localhost:5000/api/admin/orders')
                .then(res => {
                    setOrders(res.data);
                    setError(null);
                })
                .catch(err => {
                    console.error('Fetch Error:', err);
                    setError('Failed to fetch orders. Check backend connection.');
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        fetchOrders();

        socket.emit('join-dashboard');
        
        const handleNewOrder = (data) => {
            setOrders(prev => [data, ...prev]);
            const badge = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
            badge.play().catch(() => {});
        };

        socket.on('new-order', handleNewOrder);

        return () => {
            socket.off('new-order', handleNewOrder);
        };
    }, [isAuthenticated]);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/orders/${id}`, { status: newStatus });
            if (newStatus === 'completed') {
                setOrders(prev => prev.filter(o => o.id !== id));
            } else {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!isAuthenticated) return (
        <div className="screen container" style={{ justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: '40px' }}>
                <h2 className="gradient-text" style={{ marginBottom: '20px' }}>Staff Portal</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Username" className="glass" style={{ width: '100%', padding: '12px', marginBottom: '15px', color: 'white' }} onChange={(e) => setLoginData({...loginData, user: e.target.value})} />
                    <input type="password" placeholder="Password" className="glass" style={{ width: '100%', padding: '12px', marginBottom: '25px', color: 'white' }} onChange={(e) => setLoginData({...loginData, pass: e.target.value})} />
                    <button className="btn-primary" style={{ width: '100%' }}>Enter Dashboard</button>
                </form>
            </motion.div>
        </div>
    );

    if (loading) return (
        <div className="screen container glass" style={{ justifyContent: 'center', alignItems: 'center' }}>
             <p className="animate-in">Connecting to Live Feed...</p>
        </div>
    );

    if (error) return (
        <div className="screen container glass" style={{ justifyContent: 'center', alignItems: 'center' }}>
             <p style={{ color: 'var(--primary)', marginBottom: '20px' }}>{error}</p>
             <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
    );

    return (
        <div className="screen dashboard" style={{ padding: '0px' }}>
            <div className="glass" style={{ height: '70px', margin: '20px', padding: '0 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Bell size={18} color="var(--primary)" />
                    <h1 style={{ fontSize: '20px', fontWeight: '800' }}>Orders Dashboard</h1>
                </div>
                <div className="glass" style={{ padding: '5px 15px', color: 'var(--success)', fontWeight: 'bold', fontSize: '14px' }}>LIVE</div>
            </div>

            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
                    <AnimatePresence>
                        {orders.map((order, index) => (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass admin-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '800', fontSize: '24px', color: 'var(--primary)' }}>{order.token_number}</div>
                                    <div className={`status-badge status-${order.status}`}>{order.status}</div>
                                </div>
                                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                                    <MapPin size={14} /> <span>Table #{order.table_number}</span>
                                    <Clock size={14} style={{ marginLeft: '10px' }} /> <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="glass" style={{ padding: '10px', marginBottom: '15px', background: 'rgba(0,0,0,0.2)', border: 'none' }}>
                                    {order.items.map(item => (
                                        <div key={item.id} style={{ fontSize: '14px', marginBottom: '5px' }}>{item.name} x {item.qty}</div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {order.status === 'paid' && <button className="btn-primary" style={{ flex: 1, background: '#ffd166', color: '#000' }} onClick={() => updateStatus(order.id, 'ready')}>READY</button>}
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => updateStatus(order.id, 'completed')}>COMPLETE</button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {orders.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', opacity: 0.5 }}>Waiting for orders...</div>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

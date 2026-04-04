import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, ShoppingBag, Clock, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { googleLogout } from '@react-oauth/google';

const AccountPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('google_user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        
        // Since Google OAuth 2.0 response usually includes an access_token or id_token, 
        // normally we'd fetch profile info. 
        // For this demo, let's assume we store a simple object.
        // In the LandingPage login, we just stored the token response.
        // We might need to fetch the actual profile if it's not and encoded in the token.
        // But for simplicity, I'll update LandingPage to store some basic info if possible, 
        // or just use a placeholder if the email isn't there.
        
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchOrders(userData.email || 'customer@example.com');
    }, []);

    const fetchOrders = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/user/orders?email=${email}`);
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem('google_user');
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#22c55e';
            case 'ready': return '#C9A96E';
            case 'paid': return '#3b82f6';
            default: return '#666';
        }
    };

    return (
        <div className="screen container" style={{ background: '#0A0A0B', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '120px 0 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/menu')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: '300' }}>Your Account</h2>
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* Profile Info Placeholder */}
            <div className="glass" style={{ padding: '32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(45deg, #C9A96E, #8C7342)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: '500' }}>{user?.email || 'Valued Customer'}</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Google Authenticated</div>
                </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={18} /> Order History
            </h3>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>Loading your orders...</div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Package size={48} style={{ color: '#222', marginBottom: '16px' }} />
                    <p style={{ color: '#666' }}>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
                    {orders.map(order => (
                        <motion.div 
                            key={order.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="glass" 
                            style={{ padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{order.token_number}</div>
                                    <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', marginTop: '4px' }}>
                                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div style={{ 
                                    padding: '4px 12px', 
                                    borderRadius: '99px', 
                                    fontSize: '10px', 
                                    fontWeight: '700', 
                                    textTransform: 'uppercase',
                                    background: `${getStatusColor(order.status)}20`,
                                    color: getStatusColor(order.status),
                                    border: `1px solid ${getStatusColor(order.status)}40`
                                }}>
                                    {order.status}
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '13px', color: '#AAA', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.name} × {item.qty}</span>
                                        <span>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ fontSize: '11px', color: '#555' }}>Table: {order.table_number}</div>
                                    <div style={{ fontSize: '11px', color: '#555' }}>Payment: {order.payment_ref ? 'Verified' : 'Pending'}</div>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '300' }}>₹{order.total_amount}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountPage;

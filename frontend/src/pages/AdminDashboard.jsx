import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  LayoutGrid, 
  History, 
  Settings, 
  Volume2, 
  VolumeX, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Loader2,
  Calendar,
  TrendingUp,
  BarChart3,
  CalendarDays,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { socket, API_BASE_URL } from '../api';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [fullMenu, setFullMenu] = useState([]);
    const [activeTab, setActiveTab] = useState(localStorage.getItem('admin_active_tab') || 'live');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_session'));
    const [loginData, setLoginData] = useState({ user: '', pass: '' });
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [toasts, setToasts] = useState([]);
    const audioRef = React.useRef(null);
    const [isPulsing, setIsPulsing] = useState(false);

    // THE FIX: Use a Ref to ensure the socket listener always has access to the latest ringBell function
    const ringBellRef = React.useRef(null);

    const ringBell = (force = false) => {
        // Only skip if muted AND not forced (Test button forces it)
        if (!soundRef.current && !force) return;
        
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
        
        try {
            // THE FIX: Use the most working path found so far
            const bell = new Audio('/admin-bell.wav');
            bell.play().catch(e => console.warn("🔔 Bell blocked:", e));
            
            // Fallback: Also try DOM engine if exists
            const domBell = document.getElementById('admin-bell-engine');
            if (domBell) {
                domBell.currentTime = 0;
                domBell.play().catch(() => {});
            }
        } catch (err) {
            console.error("Critical Sound Error:", err);
        }
    };

    // Update the ref every render so the socket listener always gets the current function
    useEffect(() => { ringBellRef.current = ringBell; });

    // Category / Filter States
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loadingItems, setLoadingItems] = useState([]);
    const [flashingItems, setFlashingItems] = useState([]);
    const getLocalDateStr = () => {
        // Force IST (Indian Standard Time) regardless of browser/server timezone
        const now = new Date();
        const istOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        const parts = new Intl.DateTimeFormat('en-CA', istOptions).format(now); // en-CA gives YYYY-MM-DD
        return parts;
    };
    const [selectedDate, setSelectedDate] = useState(getLocalDateStr());

    const handleLogin = (e) => {
        e.preventDefault();
        // Secure Staff Portal Login (Credentials: admin/admin123)
        if (loginData.user === 'admin' && loginData.pass === 'admin123') {
            localStorage.setItem('admin_session', 'active_secret_tk_' + Date.now());
            setIsAuthenticated(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out from the Staff Portal?")) {
            localStorage.removeItem('admin_session');
            localStorage.removeItem('admin_active_tab');
            setIsAuthenticated(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        localStorage.setItem('admin_active_tab', tab);
        // THE FIX: Prime audio context on tab change to prevent browser blocking
        if (audioRef.current && soundEnabled) {
            audioRef.current.muted = true;
            audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.muted = false;
            }).catch(() => {});
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            // THE FIX: Explicit IST Time formatting
            setCurrentTime(new Date().toLocaleTimeString('en-IN', { 
                timeZone: 'Asia/Kolkata', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        try {
            const resOrders = await axios.get(`${API_BASE_URL}/api/admin/orders`);
            setOrders(Array.isArray(resOrders.data) ? resOrders.data : []);
        } catch (e) { console.error("LiveOrders Error:", e); }

        try {
            const tz = new Date().getTimezoneOffset();
            const resHistory = await axios.get(`${API_BASE_URL}/api/history/orders?date=${selectedDate}&tzOffset=${tz}`);
            setHistory(Array.isArray(resHistory.data.orders) ? resHistory.data.orders : []);
        } catch (e) { console.error("HistoryOrders Error:", e); }

        try {
            const resMenu = await axios.get(`${API_BASE_URL}/api/menu`);
            const rawData = resMenu.data || [];
            setFullMenu(rawData);
        } catch (e) { console.error("Menu Error:", e); }
    };

    const soundRef = React.useRef(soundEnabled);
    const dateRef = React.useRef(selectedDate);
    useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);
    useEffect(() => { dateRef.current = selectedDate; }, [selectedDate]);

    // THE FIX: Move ALL socket listeners to a persistent global effect to prevent 
    // interruption when changing dates or tabs in the historical view.
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleConnect = () => {
            setIsConnected(true);
            socket.emit('join-dashboard');
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleNewOrder = (data) => {
            setOrders(prev => {
                const exists = prev.find(o => String(o.id) === String(data.id));
                return exists ? prev : [data, ...prev];
            });
            const toastId = Date.now();
            setToasts(prev => [...prev, { id: toastId, token: data.token_number }]);
            setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== toastId)); }, 4000);
            if (ringBellRef.current) ringBellRef.current();
        };
        const handleOrderComplete = (completedOrder) => {
            setOrders(prev => prev.filter(o => String(o.id) !== String(completedOrder.id)));
            if (completedOrder.created_at) {
                const d = new Date(completedOrder.created_at);
                const orderDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
                if (orderDate === dateRef.current) {
                    setHistory(prev => {
                        const exists = prev.find(h => String(h.id) === String(completedOrder.id));
                        return exists ? prev : [completedOrder, ...prev];
                    });
                }
            }
        };
        const handleMenuUpdate = (data) => {
            setFullMenu(prev => prev.map(cat => ({
                ...cat,
                items: cat.items.map(item => item.id === data.id ? { ...item, is_available: data.is_available } : item)
            })));
            setFlashingItems(prev => [...prev, data.id]);
            setTimeout(() => { setFlashingItems(prev => prev.filter(id => id !== data.id)); }, 3000);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('new-order', handleNewOrder);
        socket.on('order_complete', handleOrderComplete);
        socket.on('menu_update', handleMenuUpdate);

        if (socket.connected) handleConnect();

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('new-order', handleNewOrder);
            socket.off('order_complete', handleOrderComplete);
            socket.off('menu_update', handleMenuUpdate);
        };
    }, [isAuthenticated]);

    // Data-specific refresh on date change
    useEffect(() => {
        if (isAuthenticated) fetchData();
    }, [isAuthenticated, selectedDate]);

    // THE FIX: Move to history ONLY AFTER Confirmed Cloud Write (Fix 6)
    const updateOrderStatus = async (id, newStatus) => {
        // OPTIMISTIC UI: Update status locally immediately
        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => String(o.id) === String(id) ? { ...o, status: newStatus } : o));

        try {
            const res = await axios.patch(`${API_BASE_URL}/api/admin/orders/${id}`, { status: newStatus });
            
            if (res.status === 200) {
                const updatedOrder = res.data;
                
                if (newStatus === 'complete') {
                    setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
                    setHistory(prev => {
                        const exists = prev.find(h => String(h.id) === String(updatedOrder.id));
                        return exists ? prev : [updatedOrder, ...prev];
                    });
                    const toastId = Date.now();
                    setToasts(prev => [...prev, { id: toastId, token: `Success: Order ${updatedOrder.token_number} is Complete` }]);
                    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== toastId)); }, 4000);
                }
            }
        } catch (err) { 
            console.error("Order Status Update Error:", err);
            // REVERT on failure
            setOrders(previousOrders);
            alert("Error: Cloud could not confirm the completion signal.");
        }
    };

    const toggleAvailability = async (item) => {
        const newStatus = !item.is_available;
        setLoadingItems(prev => [...prev, item.id]);

        // OPTIMISTIC UPDATE: Update UI immediately
        setFullMenu(prev => prev.map(cat => ({
            ...cat,
            items: cat.items.map(it => it.id === item.id ? { ...it, is_available: newStatus } : it)
        })));

        try {
            await axios.patch(`${API_BASE_URL}/api/menu/${item.id}/availability`, { is_available: newStatus });
        } catch (err) {
            console.error("Menu Availability Error:", err);
            // REVERT on error
            setFullMenu(prev => prev.map(cat => ({
                ...cat,
                items: cat.items.map(it => it.id === item.id ? { ...it, is_available: !newStatus } : it)
            })));
        } finally {
            setLoadingItems(prev => prev.filter(id => id !== item.id));
        }
    };

    const totalRevenue = history.reduce((sum, h) => sum + (parseFloat(h.total_amount) || 0), 0);
    const totalOrdersProcessed = history.length;

    const isScheduled = (order) => {
        if (order.scheduled_at) return true;
        if (order.items?.[0]?.name?.startsWith('⏰')) return true;
        return false;
    };

    const getScheduledTimeDisplay = (order) => {
        if (order.scheduled_at) {
            return new Date(order.scheduled_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
        }
        if (order.items?.[0]?.name?.startsWith('⏰')) {
            return order.items[0].name.replace('⏰ SCHEDULED: ', '');
        }
        return null;
    };

    const categories = [...new Set(fullMenu.map(i => i.category))];
    useEffect(() => {
        if (categories.length > 0 && categoryFilter === 'All') {
            setCategoryFilter(categories[0]);
        }
    }, [fullMenu]);

    const filteredMenu = (fullMenu.find(cat => cat.category === categoryFilter)?.items || []).filter(item => {
        const statusMatch = statusFilter === 'All' || 
                            (statusFilter === 'Available' && item.is_available) || 
                            (statusFilter === 'Unavailable' && !item.is_available);
        return statusMatch;
    });

    if (!isAuthenticated) return (
        <div className="screen animate-global-fade" style={{ background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '360px', padding: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>Staff Portal</h2>
                <form onSubmit={handleLogin} style={{ marginTop: '32px' }}>
                    <input type="text" placeholder="Username" style={{ width: '100%', height: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '14px', marginBottom: '16px' }} onChange={(e) => setLoginData({...loginData, user: e.target.value})} />
                    <input type="password" placeholder="Password" style={{ width: '100%', height: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0 16px', color: 'white', fontSize: '14px', marginBottom: '32px' }} onChange={(e) => setLoginData({...loginData, pass: e.target.value})} />
                    <button className="btn-primary" style={{ width: '100%', height: '48px', borderRadius: '12px' }}>Enter Dashboard</button>
                </form>
            </motion.div>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            <aside className="dashboard-sidebar">
                <div style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>Kitchen Caboodle</div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner dashboard</div>
                </div>

                <nav style={{ padding: '16px' }}>
                    <button onClick={() => switchTab('live')} style={{ width: '100%', height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'live' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'live' ? 'white' : '#888', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <LayoutGrid size={16} /> Live orders
                        </div>
                        {orders.filter(o => !isScheduled(o)).length > 0 && (
                            <motion.span 
                                key={orders.filter(o => !isScheduled(o)).length}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ 
                                    background: '#C9A96E', 
                                    color: 'black', 
                                    fontSize: '10px', 
                                    fontWeight: 'bold', 
                                    padding: '2px 6px', 
                                    borderRadius: '6px' 
                                }}
                            >
                                {orders.filter(o => !isScheduled(o)).length}
                            </motion.span>
                        )}
                    </button>

                    <button onClick={() => switchTab('scheduled')} style={{ width: '100%', height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'scheduled' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'scheduled' ? 'white' : '#888', transition: 'all 0.2s', marginTop: '8px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={16} /> Scheduled
                        </div>
                        {orders.filter(o => isScheduled(o)).length > 0 && (
                            <motion.span 
                                key={orders.filter(o => isScheduled(o)).length}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ 
                                    background: 'rgba(201,169,110,0.2)', 
                                    color: '#C9A96E', 
                                    fontSize: '10px', 
                                    fontWeight: 'bold', 
                                    padding: '2px 6px', 
                                    borderRadius: '6px',
                                    border: '1px solid rgba(201,169,110,0.3)'
                                }}
                            >
                                {orders.filter(o => isScheduled(o)).length}
                            </motion.span>
                        )}
                    </button>

                    <button onClick={() => switchTab('history')} style={{ width: '100%', height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'history' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'history' ? 'white' : '#888', transition: 'all 0.2s', marginTop: '8px' }}>
                        <History size={16} /> Order history
                    </button>
                    <button onClick={() => switchTab('settings')} style={{ width: '100%', height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: activeTab === 'settings' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'settings' ? 'white' : '#888', transition: 'all 0.2s', marginTop: '8px' }}>
                        <Settings size={16} /> Menu settings
                    </button>

                    <button onClick={handleLogout} style={{ width: '100%', height: '40px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', transition: 'all 0.2s', marginTop: '16px' }}>
                        <LogOut size={16} /> Sign out
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', padding: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={`status-dot ${isConnected ? 'status-dot-green' : 'status-dot-red'} ${isPulsing ? 'pulse-gold' : ''}`} />
                    <span style={{ fontSize: '12px', color: isPulsing ? '#C9A96E' : '#555', fontWeight: isPulsing ? 'bold' : 'normal' }}>
                        {isPulsing ? '🔔 ORDER RECEIVED' : (isConnected ? 'Connected' : 'Syncing...')}
                    </span>
                </div>
            </aside>

            <main className="dashboard-main">
                <header style={{ height: '56px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#080809' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '500', color: 'white' }}>
                            {activeTab === 'live' ? 'Live orders' : activeTab === 'scheduled' ? 'Scheduled orders' : activeTab === 'history' ? 'Order history' : 'Menu settings'}
                        </span>
                        {activeTab === 'settings' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '4px', height: '4px', background: '#22c55e', borderRadius: '50%' }} /> Live
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="date" 
                                        value={selectedDate} 
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            setSelectedDate(newDate);
                                            localStorage.setItem('admin_selected_date', newDate);
                                        }}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            color: '#C9A96E', 
                                            padding: '4px 12px', 
                                            borderRadius: '6px', 
                                            fontSize: '11px',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }} 
                                    />
                                    <CalendarDays size={12} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#555' }} />
                                </div>
                                <div style={{ padding: '2px 10px', borderRadius: '99px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', color: '#C9A96E', fontSize: '11px', fontWeight: '600' }}>
                                    REVENUE: ₹{totalRevenue.toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontSize: '13px', color: '#555' }}>{currentTime}</div>
                        {!soundEnabled && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '10px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
                                <XCircle size={10} /> ALERTS MUTED
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                const newVal = !soundEnabled;
                                setSoundEnabled(newVal);
                                if (newVal) ringBell(true);
                            }} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: soundEnabled ? 'white' : '#ef4444' }}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                    </div>
                </header>

                <div style={{ padding: '24px' }}>
                    {activeTab === 'settings' && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setCategoryFilter(cat)} style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', border: '1px solid', transition: 'all 0.2s', cursor: 'pointer', background: categoryFilter === cat ? 'rgba(255,255,255,0.08)' : 'transparent', borderColor: categoryFilter === cat ? 'transparent' : 'rgba(255,255,255,0.07)', color: categoryFilter === cat ? 'white' : '#555' }}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
                                {['Available', 'Unavailable'].map(stat => (
                                    <button key={stat} onClick={() => setStatusFilter(stat)} style={{ padding: '4px 16px', borderRadius: '6px', fontSize: '11px', border: 'none', cursor: 'pointer', background: statusFilter === stat ? 'rgba(255,255,255,0.07)' : 'transparent', color: statusFilter === stat ? 'white' : '#555', transition: 'all 0.2s' }}>
                                        {stat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'live' || activeTab === 'scheduled' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            <AnimatePresence>
                                {orders.filter(o => activeTab === 'scheduled' ? isScheduled(o) : !isScheduled(o)).map(order => (
                                    <motion.div key={order.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{order.token_number}</div>
                                                {/* SCHEDULED ALERT */}
                                                {isScheduled(order) && (
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        marginTop: '6px', 
                                                        padding: '4px 10px', 
                                                        background: 'rgba(201,169,110,0.1)', 
                                                        border: '1px solid rgba(201,169,110,0.2)', 
                                                        borderRadius: '6px',
                                                        width: 'fit-content'
                                                    }}>
                                                        <div style={{ width: '4px', height: '4px', background: '#C9A96E', borderRadius: '50%' }} />
                                                        <span style={{ fontSize: '11px', color: '#C9A96E', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                            {getScheduledTimeDisplay(order)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#555' }}>Table {order.table_number}</span>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            {order.items.filter(i => !i.name.startsWith('⏰')).map((item, idx) => (
                                                <div key={idx} style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{item.name} × {item.qty}</div>
                                            ))}
                                        </div>
                                        {order.status !== 'complete' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    disabled={order.status === 'ready'}
                                                    onClick={() => {
                                                        if (activeTab === 'scheduled' && order.status === 'pending') {
                                                            updateOrderStatus(order.id, 'accepted');
                                                        } else {
                                                            updateOrderStatus(order.id, 'ready');
                                                        }
                                                    }} 
                                                    style={{ 
                                                        flex: 1, background: order.status === 'ready' ? 'rgba(201,169,110,0.02)' : 'rgba(201,169,110,0.1)', 
                                                        color: order.status === 'ready' ? '#444' : '#C9A96E', 
                                                        border: order.status === 'ready' ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(201,169,110,0.2)', 
                                                        padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold',
                                                        cursor: order.status === 'ready' ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {order.status === 'ready' ? 'READY' : (activeTab === 'scheduled' && order.status === 'pending' ? 'ACCEPT' : 'MARK READY')}
                                                </button>
                                                <button onClick={() => updateOrderStatus(order.id, 'complete')} style={{ flex: 1, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'none', padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>COMPLETE</button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : activeTab === 'history' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px' }}>
                                        <TrendingUp size={24} color="#22c55e" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>Total Revenue</p>
                                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>₹{totalRevenue.toLocaleString()}</h3>
                                    </div>
                                </div>
                                <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(201,169,110,0.1)', borderRadius: '12px' }}>
                                        <BarChart3 size={24} color="#C9A96E" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>Orders Processed</p>
                                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{totalOrdersProcessed}</h3>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.01)' }}>
                                    <tr style={{ textAlign: 'left', fontSize: '11px', color: '#444' }}>
                                        <th style={{ padding: '16px 24px' }}>Token</th>
                                        <th style={{ padding: '16px 24px' }}>Items</th>
                                        <th style={{ padding: '16px 24px' }}>Table</th>
                                        <th style={{ padding: '16px 24px' }}>IST Time</th>
                                        <th style={{ padding: '16px 24px' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody style={{ fontSize: '13px', color: '#888' }}>
                                    {history.map(row => (
                                        <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '16px 24px', color: 'white' }}>{row.token_number}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {Array.isArray(row.items) ? row.items.filter(i => !i.name.startsWith('⏰')).map((i, idx, filtered) => (
                                                    <span key={idx}>
                                                        {i.name} x{i.qty}
                                                        {idx < filtered.length - 1 ? ', ' : ''}
                                                    </span>
                                                )) : 'No Items'}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>{row.table_number}</td>
                                            <td style={{ padding: '16px 24px', fontSize: '11px' }}>
                                                {new Date(row.completed_at || row.created_at).toLocaleTimeString('en-IN', { 
                                                    timeZone: 'Asia/Kolkata', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit',
                                                    hour12: true 
                                                })}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>₹{row.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filteredMenu.map(item => (
                                <div key={item.id} onClick={() => toggleAvailability(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', padding: '0 24px', background: flashingItems.includes(item.id) ? 'rgba(201,169,110,0.06)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', opacity: loadingItems.includes(item.id) ? 0.7 : 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '14px', color: item.is_available ? 'white' : '#555', fontWeight: '500' }}>{item.name}</span>
                                        <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.03)', color: '#444', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{item.category}</span>
                                    </div>

                                    {/* IOS TOGGLE */}
                                    <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: item.is_available ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${item.is_available ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, position: 'relative', padding: '2px' }}>
                                        <motion.div animate={{ x: item.is_available ? 18 : 0 }} style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.is_available ? '#22c55e' : '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {loadingItems.includes(item.id) && <Loader2 size={10} className="animate-spin" />}
                                        </motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* TOASTS */}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
                {toasts.map(t => (
                    <div key={t.id} style={{ background: t.error ? '#ef4444' : '#0D0D10', color: 'white', padding: '12px 24px', borderRadius: '12px', marginBottom: '8px', fontSize: '14px', boxShadow: '0 12px 24px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {t.error ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        {t.token}
                    </div>
                ))}
            </div>

            {/* THE BELL ENGINE: Resides in DOM for maximum browser reliability */}
            <audio id="admin-bell-engine" src="/admin-bell.wav" preload="auto" />
        </div>
    );
};

export default AdminDashboard;

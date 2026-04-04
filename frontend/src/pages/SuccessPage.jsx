import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Volume2, VolumeX } from 'lucide-react';

const socket = io('http://localhost:5000');

const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, orderId, items, total, tableNumber } = location.state || {};
    const [status, setStatus] = useState('paid');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioRef = React.useRef(new Audio('/user-bell.wav'));

    useEffect(() => {
        if (!orderId) return;

        // THE FIX: Sync status across refresh by fetching latest from BD
        const syncStatus = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
                if (res.data) setStatus(res.data.status);
            } catch (e) {
                console.error("Status Sync Error:", e);
            }
        };
        syncStatus();

        socket.on('order-status-update', (data) => {
            if (data.id === orderId) {
                const prevStatus = status;
                setStatus(data.status);
                
                // Play sound ONLY when moving TO ready state
                if (data.status === 'ready' && prevStatus !== 'ready' && soundEnabled && audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.log("Customer audio error:", e));
                }
            }
        });

        return () => socket.off('order-status-update');
    }, [orderId, status, soundEnabled]);

    const getStatusText = () => {
        if (status === 'ready') return "Ready for take away";
        if (status === 'complete') return "Order Delivered";
        if (status === 'accepted') return "Your food is being prepared";
        return "Order Requested";
    };

    if (!token) {
        return (
            <div className="screen animate-global-fade" style={{ background: '#0A0A0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#888', marginBottom: '24px' }}>Something went wrong. Order not found.</p>
                    <button className="btn-primary" onClick={() => navigate('/menu')}>Return to Menu</button>
                </div>
            </div>
        );
    }

    return (
        <div className="screen animate-global-fade" style={{ 
            background: '#0A0A0B', 
            minHeight: '100dvh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
                
                {/* SUCCESS HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <svg width="40" height="40" viewBox="0 0 44 44" fill="none" style={{ margin: '0 auto' }}>
                        <circle 
                            cx="22" cy="22" r="20" 
                            stroke="#C9A96E" strokeWidth="2" 
                            className="animate-draw-circle"
                        />
                        <path 
                            d="M14 22L20 28L30 18" 
                            stroke="#C9A96E" strokeWidth="2" 
                            strokeLinecap="round" strokeLinejoin="round" 
                            className="animate-draw-check" 
                        />
                    </svg>
                    <div className="animate-fade-up" style={{ animationDelay: '0.9s' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '500', color: 'white', marginTop: '16px', marginBottom: '4px' }}>
                            Order confirmed
                        </h1>
                        <p style={{ fontSize: '14px', color: status === 'ready' ? '#C9A96E' : '#888', fontWeight: '400' }}>
                            {getStatusText()}
                        </p>
                    </div>
                </div>

                {/* TOKEN CARD */}
                <div className="animate-scale-in" style={{ 
                    animationDelay: '1.3s',
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px', 
                    padding: '32px',
                    position: 'relative',
                    boxShadow: '0 0 60px rgba(201,169,110,0.06)'
                }}>
                    {/* Volume Toggle removed */}

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
                            Collection Token
                        </div>
                        <h2 style={{ fontSize: '56px', fontWeight: '700', color: 'white', letterSpacing: '0.05em', margin: '0' }}>
                            {token}
                        </h2>
                        {location.state?.scheduled_at && (() => {
                            try {
                                const d = new Date(location.state.scheduled_at);
                                if (!isNaN(d.getTime())) {
                                    return (
                                        <div style={{ marginTop: '12px', padding: '6px 16px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '99px', display: 'inline-block' }}>
                                            <span style={{ fontSize: '12px', color: '#C9A96E', fontWeight: 'bold' }}>
                                                SCHEDULED: {d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    );
                                }
                            } catch (e) {}
                            return null;
                        })()}
                    </div>

                    <div style={{ position: 'relative', margin: '32px -32px' }}>
                        <div className="ticket-notch ticket-notch-left" />
                        <div className="ticket-notch ticket-notch-right" />
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)' }} />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555' }}>
                            TABLE {tableNumber || 'Walking'}
                        </div>
                    </div>
                </div>

                {/* SUMMARY SECTION */}
                <div className="animate-global-fade" style={{ animationDelay: '1.7s', marginTop: '24px' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', textAlign: 'left', marginBottom: '12px' }}>
                        Summary
                    </div>
                    <div>
                        {items?.filter(i => !i.name.startsWith('⏰'))?.map((item, index, filteredArray) => (
                            <div key={item.id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 0',
                                borderBottom: index === filteredArray.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <span style={{ fontSize: '13px', color: 'white' }}>
                                    {item.name} <span style={{ color: '#888', marginLeft: '4px' }}>x{item.qty}</span>
                                </span>
                                <span style={{ fontSize: '13px', color: 'white' }}>₹{item.price * item.qty}</span>
                            </div>
                        ))}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                            <span style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>Total paid</span>
                            <span style={{ fontSize: '15px', color: '#C9A96E', fontWeight: '500' }}>₹{total}</span>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="animate-global-fade" style={{ animationDelay: '1.7s', marginTop: '32px' }}>
                    <button 
                        onClick={() => navigate('/menu')}
                        style={{ 
                            width: '100%', 
                            height: '52px', 
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                        Return to menu
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#444', marginTop: '16px' }}>
                        Show this token number when collecting your order
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SuccessPage;

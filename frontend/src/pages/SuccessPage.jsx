import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, orderId, items, total, tableNumber } = location.state || {};
    const [status, setStatus] = useState('paid');

    useEffect(() => {
        if (!orderId) return;

        socket.on('order-status-update', (data) => {
            if (data.id === orderId) {
                setStatus(data.status);
            }
        });

        return () => socket.off('order-status-update');
    }, [orderId]);

    const getStatusText = () => {
        if (status === 'ready') return "Ready for take away";
        if (status === 'completed') return "Delivered";
        return "Your food is being prepared";
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
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
                            Collection Token
                        </div>
                        <h2 style={{ fontSize: '56px', fontWeight: '700', color: 'white', letterSpacing: '0.05em', margin: '0' }}>
                            {token}
                        </h2>
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
                        {items?.map((item, index) => (
                            <div key={item.id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '12px 0',
                                borderBottom: index === items.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
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

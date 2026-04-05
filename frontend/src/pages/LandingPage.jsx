import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Menu, ShieldCheck, ArrowRight, MapPin, User, X } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [bgIndex, setBgIndex] = useState(0);
    const [showNameModal, setShowNameModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const backgrounds = ['/restaurant_bg.webp', '/restaurant_crowd.jpg'];

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgrounds.length);
        }, 5000); 
        return () => clearInterval(interval);
    }, []);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log('Login Success:', tokenResponse);
            try {
                const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                localStorage.setItem('google_user', JSON.stringify({
                    ...tokenResponse,
                    email: userInfo.data.email,
                    name: customName || userInfo.data.name,
                    picture: userInfo.data.picture
                }));
                setShowNameModal(false);
                navigate('/menu');
            } catch (err) {
                console.error('Failed to fetch user info:', err);
            }
        },
        onError: (error) => console.log('Login Failed:', error),
    });

    const handleBrowseMenu = () => {
        const user = localStorage.getItem('google_user');
        if (user) {
            navigate('/menu');
        } else {
            setShowNameModal(true);
        }
    };

    const handleStartAuth = (e) => {
        e.preventDefault();
        if (customName.trim()) {
            login();
        } else {
            alert("Please enter your name to continue");
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div style={{ background: 'var(--bg)', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
            
            <header style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={backgrounds[bgIndex]}
                            src={backgrounds[bgIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </AnimatePresence>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))', zIndex: 1 }} />
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                        <h1 style={{ fontWeight: '800', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '0.2em' }}>KC <br />RESTAURANT</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', fontWeight: '400', marginBottom: '40px', letterSpacing: '0.05em' }}>
                            Scan. Order. Enjoy. No waiters, no waiting.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="btn-primary" onClick={handleBrowseMenu}>
                                Browse Menu <ChevronRight size={18} />
                            </button>
                            <button className="btn-ghost" onClick={() => document.getElementById('steps').scrollIntoView({ behavior: 'smooth' })}>
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div style={{ position: 'absolute', bottom: '0', left: 0, width: '100%', zIndex: 20 }}>
                    <div className="marquee-container">
                        <div className="marquee-content">
                            {[1, 2].map(i => (
                                <React.Fragment key={i}>
                                    <div className="marquee-item">No app download required</div>
                                    <div className="marquee-item">Pay securely via UPI or card</div>
                                    <div className="marquee-item">Your order reaches the kitchen instantly</div>
                                    <div className="marquee-item">Token-based pickup — zero confusion</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <section id="steps" style={{ background: '#0D0D0F', padding: '60px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} style={{ marginBottom: '40px' }}>
                        Three steps to your table
                    </motion.h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px', position: 'relative' }}>
                        {[
                            { num: '01', title: 'Scan the QR at your table', desc: 'Instantly opens the digital menu in your browser.' },
                            { num: '02', title: 'Pick what you want', desc: 'Browse over 50 gourmet items with real-time descriptions.' },
                            { num: '03', title: 'Pay and get your token', desc: 'Check out securely and receive your unique pickup token.' }
                        ].map((step, i) => (
                            <React.Fragment key={i}>
                                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} style={{ flex: '1', minWidth: '280px', padding: '32px 24px', textAlign: 'left', borderRadius: '4px' }} className="glass">
                                    <div style={{ fontSize: '36px', fontWeight: '700', color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}>{step.num}</div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>{step.title}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{step.desc}</p>
                                </motion.div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={{ padding: '40px 0', borderTop: '1px solid var(--card-border)', background: '#0A0A0B' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '12px', fontWeight: '700' }}>KC RESTAURANT</h3>

                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', color: '#888', fontSize: '14px', maxWidth: '600px', margin: '0 auto 20px' }}>
                        <span style={{ color: 'white', fontWeight: '500', lineHeight: '1.5', textAlign: 'center' }}>
                            Near Ramphal Chowk Rd, Opposite to Vandana Printers, Block C, Sector 7 Dwarka, Dwarka, New Delhi, Delhi, 110077
                        </span>
                    </div>


                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                        © 2026 KC RESTAURANT. ALL RIGHTS RESERVED.
                    </p>
                    <div style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '12px', color: '#ffffff', letterSpacing: '0.08em', margin: 0, fontWeight: '500' }}>
                            Made by : BHASKAR SHAMO RAY
                        </p>
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {showNameModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass"
                            style={{ width: '100%', maxWidth: '400px', padding: '40px', position: 'relative' }}
                        >
                            <button onClick={() => setShowNameModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                            
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(201,169,110,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <User size={24} color="#C9A96E" />
                                </div>
                                <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '8px' }}>Welcome!</h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>Please enter your name to browse our menu</p>
                            </div>

                            <form onSubmit={handleStartAuth}>
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    autoFocus
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    style={{ 
                                        width: '100%', 
                                        height: '56px', 
                                        background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        borderRadius: '12px', 
                                        padding: '0 20px', 
                                        color: 'white', 
                                        fontSize: '16px', 
                                        marginBottom: '20px',
                                        outline: 'none'
                                    }} 
                                />
                                <button className="btn-primary" style={{ width: '100%', height: '56px', borderRadius: '12px', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                    Continue to Login <ChevronRight size={18} />
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '11px', color: '#444', marginTop: '20px', letterSpacing: '0.05em' }}>
                                    SECURE GOOGLE AUTHENTICATION REQUIRED
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default LandingPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Menu, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [bgIndex, setBgIndex] = useState(0);
    const backgrounds = ['/restaurant_bg.webp', '/restaurant_crowd.jpg'];

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgrounds.length);
        }, 5000); 
        return () => clearInterval(interval);
    }, []);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div style={{ background: 'var(--bg)', color: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
            
            {/* STICKY BRANDING LOGO */}
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

            {/* SECTION 1 — HERO WITH DYNAMIC SLIDESHOW */}
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
                        <h1 style={{ fontWeight: '800', textTransform: 'uppercase', marginBottom: '32px', letterSpacing: '0.2em' }}>KC <br />RESTAURANT.</h1>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', fontWeight: '400', marginBottom: '40px', letterSpacing: '0.05em' }}>
                            Scan. Order. Enjoy. No waiters, no waiting.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button className="btn-primary" onClick={() => navigate('/menu')}>
                                Browse Menu <ChevronRight size={18} />
                            </button>
                            <button className="btn-ghost" onClick={() => document.getElementById('steps').scrollIntoView({ behavior: 'smooth' })}>
                                How it works
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* MARQUEE TICKER */}
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

            {/* SECTION 2 — HOW IT WORKS */}
            <section id="steps" style={{ background: '#0D0D0F', padding: '120px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} style={{ marginBottom: '80px' }}>
                        Three steps to your table
                    </motion.h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px', position: 'relative' }}>
                        {[
                            { num: '01', title: 'Scan the QR at your table', desc: 'Instantly opens the digital menu in your browser.' },
                            { num: '02', title: 'Pick what you want', desc: 'Browse over 50 gourmet items with real-time descriptions.' },
                            { num: '03', title: 'Pay and get your token', desc: 'Check out securely and receive your unique pickup token.' }
                        ].map((step, i) => (
                            <React.Fragment key={i}>
                                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} style={{ flex: '1', minWidth: '300px', padding: '48px 32px', textAlign: 'left', borderRadius: '4px' }} className="glass">
                                    <div style={{ fontSize: '48px', fontWeight: '700', color: 'rgba(255,255,255,0.1)', marginBottom: '32px' }}>{step.num}</div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>{step.title}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{step.desc}</p>
                                </motion.div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3 — FEATURES (REDESIGNED SAAS STYLE) */}
            <section style={{ 
                background: '#0D0D10', 
                padding: '80px 0', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle Radial Glow */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '100%', 
                    height: '100%', 
                    background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,169,110,0.04) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Section Header */}
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', fontWeight: '600', marginBottom: '16px', display: 'block' }}>
                            Everything you need at the table
                        </span>
                        <h2 style={{ fontSize: '36px', fontWeight: '500', marginBottom: '16px' }}>Built for the modern dining experience</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>No app. No account. Just scan, order, and collect.</p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 5 — FOOTER */}
            <footer style={{ padding: '80px 0', borderTop: '1px solid var(--card-border)', background: '#0A0A0B' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '24px', fontWeight: '700' }}>KC RESTAURANT.</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '32px' }}>Powered by QR Ordering</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px', color: '#888', fontSize: '14px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        <span style={{ color: 'white', fontWeight: '500', lineHeight: '1.5', textAlign: 'center' }}>
                            Near Ramphal Chowk Rd, Opposite to Vandana Printers, Block C, Sector 7 Dwarka, Dwarka, New Delhi, Delhi, 110077
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '40px' }}>
                        {['Instagram', 'Facebook', 'Twitter'].map(social => (
                            <span key={social} style={{ fontSize: '12px', fontWeight: '500', color: 'white', cursor: 'pointer', opacity: 0.6 }}>{social}</span>
                        ))}
                    </div>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                        © 2026 KC RESTAURANT. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

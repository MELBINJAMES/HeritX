import React, { useEffect, useState } from 'react';
import { fetchItems } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUserLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaCartPlus, FaCheckCircle, FaCalendarAlt, FaStar, FaUsers, FaLeaf, FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import { MdOutlineSecurity, MdOutlinePriceCheck } from 'react-icons/md';
import { FiArrowRight } from 'react-icons/fi';
import toast from '../utils/toast';

const PublicHome = () => {
    const { t } = useLanguage();
    const { location: userLoc } = useUserLocation();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems().then(data => {
            if (data) setItems(data);
        });
    }, []);

    const featuredItems = items.slice(0, 8);

    return (
        <div className="ph-root">
            {/* Kerala mural pattern overlay */}
            <div className="ph-pattern-bg" aria-hidden="true"></div>

            {/* ============ 1. HERO ============ */}
            <section className="ph-hero">
                <div className="ph-container ph-hero-grid">
                    {/* Left: image carousel */}
                    <div className="ph-hero-img-col">
                        <div className="ph-blob"></div>
                        
                        <div className="ph-hero-image-wrapper">
                            <div className="ph-effect-ring ph-ring-1"></div>
                            <div className="ph-effect-ring ph-ring-2"></div>
                            <img
                                src="/HertiX/user-dashboard/frontend/kathakali.jpg"
                                alt="Kathakali"
                                className="ph-hero-static-img"
                            />
                        </div>

                        {/* Geometric shapes orbiting or floating around */}
                        <div className="ph-orbit-shape ph-shape-c1"></div>
                        <div className="ph-orbit-shape ph-shape-c2"></div>
                        <div className="ph-orbit-shape ph-shape-tri"></div>
                    </div>

                    {/* Right: copy */}
                    <div className="ph-hero-text">
                        <span className="ph-eyebrow">HeritX – Wear the Legacy</span>
                        <h1 className="ph-h1">Rent Authentic <br /><span className="ph-tradition-gold ph-writing-text">Traditions</span></h1>
                        <p className="ph-lead">
                            Experience Kerala's cultural heritage by renting traditional costumes, instruments, and ritual items — without the cost of ownership.
                        </p>
                        <div className="ph-cta-row">
                            <button className="ph-btn-primary" onClick={() => navigate('/browse')}>
                                Browse Items <FiArrowRight />
                            </button>
                            <button className="ph-btn-owner" onClick={() => window.location.href = '/HertiX/admin/shop-owner/login'}>
                                <span className="ph-btn-glow"></span>
                                Become an Owner
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ 2. FEATURE STRIP ============ */}
            <section className="ph-feature-strip">
                <div className="ph-container">
                    <div className="ph-strip-grid">
                        <div className="ph-strip-card">
                            <MdOutlineSecurity className="ph-strip-icon" />
                            <div>
                                <h4>Authentic Cultural Items</h4>
                                <p>Verified traditional pieces from trusted heritage owners.</p>
                            </div>
                        </div>
                        <div className="ph-strip-card">
                            <MdOutlinePriceCheck className="ph-strip-icon" />
                            <div>
                                <h4>Affordable Daily Rentals</h4>
                                <p>Premium heritage access at a fraction of the ownership cost.</p>
                            </div>
                        </div>
                        <div className="ph-strip-card">
                            <FaCheckCircle className="ph-strip-icon" />
                            <div>
                                <h4>Verified Owners</h4>
                                <p>Each lister is background-checked and community-rated.</p>
                            </div>
                        </div>
                        <div className="ph-strip-card">
                            <FaUsers className="ph-strip-icon" />
                            <div>
                                <h4>Community Heritage</h4>
                                <p>A living marketplace that keeps Kerala's traditions alive.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ 3. EXPLORE RENTALS GRID ============ */}
            <section className="ph-explore-section">
                <div className="ph-explore-bg-texture" aria-hidden="true"></div>
                <div className="ph-container">
                    <div className="ph-section-header center" style={{ animation: 'ph-reveal-up 1s var(--ph-ease-out) forwards', opacity: 0 }}>
                        <h2 className="ph-section-title">Explore <span className="ph-accent-red">Traditional Rentals</span></h2>
                        <p className="ph-section-sub">Discover authentic Kerala cultural items available for rent.</p>
                    </div>

                    <div className="ph-mkpl-grid">
                        {featuredItems.map(item => {
                            // Derive a category label
                            const cat = (item.category || '').toLowerCase();
                            let badge = 'Cultural Item';
                            if (cat.includes('costume') || cat.includes('dress')) badge = 'Costume';
                            else if (cat.includes('instrument') || cat.includes('music') || cat.includes('chenda') || cat.includes('flute')) badge = 'Musical Instrument';
                            else if (cat.includes('ritual') || cat.includes('kannadi')) badge = 'Ritual Item';
                            else badge = item.category || 'Cultural Item';

                            return (
                                <div key={item.id} className="ph-mkpl-card">
                                    <Link to={`/item/${item.id}`} className="ph-mkpl-card-link">
                                        <div className="ph-mkpl-img-wrap">
                                            <img
                                                src={`/HertiX/${item.image_url}`}
                                                alt={item.name}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/460x320?text=HeritX'; }}
                                            />
                                            <span className="ph-cat-badge">{badge}</span>
                                            <span className={`ph-avail-badge ${parseInt(item.quantity) > 0 ? 'avail' : 'booked'}`}>
                                                {parseInt(item.quantity) > 0 ? `${item.quantity} Left` : 'Booked'}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="ph-mkpl-body">
                                        <div className="ph-mkpl-top">
                                            <h3 className="ph-item-name">{item.name}</h3>
                                            <div className="ph-item-location">
                                                <FaMapMarkerAlt className="ph-pin-icon" />
                                                {item.shop_city || 'Kanjirappally'}
                                            </div>
                                        </div>
                                        <div className="ph-mkpl-bottom">
                                            <div className="ph-price-block">
                                                <span className="ph-price-amount">₹{item.price_per_day}</span>
                                                <span className="ph-price-label">&nbsp;/ day</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="ph-view-item"
                                                    title="View Item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(`/item/${item.id}`);
                                                    }}
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="ph-add-cart"
                                                    title="Add to cart"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!isAuthenticated) {
                                                            toast.error("Please login to continue");
                                                            return;
                                                        }
                                                        addToCart(item);
                                                    }}
                                                >
                                                    <FaCartPlus />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="ph-view-all">
                        <button className="ph-btn-outline" onClick={() => navigate('/browse')}>
                            View Full Collection <FiArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* ============ 4. HOW IT WORKS ============ */}
            <section className="ph-how-section">
                <div className="ph-container">
                    <div className="ph-section-header center" style={{ animation: 'ph-reveal-up 1s var(--ph-ease-out) forwards', opacity: 0 }}>
                        <h2 className="ph-section-title">How It <span className="ph-accent-red">Works</span></h2>
                        <p className="ph-section-sub">Rent heritage items in three simple steps.</p>
                    </div>
                    <div className="ph-steps-grid">
                        <div className="ph-step">
                            <div className="ph-step-num">01</div>
                            <div className="ph-step-icon"><FaLeaf /></div>
                            <h3>Browse Cultural Items</h3>
                            <p>Find authentic pieces listed by our verified heritage community.</p>
                        </div>
                        <div className="ph-step-divider" aria-hidden="true"></div>
                        <div className="ph-step">
                            <div className="ph-step-num">02</div>
                            <div className="ph-step-icon"><FaCalendarAlt /></div>
                            <h3>Select Rental Dates</h3>
                            <p>Choose your duration and complete a secure, quick booking.</p>
                        </div>
                        <div className="ph-step-divider" aria-hidden="true"></div>
                        <div className="ph-step">
                            <div className="ph-step-num">03</div>
                            <div className="ph-step-icon"><FaStar /></div>
                            <h3>Celebrate Tradition</h3>
                            <p>Receive your item and perform Kerala's culture with pride.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ STYLES ============ */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

                :root {
                    --ph-ivory: #FFFFFF;
                    --ph-white: #FFFFFF;
                    --ph-charcoal: #000000;
                    --ph-muted: #666666;
                    --ph-red: #000000;
                    --ph-red-hover: #333333;
                    --ph-gold: #000000;
                    --ph-font: 'Outfit', sans-serif;
                    --ph-radius-lg: 20px;
                    --ph-radius-xl: 28px;
                    --ph-shadow-sm: 0 4px 16px rgba(0,0,0,0.04);
                    --ph-shadow-md: 0 12px 32px rgba(0,0,0,0.07);
                    --ph-shadow-hover: 0 24px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
                    --ph-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
                }

                .ph-tradition-gold {
                    color: #D4AF37;
                    text-shadow: 0 0 40px rgba(212,175,55,0.1);
                }

                @keyframes ph-writing {
                    from { width: 0; }
                    to { width: 100%; }
                }

                @keyframes ph-cursor {
                    50% { border-color: transparent; }
                }

                .ph-writing-text {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    border-right: 3px solid #D4AF37;
                    width: 0;
                    animation: 
                        ph-writing 1.5s steps(15) 1s forwards,
                        ph-cursor 0.8s infinite step-end;
                }

                @keyframes ph-reveal-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes ph-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes ph-scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes ph-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                @keyframes ph-bg-drift {
                    0% { background-position: 0 0; }
                    100% { background-position: 64px 64px; }
                }

                /* ---- ROOT ---- */
                .ph-root {
                    font-family: var(--ph-font); background: var(--ph-ivory);
                    color: var(--ph-charcoal); overflow-x: hidden; position: relative;
                }

                .ph-pattern-bg {
                    position: absolute; inset: 0; z-index: 0; pointer-events: none;
                    background-image: url('data:image/svg+xml;utf8,<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 0c13.255 0 24 10.745 24 24S37.255 48 24 48 0 37.255 0 24 10.745 0 24 0zm0 3C12.402 3 3 12.402 3 24s9.402 21 21 21 21-9.402 21-21S35.598 3 24 3z" fill="%23000000" fill-opacity="0.015" fill-rule="evenodd"/></svg>');
                    background-size: 64px 64px;
                    animation: ph-bg-drift 60s linear infinite;
                }

                .ph-container { max-width: 1280px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 5; }

                .ph-accent-red { color: var(--ph-red); }
                .ph-accent-gold { color: var(--ph-gold); }

                /* ---- SECTION HEADERS ---- */
                .ph-section-header { margin-bottom: 52px; }
                .ph-section-header.center { text-align: center; }
                .ph-section-title { font-size: 2.6rem; font-weight: 800; margin: 0 0 14px 0; letter-spacing: -0.5px; line-height: 1.15; }
                .ph-section-sub { font-size: 1.15rem; color: var(--ph-muted); margin: 0; }

                /* ---- BUTTONS ---- */
                .ph-btn-primary, .ph-btn-ghost, .ph-btn-outline {
                    font-family: var(--ph-font); font-weight: 600; border-radius: 50px; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 8px;
                    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); border: none;
                }
                .ph-btn-primary {
                    background: var(--ph-red); color: #fff; padding: 16px 34px; font-size: 1.05rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                }
                .ph-btn-primary:hover { background: var(--ph-red-hover); transform: translateY(-3px) scale(1.02); box-shadow: 0 18px 40px rgba(0,0,0,0.35); }
                .ph-btn-ghost {
                    background: var(--ph-white); color: var(--ph-charcoal); padding: 16px 34px; font-size: 1.05rem;
                    border: 2px solid rgba(0,0,0,0.07); box-shadow: var(--ph-shadow-sm);
                }
                .ph-btn-ghost:hover { border-color: var(--ph-red); color: var(--ph-red); transform: translateY(-2px); }
                .ph-btn-outline {
                    background: var(--ph-white); color: var(--ph-red); border: 2px solid var(--ph-red);
                    padding: 15px 38px; font-size: 1.05rem; box-shadow: var(--ph-shadow-sm);
                }
                .ph-btn-outline:hover { background: var(--ph-red); color: #fff; box-shadow: 0 8px 22px rgba(0,0,0,0.3); }

                .ph-btn-owner {
                    position: relative;
                    background: #fff;
                    color: #000;
                    padding: 16px 34px;
                    font-size: 1.05rem;
                    font-weight: 700;
                    border: 1px solid #000;
                    border-radius: 50px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.4s var(--ph-ease-out);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }

                .ph-btn-owner:hover {
                    color: #fff;
                    border-color: #000;
                    transform: translateY(-4px) scale(1.03);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                }

                .ph-btn-owner::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    transition: all 0.4s var(--ph-ease-out);
                    z-index: -1;
                }

                .ph-btn-owner:hover::before {
                    left: 0;
                }

                .ph-btn-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.4s;
                }

                .ph-btn-owner:hover .ph-btn-glow {
                    opacity: 1;
                }

                /* ---- HERO ---- */
                .ph-hero {
                    min-height: 88vh; display: flex; align-items: center;
                    padding: 80px 0 60px; position: relative; overflow: hidden;
                }
                .ph-hero::before {
                    content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
                    background: radial-gradient(ellipse 60% 80% at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 65%),
                                radial-gradient(ellipse 50% 70% at 80% 50%, rgba(0,0,0,0.02) 0%, transparent 65%);
                }
                .ph-hero-grid {
                    display: grid; grid-template-columns: 1fr 1.1fr; gap: 64px; align-items: center; position: relative; z-index: 5;
                }
                .ph-hero-img-col { position: relative; padding: 20px; }
                .ph-blob {
                    position: absolute; inset: -10%;
                    background: linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    animation: ph-morph 12s ease-in-out infinite alternate;
                    filter: blur(40px); mix-blend-mode: multiply; z-index: 1;
                }
                
                .ph-hero-image-wrapper {
                    position: relative; z-index: 2; aspect-ratio: 1/1;
                    display: flex; align-items: center; justify-content: center;
                }

                .ph-hero-static-img {
                    width: 90%; height: 90%; object-fit: cover;
                    border-radius: 50%; /* Using a circle to make shapes orbiting look better */
                    border: 8px solid var(--ph-white);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.25);
                    position: relative; z-index: 3;
                    animation: ph-float-slow 6s ease-in-out infinite alternate;
                }

                .ph-effect-ring {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    border-radius: 50%; border: 1px dashed rgba(0,0,0,0.2); z-index: 1;
                }
                .ph-ring-1 { width: 100%; height: 100%; border-color: rgba(0,0,0,0.15); animation: ph-spin-slow 25s linear infinite; }
                .ph-ring-2 { width: 115%; height: 115%; border: 2px solid rgba(0,0,0,0.05); animation: ph-spin-slow 35s linear infinite reverse; }

                .ph-orbit-shape { position: absolute; z-index: 4; }
                .ph-shape-c1 {
                    width: 24px; height: 24px; border-radius: 50%; background: var(--ph-gold);
                    top: 15%; right: 5%; box-shadow: 0 10px 20px rgba(201,162,39,0.3);
                    animation: ph-float 4s ease-in-out infinite;
                }
                .ph-shape-c2 {
                    width: 38px; height: 38px; border-radius: 50%; background: #000;
                    bottom: 15%; left: 5%; box-shadow: 0 10px 20px rgba(0,0,0,0.2);
                    animation: ph-float 5s ease-in-out infinite alternate-reverse;
                }
                .ph-shape-tri {
                    width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-bottom: 30px solid var(--ph-red);
                    top: 45%; left: -10px; transform: rotate(-20deg);
                    animation: ph-float-slow 6s ease-in-out infinite; filter: drop-shadow(0 10px 15px rgba(139,30,63,0.3));
                }

                .ph-hero-text { padding-left: 16px; position: relative; z-index: 5; }
                .ph-eyebrow {
                    display: inline-block; padding: 6px 20px; font-size: 0.88rem; font-weight: 700;
                    letter-spacing: 1.6px; text-transform: uppercase; border-radius: 40px;
                    background: rgba(0,0,0,0.05); color: var(--ph-charcoal);
                    border: 1px solid rgba(0,0,0,0.1); margin-bottom: 24px;
                    animation: ph-reveal-up 0.8s var(--ph-ease-out) forwards;
                    opacity: 0;
                }
                .ph-h1 { 
                    font-size: clamp(3.2rem, 4.8vw, 4.8rem); font-weight: 800; line-height: 1.08; margin: 0 0 26px 0;
                    animation: ph-reveal-up 0.8s var(--ph-ease-out) 0.15s forwards;
                    opacity: 0;
                }
                .ph-h1 .ph-accent-red { text-shadow: 0 0 40px rgba(0,0,0,0.05); }
                .ph-lead { 
                    font-size: 1.22rem; line-height: 1.8; color: var(--ph-muted); max-width: 490px; margin: 0 0 42px 0;
                    animation: ph-reveal-up 0.8s var(--ph-ease-out) 0.3s forwards;
                    opacity: 0;
                }
                .ph-cta-row { 
                    display: flex; gap: 16px; flex-wrap: wrap; 
                    animation: ph-reveal-up 0.8s var(--ph-ease-out) 0.45s forwards;
                    opacity: 0;
                }

                @keyframes ph-morph {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                @keyframes ph-float {
                    0%,100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-14px) rotate(6deg); }
                }

                @media (max-width: 960px) {
                    .ph-hero-grid { grid-template-columns: 1fr; text-align: center; gap: 40px; }
                    .ph-hero-text { padding-left: 0; }
                    .ph-lead { margin: 0 auto 42px; }
                    .ph-cta-row { justify-content: center; }
                }

                /* ---- FEATURE STRIP ---- */
                .ph-feature-strip { position: relative; z-index: 10; margin-top: -24px; margin-bottom: 0; padding: 0 0 48px; }
                .ph-strip-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(234px, 1fr)); gap: 0;
                    background: var(--ph-white); border-radius: var(--ph-radius-lg);
                    box-shadow: var(--ph-shadow-md); border: 1px solid rgba(0,0,0,0.04);
                    overflow: hidden;
                }
                .ph-strip-card {
                    display: flex; align-items: flex-start; gap: 18px; padding: 28px 26px;
                    border-right: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.3s;
                }
                .ph-strip-card:last-child { border-right: none; }
                .ph-strip-card:hover { background: rgba(0,0,0,0.02); transform: translateY(-4px); }
                .ph-strip-icon { font-size: 28px; color: var(--ph-charcoal); flex-shrink: 0; margin-top: 3px; transition: transform 0.3s; }
                .ph-strip-card:hover .ph-strip-icon { transform: scale(1.1); }
                .ph-strip-card h4 { font-size: 1rem; font-weight: 700; margin: 0 0 6px 0; color: var(--ph-charcoal); }
                .ph-strip-card p { font-size: 0.88rem; color: var(--ph-muted); margin: 0; line-height: 1.5; }

                /* ---- EXPLORE GRID ---- */
                .ph-explore-section { padding: 80px 0 100px; position: relative; overflow: hidden; }
                .ph-explore-bg-texture {
                    position: absolute; inset: 0;
                    background: #FFFFFF;
                    background-image: url('data:image/svg+xml;utf8,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M30 0c16.569 0 30 13.431 30 30S46.569 60 30 60 0 46.569 0 30 13.431 0 30 0zm0 3C14.983 3 3 14.983 3 30s11.983 27 27 27 27-11.983 27-27S45.017 3 30 3z" fill="%23000000" fill-opacity="0.01"/></svg>');
                    background-size: 90px 90px; pointer-events: none; z-index: 0;
                }

                .ph-mkpl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
                    gap: 32px; margin-bottom: 56px;
                }

                .ph-mkpl-card {
                    background: var(--ph-white); border-radius: var(--ph-radius-xl);
                    overflow: hidden; box-shadow: var(--ph-shadow-sm);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.38s cubic-bezier(0.165,0.84,0.44,1),
                                box-shadow 0.38s cubic-bezier(0.165,0.84,0.44,1);
                    position: relative;
                    display: flex; flex-direction: column;
                }
                .ph-mkpl-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
                }

                .ph-mkpl-card-link { display: block; text-decoration: none; color: inherit; flex-shrink: 0; }

                .ph-mkpl-img-wrap {
                    height: 250px; position: relative; overflow: hidden;
                    background: #F9F6F1;
                }
                .ph-mkpl-img-wrap img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.55s ease;
                }
                .ph-mkpl-card:hover .ph-mkpl-img-wrap img { transform: scale(1.07); }

                .ph-cat-badge {
                    position: absolute; top: 14px; left: 14px;
                    background: rgba(43,43,43,0.75); color: #fff; backdrop-filter: blur(6px);
                    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
                    letter-spacing: 0.8px; padding: 5px 12px; border-radius: 30px;
                    border: 1px solid rgba(255,255,255,0.15);
                }
                .ph-avail-badge {
                    position: absolute; top: 14px; right: 14px;
                    font-size: 0.72rem; font-weight: 700; padding: 5px 12px; border-radius: 30px;
                }
                .ph-avail-badge.avail { background: #D1FAE5; color: #065F46; }
                .ph-avail-badge.booked { background: #FEE2E2; color: #991B1B; }

                .ph-mkpl-body { padding: 22px 22px 20px; display: flex; flex-direction: column; flex-grow: 1; }
                .ph-mkpl-top { margin-bottom: auto; padding-bottom: 18px; }
                .ph-item-name { font-size: 1.22rem; font-weight: 700; margin: 0 0 8px 0; color: var(--ph-charcoal); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
                .ph-item-location {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.88rem; color: var(--ph-muted); font-weight: 500;
                }
                .ph-pin-icon { color: var(--ph-red); font-size: 0.82rem; flex-shrink: 0; }

                .ph-mkpl-bottom {
                    display: flex; align-items: center; justify-content: space-between;
                    border-top: 1px solid rgba(0,0,0,0.05); padding-top: 18px;
                }
                .ph-price-block { display: flex; align-items: baseline; }
                .ph-price-amount { font-size: 1.55rem; font-weight: 800; color: var(--ph-red); }
                .ph-price-label { font-size: 0.9rem; color: var(--ph-muted); font-weight: 500; }

                .ph-add-cart, .ph-view-item {
                    width: 46px; height: 46px; border-radius: 14px;
                    background: #F4F1EB; color: var(--ph-charcoal);
                    border: 1px solid rgba(0,0,0,0.06);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; font-size: 1.15rem;
                    transition: background 0.3s, color 0.3s, transform 0.2s;
                }
                .ph-view-item {
                    background: #fff;
                    border: 1px solid #ddd;
                    color: var(--ph-charcoal);
                }
                .ph-mkpl-card:hover .ph-add-cart { background: #000; color: #fff; border-color: #000; transform: scale(1.06); }
                .ph-mkpl-card:hover .ph-view-item { background: #f4f4f4; color: #000; border-color: #000; transform: scale(1.06); }

                .ph-view-all { text-align: center; }

                /* ---- HOW IT WORKS ---- */
                .ph-how-section {
                    padding: 80px 0 100px; background: var(--ph-white);
                    border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .ph-steps-grid {
                    display: grid; grid-template-columns: 1fr 32px 1fr 32px 1fr; align-items: start; gap: 0;
                }
                .ph-step { text-align: center; padding: 0 20px; }
                .ph-step-num { font-size: 3rem; font-weight: 800; color: rgba(0,0,0,0.05); line-height: 1; margin-bottom: 12px; transition: color 0.3s; }
                .ph-step:hover .ph-step-num { color: rgba(0,0,0,0.12); }
                .ph-step-icon { font-size: 42px; color: var(--ph-charcoal); margin-bottom: 20px; transition: transform 0.3s; }
                .ph-step:hover .ph-step-icon { transform: translateY(-5px) scale(1.1); }
                .ph-step h3 { font-size: 1.3rem; font-weight: 700; margin: 0 0 12px 0; color: var(--ph-charcoal); }
                .ph-step p { font-size: 1rem; color: var(--ph-muted); line-height: 1.65; margin: 0; }
                .ph-step-divider {
                    align-self: center; height: 1px;
                    background: linear-gradient(to right, transparent, #ddd, transparent);
                    border-radius: 2px; margin-top: -48px; opacity: 0.8;
                }

                @media (max-width: 900px) {
                    .ph-steps-grid { grid-template-columns: 1fr; gap: 40px; }
                    .ph-step-divider { display: none; }
                }
                @media (max-width: 640px) {
                    .ph-strip-grid { grid-template-columns: 1fr 1fr; }
                    .ph-strip-card { border-bottom: 1px solid rgba(0,0,0,0.05); }
                    .ph-strip-card:nth-child(even) { border-right: none; }
                    .ph-section-title { font-size: 2.1rem; }
                }
            `}</style>
        </div>
    );
};

export default PublicHome;

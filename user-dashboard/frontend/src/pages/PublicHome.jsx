import React, { useEffect, useState, useRef } from 'react';
import { fetchItems } from '../services/api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUserLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaCartPlus } from 'react-icons/fa';
import toast from '../utils/toast';

const PublicHome = () => {
    const { t } = useLanguage();
    const { location: userLoc } = useUserLocation();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);

    // --- Eye Tracking Logic ---
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            requestAnimationFrame(() => setMousePos({ x: e.clientX, y: e.clientY }));
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    // --- End Eye Tracking Logic ---

    useEffect(() => {
        // Fetch items - the API now handles location filtering if params are passed
        fetchItems().then(data => {
            if (data) {
                setItems(data);
            }
        });
    }, []);

    const nearbyItems = items.filter(item => {
        if (!userLoc) return false;
        const cityMatch = userLoc.city && item.shop_city && item.shop_city.toLowerCase() === userLoc.city.toLowerCase();
        const pincodeMatch = userLoc.pincode && item.shop_pincode && item.shop_pincode === userLoc.pincode;
        return cityMatch || pincodeMatch;
    }).slice(0, 5);

    const otherItems = items.filter(item => {
        if (!userLoc) return true;
        const isNearby = (userLoc.city && item.shop_city && item.shop_city.toLowerCase() === userLoc.city.toLowerCase()) ||
            (userLoc.pincode && item.shop_pincode && item.shop_pincode === userLoc.pincode);
        return !isNearby;
    }).slice(0, 10);

    return (
        <div className="public-home">
            <style>
                {`
                .hero-container {
                    background-color: #1a1514; 
                    padding: 80px 40px; /* Increased vertical padding */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #f8f6f0;
                    overflow: hidden;
                    /* Smoother, less severe pill/oval shape */
                    border-radius: 60px;
                    margin: 30px auto;
                    max-width: 92%; 
                    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
                    position: relative;
                }
                
                /* Subtle background glow connecting left and right sides */
                .hero-container::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 20%;
                    width: 60%;
                    height: 120%;
                    background: radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%);
                    transform: translateY(-50%);
                    pointer-events: none;
                }

                .hero-content {
                    display: flex;
                    width: 100%;
                    max-width: 1200px;
                    align-items: center;
                    justify-content: space-between;
                    gap: 60px;
                    position: relative;
                    z-index: 2;
                }
                .hero-left {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                }
                    .kathakali-wrapper {
                        position: relative;
                        width: 280px;  /* Slightly larger */
                        height: 280px; 
                        flex-shrink: 0;
                        border-radius: 50%; 
                        overflow: hidden;
                        background-color: #000; 
                        /* Ambient neon glow connecting the art to the dark background */
                        box-shadow: 0 0 50px rgba(255, 255, 255, 0.08), inset 0 0 20px rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        animation: floatArt 6s ease-in-out infinite alternate;
                        cursor: pointer;
                    }

                    .kathakali-wrapper:hover {
                        transform: scale(1.05) translateY(-10px);
                        box-shadow: 0 20px 60px rgba(255, 255, 255, 0.15), inset 0 0 30px rgba(255,255,255,0.1);
                        border-color: rgba(255,255,255,0.3);
                    }

                    .kathakali-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                        filter: brightness(0.8) opacity(0.9);
                        transition: filter 0.5s ease;
                    }

                    .kathakali-wrapper:hover .kathakali-image {
                        filter: brightness(1) opacity(1);
                    }

                    @keyframes floatArt {
                        0% { transform: translateY(0px); }
                        100% { transform: translateY(-15px); }
                    }

                    .hero-right {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        z-index: 10;
                        text-align: left;
                    }
                    .hero-title {
                        font-size: clamp(2.8rem, 5vw, 4.2rem); /* Increased size significantly */
                        font-family: 'Playfair Display', Georgia, serif; 
                        font-weight: 700;
                        line-height: 1.1;
                        margin: 0 0 20px 0;
                        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 40%, #a0a0a0 100%); 
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        filter: drop-shadow(0 2px 15px rgba(255, 255, 255, 0.15));
                        letter-spacing: -0.5px;
                        transition: all 0.5s ease;
                        position: relative;
                        display: inline-block;
                    }
                    
                    /* Accent line linking text to the artwork visually */
                    .hero-title::after {
                        content: '';
                        position: absolute;
                        bottom: -5px;
                        left: 0;
                        width: 60px;
                        height: 3px;
                        background: rgba(255,255,255,0.3);
                        border-radius: 2px;
                        transition: width 0.4s ease;
                    }

                    .hero-title:hover {
                        filter: drop-shadow(0 5px 25px rgba(255, 255, 255, 0.3));
                        transform: translateY(-2px);
                    }
                    
                    .hero-title:hover::after {
                        width: 120px;
                        background: rgba(255,255,255,0.6);
                    }

                    .hero-subtitle {
                        font-size: 1.2rem; /* Increased size slightly */
                        line-height: 1.8;
                        color: rgba(255,255,255,0.7);
                        margin: 0 0 25px 0;
                        max-width: 580px;
                        font-weight: 300;
                        letter-spacing: 0.5px;
                        transition: color 0.4s ease;
                    }
                    
                    .hero-subtitle:hover {
                        color: rgba(255,255,255,0.95);
                    }

                    @media (max-width: 768px) {
                        .hero-content { flex-direction: column; text-align: center; gap: 40px; }
                        .hero-right { align-items: center; text-align: center; }
                        .hero-title::after { left: 50%; transform: translateX(-50%); }
                        /* Keep oval aspect ratio but scale down */
                        .kathakali-wrapper { width: 220px; height: 220px; }
                        .hero-title { font-size: 2.5rem; }
                    }
                `}
            </style>

            {/* Interactive Hero Section */}
            <section className="hero-container">
                <div className="hero-content">
                    {/* LEFT COLUMN: KATHAKALI ANIMATION */}
                    <div className="hero-left">
                        <div className="kathakali-wrapper">
                            {/* Background illustration */}
                            <img
                                src="/kathakali_line_art.png"
                                alt="Kathakali Line Art"
                                className="kathakali-image"
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: CONTENT */}
                    <div className="hero-right">
                        <h1 className="hero-title">{t('hero_title')}</h1>
                        <p className="hero-subtitle">{t('hero_desc')}</p>
                        {/* Explore Rentals Button Removed per User Request */}
                    </div>
                </div>
            </section>

            {/* Nearby Items Section */}
            {userLoc && nearbyItems.length > 0 && (
                <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>Items Near You</h2>
                        <span style={{ padding: '4px 12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {userLoc.city || userLoc.pincode}
                        </span>
                    </div>

                    <div className="items-grid" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px'
                    }}>
                        {nearbyItems.map(item => (
                            <ItemCard key={item.id} item={item} t={t} isAuthenticated={isAuthenticated} addToCart={addToCart} />
                        ))}
                    </div>
                </section>
            )}

            {/* Other Items Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 60px' }}>
                <div className="section-header">
                    <h2>
                        {userLoc ? 'Available Items' : t('featured_title')}
                    </h2>
                </div>

                <div
                    className="items-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '20px',
                        paddingBottom: '20px',
                        width: '100%'
                    }}
                >
                    {otherItems.length > 0 ? otherItems.map(item => (
                        <ItemCard key={item.id} item={item} t={t} isAuthenticated={isAuthenticated} addToCart={addToCart} />
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                            {t('no_items')}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

// Reusable Item Card Component for clean code
const ItemCard = ({ item, t, isAuthenticated, addToCart }) => {
    const now = new Date();
    const hasActiveOffer = item.offer_title && item.offer_start && item.offer_end &&
        new Date(item.offer_start) <= now && new Date(item.offer_end) >= now;

    return (
        <div key={item.id} className="item-card" style={{
            width: '100%', display: 'flex', flexDirection: 'column',
            background: 'white', borderRadius: '12px', overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee', position: 'relative'
        }}>
            <Link to={`/item/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="item-image" style={{ height: '200px', position: 'relative' }}>
                    <img
                        src={`/${item.image_url}`}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    />
                    {hasActiveOffer && (
                        <div style={{
                            position: 'absolute', top: '10px', left: '10px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white',
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10
                        }}>
                            <span>🎁</span> {item.offer_title}
                        </div>
                    )}
                </div>
            </Link>
            <div className="item-info" style={{ padding: '15px' }}>
                <h3 className="item-name" style={{ fontSize: '1rem', margin: '0 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 10px' }}>{item.category}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="item-price" style={{ fontWeight: 'bold', fontSize: '1rem' }}>₹{item.price_per_day}</span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                if (!isAuthenticated) {
                                    toast.error(t('login_required') || "Please login to continue");
                                    return;
                                }
                                addToCart(item);
                            }}
                            style={{
                                background: '#f8f9fa', border: '1px solid #ddd',
                                borderRadius: '50%', width: '30px', height: '30px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#333'
                            }}
                            title="Add to Cart"
                        >
                            <FaCartPlus size={14} />
                        </button>
                        <Link to={`/item/${item.id}`} style={{
                            color: 'white', background: '#1a1a1a', padding: '5px 12px',
                            borderRadius: '20px', fontSize: '0.8rem', textDecoration: 'none'
                        }}>
                            {t('view')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicHome;

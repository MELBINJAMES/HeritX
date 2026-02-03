import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes, FaHeart, FaBell, FaShoppingCart } from 'react-icons/fa';
import { MdTranslate } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { fetchNotifications } from '../services/api';
import '../styles/Navbar.css';

const PublicNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { language, toggleLanguage, t } = useLanguage();
    const { cartCount } = useCart();
    const isBecomeOwnerPage = location.pathname === '/become-owner';

    // Search Autocomplete State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Keywords for Autocomplete
    const keywords = [
        'Attire', 'Decor', 'Jewelry', 'Art', 'Ritual',
        'Onam', 'Vishu', 'Wedding', 'Temple Ritual', 'Classical Dance', 'House Warming',
        'Kathakali', 'Kasavu', 'Nilavilakku', 'Nettipattam', 'Chundan Vallam', 'Aranmula Kannadi'
    ];

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id).then(data => {
                if (Array.isArray(data)) setNotifications(data);
            });
        }
    }, [user]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <nav className="navbar" style={{
            height: '70px',
            background: 'white',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0 40px'
        }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a', fontFamily: 'serif' }}>
                        HeritX
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: 'auto', marginRight: '30px' }}>

                    {/* Search Bar - Only visible on Browse page */}
                    {location.pathname === '/browse' && (
                        <div style={{ position: 'relative', marginRight: '10px' }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={new URLSearchParams(location.search).get('q') || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const params = new URLSearchParams(location.search);
                                        if (val) {
                                            params.set('q', val);
                                            // Filter suggestions
                                            const matches = keywords.filter(word =>
                                                word.toLowerCase().includes(val.toLowerCase())
                                            );
                                            setFilteredSuggestions(matches);
                                            setShowSuggestions(true);
                                        } else {
                                            params.delete('q');
                                            setShowSuggestions(false);
                                        }
                                        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                                    }}
                                    onFocus={() => {
                                        const val = new URLSearchParams(location.search).get('q') || '';
                                        if (val) setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    style={{
                                        padding: '8px 35px 8px 15px', // Added right padding for X button
                                        borderRadius: '20px',
                                        border: '1px solid #ddd',
                                        outline: 'none',
                                        fontSize: '0.9rem',
                                        width: '240px',
                                        transition: 'all 0.3s ease',
                                        background: '#f8f9fa'
                                    }}
                                />
                                {new URLSearchParams(location.search).get('q') && (
                                    <FaTimes
                                        onClick={() => {
                                            const params = new URLSearchParams(location.search);
                                            params.delete('q');
                                            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                                            setShowSuggestions(false);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                )}
                            </div>

                            {/* Autocomplete Dropdown */}
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '40px',
                                    left: 0,
                                    width: '100%',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    zIndex: 1001,
                                    overflow: 'hidden',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {filteredSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                const params = new URLSearchParams(location.search);
                                                params.set('q', suggestion);
                                                navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                                                setShowSuggestions(false);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                borderBottom: index === filteredSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                                                color: '#333',
                                                textAlign: 'left'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>{t('home')}</Link>
                    <Link to="/browse" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>{t('browse')}</Link>
                    {!user && <Link to="/become-owner" style={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: 'bold' }}>{t('becomeOwner')}</Link>}
                </div>

                {/* Language Toggle */}
                {/* Language Toggle */}
                <div
                    title={language === 'en' ? "Switch to Malayalam" : "Switch to English"}
                    style={{ marginRight: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={toggleLanguage}
                >
                    <MdTranslate style={{ fontSize: '1.5rem', color: '#1a1a1a' }} />
                    <span style={{ marginLeft: '5px', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a1a1a' }}>
                        {language.toUpperCase()}
                    </span>
                </div>

                {/* Auth Buttons */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {/* Notification Bell */}
                            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/dashboard/notifications')}>
                                <FaBell style={{ fontSize: '1.2rem', color: '#555' }} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-8px', right: '-8px',
                                        background: '#ef4444', color: 'white', fontSize: '0.7rem',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            {/* Cart Icon */}
                            <div
                                onClick={() => {
                                    if (!user) {
                                        alert(t('login_required') || "Please login to view cart");
                                        return;
                                    }
                                    navigate('/cart');
                                }}
                                style={{ color: '#1a1a1a', fontSize: '1.2rem', display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
                                title="Cart"
                            >
                                <FaShoppingCart />
                                {cartCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-8px', right: '-8px',
                                        background: '#1a1a1a', color: 'white', fontSize: '0.7rem',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <FaUserCircle style={{ fontSize: '1.5rem', color: '#1a1a1a' }} />
                                    <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{user.name}</span>
                                </div>

                                {showProfileMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: 0,
                                        background: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        border: '1px solid #f1f5f9',
                                        minWidth: '160px',
                                        overflow: 'hidden',
                                        zIndex: 1002
                                    }}>
                                        <Link
                                            to="/dashboard/profile"
                                            style={{ display: 'block', padding: '10px 15px', textDecoration: 'none', color: '#333', borderBottom: '1px solid #f1f5f9' }}
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <div
                                            onClick={() => { logout(); setShowProfileMenu(false); }}
                                            style={{ padding: '10px 15px', cursor: 'pointer', color: '#ef4444', fontWeight: '500' }}
                                        >
                                            Logout
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        !isBecomeOwnerPage && (
                            <>
                                {/* Cart for Unauthenticated */}
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginRight: '10px' }}>
                                    <FaShoppingCart
                                        onClick={() => alert(t('login_required') || "Please login to view cart")}
                                        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#1a1a1a' }}
                                        title="Cart"
                                    />
                                </div>

                                <Link to="/login" style={{
                                    padding: '8px 20px',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '20px',
                                    textDecoration: 'none',
                                    color: '#1a1a1a',
                                    fontWeight: 600
                                }}>
                                    Login
                                </Link>
                                <a href="http://localhost:5173/register/finder" style={{
                                    padding: '8px 20px',
                                    background: '#1a1a1a',
                                    borderRadius: '20px',
                                    textDecoration: 'none',
                                    color: 'white',
                                    fontWeight: 600
                                }}>
                                    Sign Up
                                </a>
                            </>
                        )
                    )}
                </div>
            </div >
        </nav >
    );
};

export default PublicNavbar;

import React, { useEffect, useState } from 'react';
import { FaHome, FaSearch, FaBoxOpen, FaCreditCard, FaUser, FaQuestionCircle, FaSignOutAlt, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProfile } from '../services/api';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeRoute = location.pathname;
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        fetchProfile().then(data => {
            if (data && data.profile_image) {
                setProfileImage(data.profile_image);
            }
        });
    }, []);

    const menuItems = [
        { id: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { id: '/browse', label: 'Browse Items', icon: <FaSearch /> },
        { id: '/dashboard/wishlist', label: 'Wishlist', icon: <FaHeart /> },
        { id: '/dashboard/rentals', label: 'My Rentals', icon: <FaBoxOpen /> },
        { id: '/dashboard/payments', label: 'Payments', icon: <FaCreditCard /> },
        { id: '/dashboard/profile', label: 'Profile', icon: <FaUser /> },
        { id: '/help', label: 'Cultural Help', icon: <FaQuestionCircle /> },
    ];

    // Helper to check if active
    const isActive = (path) => {
        if (path === '/dashboard' && activeRoute === '/dashboard') return true;
        if (path !== '/dashboard' && activeRoute.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="sidebar">
            <div className="logo-section" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '40px',
                paddingBottom: '20px',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <button
                    onClick={() => navigate('/')}
                    title="Back to Home"
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.1rem',
                        color: '#666',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '50%',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <FaArrowLeft />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1a1a1a' }}>HeritX</h2>
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
                        onClick={() => navigate(item.id)}
                    >
                        {/* Dynamic Icon Logic */}
                        <span className="icon">
                            {item.id === '/dashboard/profile' && profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                item.icon
                            )}
                        </span>
                        <span className="label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="logout-section">
                <button className="nav-item logout" onClick={() => window.location.href = 'http://localhost:5174/finder/login'}>
                    <span className="icon"><FaSignOutAlt /></span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

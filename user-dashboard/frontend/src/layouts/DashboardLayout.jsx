import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Wrapper for the Protected Dashboard Area
const DashboardLayout = () => {
    // We lift the tab state to the URL in a real app, 
    // but for now we keep the sidebar visual state managed here or by the Router.
    // Since we are using React Router now, Sidebar should link to Routes, not set State.
    // However, to keep existing Sidebar.jsx working without rewriting it completely,
    // we can wrap it or modify Sidebar.jsx. 
    // Let's modify Sidebar.jsx to use Links later, or for now just render the old structure 
    // but we need to render the specific page based on the route.

    // Actually, easier approach: Re-implement the visual wrapper here.

    return (
        <div className="app-container">
            <SidebarWrapper />
            <div className="main-content">
                <Header />
                <div className="content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

// Temporary wrapper to make the existing Sidebar look right, 
// In a full refactor we would update Sidebar.jsx to use <NavLink>
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaBoxOpen, FaCreditCard, FaUser, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const SidebarWrapper = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const activeRoute = location.pathname;

    const menuItems = [
        { id: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { id: '/dashboard/rentals', label: 'My Rentals', icon: <FaBoxOpen /> },
        { id: '/dashboard/payments', label: 'Payments', icon: <FaCreditCard /> },
        { id: '/dashboard/profile', label: 'Profile', icon: <FaUser /> },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <h2>HeritX</h2>
            </div>
            <nav className="nav-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeRoute === item.id ? 'active' : ''}`}
                        onClick={() => navigate(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="logout-section">
                <button className="nav-item logout" onClick={() => window.location.href = 'http://localhost:5173/finder/login'}>
                    <span className="icon"><FaSignOutAlt /></span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardLayout;

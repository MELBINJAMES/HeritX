import React from 'react';
import { FaHome, FaSearch, FaBoxOpen, FaCreditCard, FaUser, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
        { id: 'browse', label: 'Browse Items', icon: <FaSearch /> },
        { id: 'rentals', label: 'My Rentals', icon: <FaBoxOpen /> },
        { id: 'payments', label: 'Payments', icon: <FaCreditCard /> },
        { id: 'profile', label: 'Profile', icon: <FaUser /> },
        { id: 'help', label: 'Cultural Help', icon: <FaQuestionCircle /> },
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
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="logout-section">
                <button className="nav-item logout">
                    <span className="icon"><FaSignOutAlt /></span>
                    <span className="label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

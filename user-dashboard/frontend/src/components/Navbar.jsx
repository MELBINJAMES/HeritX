import React from 'react';
import { FaUserCircle, FaShoppingBag } from 'react-icons/fa';

const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="logo" onClick={() => setActiveTab('dashboard')}>
                    HeritX
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Home
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        Collection
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'help' ? 'active' : ''}`}
                        onClick={() => setActiveTab('help')}
                    >
                        Stories
                    </button>
                </div>

                <div className="nav-icons">
                    <button
                        className={`icon-btn ${activeTab === 'rentals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rentals')}
                        title="My Rentals"
                    >
                        <FaShoppingBag />
                    </button>
                    <button
                        className={`icon-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        title="Profile"
                    >
                        <FaUserCircle />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

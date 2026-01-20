import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { fetchProfile } from '../services/api';

const Header = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile().then(data => setProfile(data));
    }, []);

    const name = profile?.name || 'User';

    return (
        <header className="header">
            <h2 style={{ fontSize: '1.2rem', color: '#555' }}>Welcome back, {name}</h2>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                {profile?.profile_image ? (
                    <img
                        src={profile.profile_image}
                        alt="Profile"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ddd' }}
                    />
                ) : (
                    <FaUserCircle size={30} color="#ccc" />
                )}
            </div>
        </header>
    );
};

export default Header;

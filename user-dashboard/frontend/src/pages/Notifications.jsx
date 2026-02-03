import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheck, FaExclamationCircle } from 'react-icons/fa';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchNotifications(user.id);
        if (Array.isArray(data)) setNotifications(data);
        setLoading(false);
    };

    const handleMarkRead = async (id) => {
        await markNotificationRead(id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBell style={{ color: '#e91e63' }} /> Notifications
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} style={{
                            background: n.is_read ? '#f9fafb' : 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            borderLeft: n.is_read ? '5px solid #cbd5e1' : '5px solid #e91e63',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            boxShadow: n.is_read ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px', color: '#1f2937' }}>{n.title}</h3>
                                <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.5' }}>{n.message}</p>
                                <small style={{ display: 'block', marginTop: '10px', color: '#9ca3af' }}>
                                    {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString()}
                                </small>
                            </div>
                            {!n.is_read && (
                                <button
                                    onClick={() => handleMarkRead(n.id)}
                                    style={{
                                        background: 'transparent', border: '1px solid #ddd',
                                        borderRadius: '20px', padding: '5px 12px',
                                        cursor: 'pointer', fontSize: '0.8rem', color: '#555',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                    }}
                                >
                                    <FaCheck /> Mark Read
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
                        <FaExclamationCircle size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <p>No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

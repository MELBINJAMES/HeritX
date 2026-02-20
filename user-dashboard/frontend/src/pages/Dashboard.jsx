import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        active_rentals: 0,
        upcoming_bookings: 0,
        pending_returns: 0,
        total_deposit_paid: 0,
        recent_activity: []
    });

    useEffect(() => {
        if (user && user.id) {
            fetchDashboardSummary(user.id).then(data => {
                if (data) setStats(data);
            });
        }
    }, [user]);

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Dashboard Overview</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.active_rentals}</div>
                    <div className="stat-label">Active Rentals</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.upcoming_bookings}</div>
                    <div className="stat-label">Upcoming Bookings</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: stats.pending_returns > 0 ? 'red' : '#1a1a1a' }}>
                        {stats.pending_returns}
                    </div>
                    <div className="stat-label">Pending Returns</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">₹{stats.total_deposit_paid}</div>
                    <div className="stat-label">Total Deposit Paid</div>
                </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3>Recent Activity</h3>
                {stats.recent_activity && stats.recent_activity.length > 0 ? (
                    <div style={{ marginTop: '15px' }}>
                        {stats.recent_activity.map(activity => (
                            <div key={activity.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>Rented <strong>{activity.item_name}</strong></div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{new Date(activity.created_at).toLocaleDateString()}</div>
                                </div>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    background: activity.status === 'active' ? '#e6f7ff' : '#f5f5f5',
                                    color: activity.status === 'active' ? '#1890ff' : '#888'
                                }}>
                                    {activity.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#888', marginTop: '10px' }}>No recent activity to show.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

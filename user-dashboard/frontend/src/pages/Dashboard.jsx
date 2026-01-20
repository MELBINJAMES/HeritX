import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        active_rentals: 0,
        upcoming_bookings: 0,
        pending_returns: 0,
        total_deposit_paid: 0
    });

    useEffect(() => {
        fetchDashboardSummary().then(data => {
            if (data) setStats(data);
        });
    }, []);

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
                <p style={{ color: '#888', marginTop: '10px' }}>No recent activity to show.</p>
            </div>
        </div>
    );
};

export default Dashboard;

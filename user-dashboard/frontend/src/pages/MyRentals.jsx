import React, { useEffect, useState } from 'react';
import { fetchMyRentals } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyRentals = () => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState([]);

    useEffect(() => {
        if (user && user.id) {
            fetchMyRentals(user.id).then(data => setRentals(data));
        }
    }, [user]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#1976d2'; // Blue
            case 'completed': return '#2e7d32'; // Green
            case 'cancelled': return '#c62828'; // Red
            case 'pending': return '#f57c00'; // Orange
            case 'shipped': return '#0288d1'; // Light Blue
            case 'out for delivery': return '#7b1fa2'; // Purple
            case 'delivered': return '#388e3c'; // Dark Green
            default: return '#616161'; // Grey
        }
    };

    const getStatusBg = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#e3f2fd';
            case 'completed': return '#e8f5e9';
            case 'cancelled': return '#ffebee';
            case 'pending': return '#fff3e0';
            case 'shipped': return '#e1f5fe';
            case 'out for delivery': return '#f3e5f5';
            case 'delivered': return '#e8f5e9';
            default: return '#eeeeee';
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px', color: '#1a1a1a' }}>My Rentals & Orders</h1>
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Item Details</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Rental Period</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Payment</th>
                            <th style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Delivery Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.length > 0 ? rentals.map(rental => (
                            <tr key={rental.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            {rental.image_url ? (
                                                <img src={`/HertiX/${rental.image_url}`} alt={rental.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#334155' }}>{rental.item_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: #{rental.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px', color: '#475569' }}>
                                    <div>{new Date(rental.start_date).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>to</div>
                                    <div>{new Date(rental.end_date).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>₹{rental.total_price}</div>
                                    {/* Show delivery fee info if applicable */}
                                    {rental.delivery_method === 'delivery' && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                            Inc. Delivery: ₹{rental.delivery_fee}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                                        {/* Main Rental Status */}
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500',
                                            background: getStatusBg(rental.status), color: getStatusColor(rental.status)
                                        }}>
                                            Rental: {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                                        </span>

                                        {/* Delivery/Pickup Status */}
                                        <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#64748b' }}>
                                                {rental.delivery_method === 'delivery' ? '🚚 Delivery:' : '🏪 Pickup:'}
                                            </span>
                                            <span style={{
                                                fontWeight: '600',
                                                color: rental.delivery_status === 'Delivered' ? '#16a34a' : '#f59e0b'
                                            }}>
                                                {rental.delivery_status || 'Pending'}
                                            </span>
                                        </div>

                                        {/* Address tooltip or text */}
                                        {rental.delivery_method === 'delivery' && (
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                To: {rental.delivery_city || 'Address'}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>No rentals found</div>
                                    <p>Browse our collection and book your first item!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyRentals;

import React, { useEffect, useState } from 'react';
import { fetchMyRentals } from '../services/api';

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);

    useEffect(() => {
        fetchMyRentals().then(data => setRentals(data));
    }, []);

    return (
        <div>
            <h1>My Rentals</h1>
            <div style={{ marginTop: '20px', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f5f5f5' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Item</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Dates</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Total Price</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.length > 0 ? rentals.map(rental => (
                            <tr key={rental.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px' }}>{rental.item_name}</td>
                                <td style={{ padding: '15px' }}>{rental.start_date} to {rental.end_date}</td>
                                <td style={{ padding: '15px' }}>₹{rental.total_price}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        background: rental.status === 'active' ? '#e3f2fd' : (rental.status === 'overdue' ? '#ffebee' : '#e8f5e9'),
                                        color: rental.status === 'active' ? '#1976d2' : (rental.status === 'overdue' ? '#c62828' : '#2e7d32')
                                    }}>
                                        {rental.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                    No rentals found.
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

import React, { useEffect, useState } from 'react';
import { fetchPayments } from '../../frontend/src/services/api';
import { useAuth } from '../../frontend/src/context/AuthContext';

const Payments = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ summary: {}, history: [] });

    useEffect(() => {
        if (user && user.id) {
            fetchPayments(user.id).then(res => {
                if (res) setData(res);
            });
        }
    }, [user]);

    const { summary, history } = data;

    return (
        <div>
            <h1>Payments & Transactions</h1>

            {/* Payment Summary Cards */}
            <div className="stats-grid" style={{ marginTop: '20px' }}>
                <div className="stat-card" style={{ background: '#e3f2fd' }}>
                    <div className="stat-value" style={{ color: '#1565c0' }}>₹{summary.total_rent_paid || 0}</div>
                    <div className="stat-label">Total Rent Paid</div>
                </div>
                <div className="stat-card" style={{ background: '#fff3e0' }}>
                    <div className="stat-value" style={{ color: '#ef6c00' }}>₹{summary.active_deposits || 0}</div>
                    <div className="stat-label">Active Deposits</div>
                </div>
                <div className="stat-card" style={{ background: '#e8f5e9' }}>
                    <div className="stat-value" style={{ color: '#2e7d32' }}>₹{summary.refunds_processed || 0}</div>
                    <div className="stat-label">Refunds Processed</div>
                </div>
            </div>

            {/* Payment History Table */}
            <div style={{ marginTop: '30px', background: 'white', borderRadius: '12px', padding: '20px' }}>
                <h3>Transaction History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Date</th>
                            <th style={{ padding: '10px' }}>Type</th>
                            <th style={{ padding: '10px' }}>Amount</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history && history.length > 0 ? history.map(txn => (
                            <tr key={txn.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '10px' }}>{txn.transaction_date}</td>
                                <td style={{ padding: '10px', textTransform: 'capitalize' }}>{txn.payment_type}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>₹{txn.amount}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        color: txn.status === 'paid' ? 'green' : (txn.status === 'refunded' ? 'blue' : 'orange')
                                    }}>
                                        {txn.status}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <a
                                        href={`http://localhost/HertiX/user-dashboard/backend/api/receipt.php?id=${txn.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: 'none', color: '#1a1a1a', fontWeight: 'bold',
                                            fontSize: '0.85rem', border: '1px solid #ddd', padding: '5px 10px',
                                            borderRadius: '4px', background: '#f9f9f9'
                                        }}
                                    >
                                        Download
                                    </a>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No transactions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;

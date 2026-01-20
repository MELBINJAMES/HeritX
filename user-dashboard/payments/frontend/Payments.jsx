import React, { useEffect, useState } from 'react';
// We need to import the API service. Since this file is in /payments/frontend/
// and api.js is in /frontend/src/services/, we need to go up two levels then into src/services
// Path: ../../frontend/src/services/api (depending on where this is compiled from, but for source structure:)
import { fetchPayments } from '../../frontend/src/services/api';

const Payments = () => {
    const [data, setData] = useState({ summary: {}, history: [] });

    useEffect(() => {
        fetchPayments().then(res => {
            // API returns { summary: {...}, history: [...] }
            if (res) setData(res);
        });
    }, []);

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
                            </tr>
                        )) : (
                            <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No transactions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;

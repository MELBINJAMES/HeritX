import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UPIGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderDetails } = location.state || {};

    useEffect(() => {
        if (!orderDetails) {
            navigate('/checkout');
            return;
        }

        // Auto-process to success after 4 seconds to simulate "Redirecting"
        const timer = setTimeout(async () => {
            try {
                const response = await fetch('http://localhost/HertiX/user-dashboard/backend/api/rentals.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderDetails)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    const mockOrderIds = orderDetails.cart.map(() => Math.floor(Math.random() * 10000));
                    navigate('/payment-success', { state: { orderIds: mockOrderIds, totalAmount: orderDetails.total_amount } });
                } else {
                    toast.error("Payment Failed");
                    navigate('/checkout');
                }
            } catch (err) {
                console.error(err);
                navigate('/checkout');
            }
        }, 4000);

        return () => clearTimeout(timer);
    }, [orderDetails, navigate]);

    if (!orderDetails) return null;

    return (
        <div style={{ background: '#202124', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', color: 'white' }}>

            {/* Google Pay Logo Area */}
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '500', color: 'white' }}>Google</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '400', color: 'white' }}>Pay</span>
            </div>

            {/* Central Processing Circle */}
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '40px' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%'
                }}></div>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    border: '4px solid #4285f4', borderRadius: '50%', borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>

            {/* Payment Details */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '400', marginBottom: '10px' }}>₹ {orderDetails.total_amount}</h2>
            <p style={{ color: '#9aa0a6', fontSize: '1rem', margin: '0 0 5px 0' }}>Paying HeritX Rentals</p>
            <p style={{ color: '#5f6368', fontSize: '0.9rem' }}>{orderDetails.upiId}</p>

            {/* Bottom Secure Footer */}
            <div style={{ position: 'absolute', bottom: '30px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                <div style={{ width: '12px', height: '12px', background: '#34a853', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.85rem', color: '#9aa0a6' }}>Processed securely by Google Pay</span>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UPIGateway;

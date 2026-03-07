import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import { FaLock, FaWifi } from 'react-icons/fa';

const BankGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderDetails } = location.state || {};
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(120);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!orderDetails) {
            navigate('/checkout');
            return;
        }
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, [orderDetails, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp !== '1234') {
            toast.error("Incorrect OTP. Please try '1234'"); // Subtle hint
            return;
        }

        setIsProcessing(true);
        // Simulate network delay
        setTimeout(async () => {
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
                    toast.error("Transaction Failed");
                    setIsProcessing(false);
                }
            } catch (err) {
                console.error(err);
                setIsProcessing(false);
            }
        }, 2000);
    };

    if (!orderDetails) return null;

    // Formatting date for "Transaction Date"
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <div style={{ background: 'white', maxWidth: '600px', margin: '40px auto', border: '1px solid #dcdcdc', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>

                {/* Bank Header */}
                <div style={{ padding: '20px', borderBottom: '2px solid #004a8f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#004a8f', fontWeight: 'bold', fontSize: '1.5rem', fontFamily: 'serif' }}>
                        SECURE<span style={{ color: '#eab308' }}>BANK</span>
                    </div>
                    <div style={{ height: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#666', fontSize: '0.8rem' }}>Verified by</span>
                        <div style={{ background: '#004a8f', color: 'white', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px' }}>VISA</div>
                        <div style={{ background: '#cc0000', color: 'white', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px' }}>MasterCard</div>
                    </div>
                </div>

                {/* Secure Header */}
                <div style={{ padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#333' }}>
                    <FaLock size={12} color="#28a745" />
                    <strong>Authentication Required</strong>
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#666' }}>ID: {Math.floor(Math.random() * 100000000)}</span>
                </div>

                <div style={{ padding: '40px 60px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#333' }}>
                            Please enter the One Time Password (OTP) sent to your mobile number ending with <strong>XXXXXX8899</strong>
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', rowGap: '15px', columnGap: '20px', fontSize: '0.9rem', color: '#555', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Merchant Name:</div>
                        <div>HeritX Rentals</div>

                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Transaction Amount:</div>
                        <div style={{ color: '#000', fontWeight: 'bold' }}>₹{parseFloat(orderDetails.total_amount).toFixed(2)}</div>

                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Date:</div>
                        <div>{today}</div>

                        <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Card Number:</div>
                        <div>XXXX XXXX XXXX {orderDetails.cardLast4}</div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: '40px', padding: '20px', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>Enter OTP:</label>
                            <input
                                type="password"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '150px', letterSpacing: '2px' }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                style={{
                                    background: '#004a8f', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '3px',
                                    fontWeight: 'bold', cursor: isProcessing ? 'wait' : 'pointer', opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? 'Verifying...' : 'SUBMIT'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/checkout')}
                                style={{ background: 'transparent', border: 'none', color: '#004a8f', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                        <p>Resend OTP in <strong>{timer} seconds</strong></p>
                    </div>

                </div>

                <div style={{ borderTop: '1px solid #dcdcdc', padding: '15px', textAlign: 'center', fontSize: '0.75rem', color: '#888', background: '#fafafa' }}>
                    This page is secured with 256-bit SSL encryption. <br />
                    Copyright © 2026 SecureBank Gateway. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default BankGateway;

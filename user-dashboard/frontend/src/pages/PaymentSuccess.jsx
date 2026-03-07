import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight, FaReceipt, FaWhatsapp } from 'react-icons/fa';

const PaymentSuccess = () => {
    const location = useLocation();
    const { orderIds, totalAmount, paymentIds, contactInfo, message } = location.state || {};
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}>
            {/* Injecting CSS Keyframes for Animations */}
            <style>{`
                @keyframes scaleUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slideUpFade {
                    0% { transform: translateY(30px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes confettiFall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
                .confetti {
                    position: fixed;
                    width: 10px; height: 10px;
                    background-color: #fca5a5;
                    animation: confettiFall 3s linear forwards;
                    z-index: 0;
                }
                .success-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    padding: 50px 40px;
                    max-width: 650px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    z-index: 10;
                    border: 1px solid rgba(255,255,255,0.5);
                }
                .animate-icon {
                    animation: scaleUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .animate-text-1 { opacity: 0; animation: slideUpFade 0.6s ease-out 0.3s forwards; }
                .animate-text-2 { opacity: 0; animation: slideUpFade 0.6s ease-out 0.5s forwards; }
                .animate-box-3 { opacity: 0; animation: slideUpFade 0.6s ease-out 0.7s forwards; }
                .animate-btns-4 { opacity: 0; animation: slideUpFade 0.6s ease-out 0.9s forwards; }
                
                .btn-primary {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    color: white;
                    padding: 14px 28px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(15, 23, 42, 0.2);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.3);
                }
                .btn-secondary {
                    background: white;
                    color: #0f172a;
                    padding: 14px 28px;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    border: 1px solid #cbd5e1;
                    transition: all 0.3s ease;
                }
                .btn-secondary:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                }
                .receipt-btn {
                    padding: 12px 20px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.2s;
                }
                .receipt-btn:hover { transform: scale(1.05); }
            `}</style>

            {/* Confetti Background Layer */}
            {animate && Array.from({ length: 30 }).map((_, i) => {
                const colors = ['#fca5a5', '#6ee7b7', '#93c5fd', '#fcd34d', '#c4b5fd'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const randomLeft = Math.random() * 100;
                const randomDelay = Math.random() * 0.5;
                const randomDuration = 2 + Math.random() * 2;
                return (
                    <div key={i} className="confetti" style={{
                        left: `${randomLeft}vw`,
                        backgroundColor: randomColor,
                        animationDelay: `${randomDelay}s`,
                        animationDuration: `${randomDuration}s`
                    }}></div>
                );
            })}

            <div className="success-card">
                <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }} className="animate-icon">
                    <div style={{
                        width: '100px', height: '100px', background: '#dcfce7', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 15px rgba(220, 252, 231, 0.5)'
                    }}>
                        <FaCheckCircle size={60} color="#16a34a" />
                    </div>
                </div>

                <h1 className="animate-text-1" style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px', letterSpacing: '-0.5px' }}>
                    {contactInfo?.deliveryMethod === 'pickup' ? 'Order Confirmed!' : 'Payment Successful!'}
                </h1>

                <p className="animate-text-2" style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '35px', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 35px auto' }}>
                    {contactInfo?.deliveryMethod === 'pickup'
                        ? `Thank you for your order. Please pick up your items during your selected slot.`
                        : (message || `Thank you for your purchase. We are processing your selected items.`)
                    }
                    <br /><strong style={{ color: '#0f172a', display: 'inline-block', marginTop: '10px' }}>Order ID(s): {orderIds?.join(', ')}</strong>
                </p>

                <div className="animate-box-3" style={{ background: '#f1f5f9', padding: '25px', borderRadius: '16px', marginBottom: '35px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Total Amount Paid</p>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '2.8rem', color: '#0f172a', fontWeight: '800' }}>₹{totalAmount || '0.00'}</h2>
                </div>

                <div className="animate-btns-4" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '35px' }}>
                    <Link to="/dashboard/rentals" className="btn-primary">
                        View My Rentals <FaArrowRight />
                    </Link>
                    <Link to="/" className="btn-secondary">
                        Continue Browsing
                    </Link>
                </div>

                {/* Receipt Download Section */}
                <div className="animate-btns-4" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '25px' }}>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {(paymentIds && contactInfo?.deliveryMethod !== 'pickup') && (
                            <>
                                {paymentIds.rent && (
                                    <a href={`http://localhost/HertiX/user-dashboard/backend/api/receipt.php?id=${paymentIds.rent}`} target="_blank" rel="noopener noreferrer"
                                        className="receipt-btn" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                                        <FaReceipt /> Rent Receipt
                                    </a>
                                )}
                                {paymentIds.deposit && (
                                    <a href={`http://localhost/HertiX/user-dashboard/backend/api/receipt.php?id=${paymentIds.deposit}`} target="_blank" rel="noopener noreferrer"
                                        className="receipt-btn" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                        <FaReceipt /> Deposit Receipt
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PaymentSuccess;

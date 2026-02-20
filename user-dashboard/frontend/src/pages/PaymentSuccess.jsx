import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const PaymentSuccess = () => {
    const location = useLocation();
    const { orderIds, totalAmount, paymentIds, contactInfo, message } = location.state || {};

    // Construct WhatsApp Message
    // Construct WhatsApp Message
    // Use the number entered by the user in checkout
    const targetNumber = contactInfo?.phone ? `91${contactInfo.phone}` : '919876543210';

    let waMessage = `Hello! I have placed an order on HeritX.\nOrder Amount: ₹${totalAmount}\n`;
    if (orderIds && orderIds.length > 0) waMessage += `Order ID: #${orderIds[0]}\n`;
    if (contactInfo) {
        waMessage += `Contact: ${contactInfo.phone}\n`;
        if (contactInfo.deliveryMethod === 'delivery') {
            waMessage += `Delivery Address: ${contactInfo.deliveryAddress}, ${contactInfo.city} - ${contactInfo.pincode}`;
        } else {
            waMessage += `Method: Store Pickup`;
        }
    }
    const waLink = `https://wa.me/${targetNumber}?text=${encodeURIComponent(waMessage)}`;

    return (
        <div className="payment-success-container" style={{ textAlign: 'center', padding: '50px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <FaCheckCircle size={80} color="#16a34a" />
            </div>

            <h1 style={{ color: '#1a1a1a', marginBottom: '15px' }}>
                {contactInfo?.deliveryMethod === 'pickup' ? 'Order Confirmed!' : 'Payment Successful!'}
            </h1>

            <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '30px', lineHeight: '1.6' }}>
                {contactInfo?.deliveryMethod === 'pickup'
                    ? `Thank you for your order. Please pick up your items during your selected slot. Order ID(s): ${orderIds?.join(', ')}`
                    : (message || `Thank you for your purchase. Your order ID(s): ${orderIds?.join(', ')}`)
                }
            </p>

            {/* Show message separately if strictly defined, or just rely on the above line */}
            {/* If message is present, it replaces the default "Thank you..." line above. */}

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>Order Details</h3>
                <h2 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a' }}>₹{totalAmount || '0.00'}</h2>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <Link to="/dashboard/rentals" style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#1a1a1a', color: 'white', padding: '12px 25px',
                    borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold'
                }}>
                    View My Rentals <FaArrowRight />
                </Link>
                <Link to="/" style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'white', color: '#1a1a1a', padding: '12px 25px',
                    borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold',
                    border: '1px solid #ddd'
                }}>
                    Continue Browsing
                </Link>
            </div>

            {/* Receipt Download Section - Hide for Pickup (Pay on Pickup) */}
            {paymentIds && contactInfo?.deliveryMethod !== 'pickup' && (
                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px' }}>Download Receipts</h3>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {paymentIds.rent && (
                            <a
                                href={`http://localhost/HertiX/user-dashboard/backend/api/receipt.php?id=${paymentIds.rent}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px', background: '#f0fdf4', color: '#166534',
                                    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
                                    border: '1px solid #dcfce7'
                                }}
                            >
                                <FaCheckCircle /> Rent Receipt
                            </a>
                        )}
                        {paymentIds.deposit && (
                            <a
                                href={`http://localhost/HertiX/user-dashboard/backend/api/receipt.php?id=${paymentIds.deposit}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 20px', background: '#eff6ff', color: '#1e40af',
                                    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
                                    border: '1px solid #dbeafe'
                                }}
                            >
                                <FaCheckCircle /> Deposit Receipt
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* WhatsApp Share Button */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 25px', background: '#25D366', color: 'white',
                        borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                    }}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '20px', height: '20px' }} />
                    Send Confirmation to WhatsApp
                </a>
            </div>
        </div>
    );
};

export default PaymentSuccess;

import React from 'react';
import { Link } from 'react-router-dom';

const BecomeOwner = () => {
    return (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'serif', color: '#1a1a1a', marginBottom: '20px' }}>
                    Become a HeritX Owner
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                    Share your collection with the world. Earn by renting out your authentic traditional items for weddings, festivals, and photo shoots.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <a href="http://localhost:5173/shop-owner/login" style={{
                        padding: '15px 40px',
                        backgroundColor: '#1a1a1a',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}>
                        Login as Owner
                    </a>

                    <a href="http://localhost:5173/register/owner" style={{
                        padding: '15px 40px',
                        backgroundColor: 'white',
                        color: '#1a1a1a',
                        textDecoration: 'none',
                        border: '2px solid #1a1a1a',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }}>
                        Register New Shop
                    </a>
                </div>

                <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'left' }}>
                    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '10px' }}>List for Free</h3>
                        <p style={{ color: '#777' }}>Create your shop and list items with zero upfront cost.</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Secure Payments</h3>
                        <p style={{ color: '#777' }}>Get paid directly to your account after every successful rental.</p>
                    </div>
                    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Community</h3>
                        <p style={{ color: '#777' }}>Connect with people who value tradition and culture.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeOwner;

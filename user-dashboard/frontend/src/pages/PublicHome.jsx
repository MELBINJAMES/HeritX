import React, { useEffect, useState } from 'react';
import { fetchItems } from '../services/api';
import { Link } from 'react-router-dom';

const PublicHome = () => {
    const [featuredItems, setFeaturedItems] = useState([]);

    useEffect(() => {
        fetchItems().then(data => {
            // Data is guaranteed to include mocks if DB is empty
            if (data) {
                setFeaturedItems(data.slice(0, 10));
            }
        });
    }, []);

    return (
        <div className="public-home">
            {/* Hero Section */}
            <section style={{
                backgroundColor: '#fdfbf7',
                padding: '80px 20px',
                textAlign: 'center',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '3.5rem', fontFamily: 'serif', color: '#2c3e50', marginBottom: '15px' }}>
                    Rent Authentic Traditions
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#7f8c8d', maxWidth: '600px', margin: '0 auto 30px' }}>
                    Experience the elegance of Kerala's heritage without the cost of owning.
                    Rent jewelry, attire, and decor for your special occasions.
                </p>

            </section>

            {/* Featured Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center', color: '#333' }}>Featured Collections</h2>

                <div
                    className="items-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '20px',
                        paddingBottom: '20px',
                        width: '100%'
                    }}
                >
                    {featuredItems.length > 0 ? featuredItems.map(item => (
                        <div key={item.id} className="item-card" style={{
                            width: '100%',
                            background: 'white', borderRadius: '12px', overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee'
                        }}>
                            <div className="item-image" style={{ height: '200px' }}>
                                <img
                                    src={`/${item.image_url}`}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                />
                            </div>
                            <div className="item-info" style={{ padding: '15px' }}>
                                <h3 className="item-name" style={{ fontSize: '1rem', margin: '0 0 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 10px' }}>{item.category}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="item-price" style={{ fontWeight: 'bold', fontSize: '1rem' }}>₹{item.price_per_day}</span>
                                    <Link to={`/item/${item.id}`} style={{
                                        color: 'white', background: '#1a1a1a', padding: '5px 12px',
                                        borderRadius: '20px', fontSize: '0.8rem', textDecoration: 'none'
                                    }}>
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                            No items found. Add items from Admin Panel.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PublicHome;

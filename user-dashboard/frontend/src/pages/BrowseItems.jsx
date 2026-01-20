import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchItems } from '../services/api';

const BrowseItems = () => {
    const [items, setItems] = useState([]);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        fetchItems().then(data => setItems(data));
    }, []);

    // Filter items based on search query matching Name, Category, or Occasion
    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;

        const lowerQuery = searchQuery.toLowerCase();

        // Handle undefined or null values safely
        const name = item.name ? item.name.toLowerCase() : '';
        const category = item.category ? item.category.toLowerCase() : '';
        const occasion = item.occasion ? item.occasion.toLowerCase() : '';

        return (
            name.includes(lowerQuery) ||
            category.includes(lowerQuery) ||
            occasion.includes(lowerQuery)
        );
    });

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '20px', color: '#1a1a1a' }}>Browse Traditional Items</h1>
                <p style={{ color: '#666' }}>
                    {searchQuery ? `Showing results for "${searchQuery}"` : 'Explore our collection of Kerala\'s heritage'}
                </p>
            </div>

            <div className="items-grid">
                {filteredItems.length > 0 ? filteredItems.map(item => (
                    <div key={item.id} className="item-card">
                        <div className="item-image">
                            {item.image_url ? (
                                // In real app, proper image path handling needed
                                <img src={`/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }} />
                            ) : <span>Image</span>}
                        </div>
                        <div className="item-info">
                            <h3 className="item-name">{item.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.category} • {item.occasion}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span className="item-price">₹{item.price_per_day}/day</span>
                                <Link to={`/item/${item.id}`} style={{
                                    color: 'white', background: '#1a1a1a', padding: '5px 15px',
                                    borderRadius: '20px', fontSize: '0.85rem', textDecoration: 'none'
                                }}>
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>No items found matching your search.</p>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;

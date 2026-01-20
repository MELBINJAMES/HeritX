import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchItems } from '../services/api';

const ItemDetails = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);

    useEffect(() => {
        // In a real API we would fetch by ID: fetchItem(id)
        // For now we fetch all and find
        fetchItems().then(items => {
            const found = items.find(i => i.id == id);
            setItem(found);
        });
    }, [id]);

    const [quantity, setQuantity] = useState(1);

    if (!item) return <div style={{ padding: '40px' }}>Loading...</div>;

    const maxQty = item.quantity || 1;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '40px' }}>
            <div style={{ flex: 1, height: '400px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img
                    src={`/${item.image_url}`}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#333' }}>{item.name}</h1>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>{item.category} • {item.occasion}</p>

                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '20px' }}>
                    ₹{item.price_per_day} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>/ day</span>
                </div>

                <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '30px' }}>
                    {item.description || 'Experience the tradition with this authentic piece. Perfect for your special occasion.'}
                </p>

                <div style={{ background: '#fff8e1', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '10px', color: '#f57c00' }}>Cultural Significance</h3>
                    <p style={{ fontSize: '0.9rem' }}>{item.guidance || 'This item holds a special place in Kerala tradition.'}</p>
                </div>

                {/* Quantity Selector */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Quantity</label>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            style={{ padding: '10px 15px', background: '#f9f9f9', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
                        >−</button>
                        <div style={{ padding: '0 20px', fontSize: '1.1rem', fontWeight: 'bold' }}>{quantity}</div>
                        <button
                            onClick={() => setQuantity(prev => Math.min(maxQty, prev + 1))}
                            style={{ padding: '10px 15px', background: '#f9f9f9', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
                            disabled={quantity >= maxQty}
                        >+</button>
                    </div>
                    <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9rem' }}>
                        {maxQty} available
                    </span>
                </div>

                <div style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Total: ₹{item.price_per_day * quantity}
                </div>

                <button
                    onClick={() => alert(`Proceeding to rent ${quantity} item(s) for ₹${item.price_per_day * quantity}`)}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        cursor: 'pointer'
                    }}
                >
                    Rent Now
                </button>
            </div>
        </div>
    );
};

export default ItemDetails;

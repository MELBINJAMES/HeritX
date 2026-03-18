import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWishlist, toggleWishlist } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa';

const Wishlist = () => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadWishlist();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadWishlist = async () => {
        setLoading(true);
        const data = await fetchWishlist(user.id);
        setWishlist(data);
        setLoading(false);
    };

    const handleRemove = async (itemId) => {
        if (confirm("Remove from wishlist?")) {
            await toggleWishlist(user.id, itemId);
            loadWishlist(); // Refresh
        }
    };

    if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Please login to view wishlist.</div>;

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>My Wishlist</h1>

            {wishlist.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {wishlist.map(item => (
                        <div key={item.id} style={{
                            background: 'white', borderRadius: '12px', overflow: 'hidden',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eee',
                            position: 'relative'
                        }}>
                            <Link to={`/item/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ height: '200px', background: '#f8f8f8' }}>
                                    <img
                                        src={`/HertiX/${item.image_url}`}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                    />
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px' }}>{item.name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 10px' }}>{item.category}</p>
                                    <div style={{ fontWeight: 'bold' }}>₹{item.price_per_day}</div>
                                </div>
                            </Link>

                            <button
                                onClick={() => handleRemove(item.id)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'white', border: 'none', borderRadius: '50%',
                                    width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer', color: '#e91e63'
                                }}
                                title="Remove"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                    <p>Your wishlist is empty.</p>
                    <Link to="/browse" style={{ color: '#1a1a1a', fontWeight: 'bold' }}>Browse Items</Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;

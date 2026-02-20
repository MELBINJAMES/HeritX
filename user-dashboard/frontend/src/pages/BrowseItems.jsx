import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchItems, fetchWishlist, toggleWishlist } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaCartPlus, FaHeart, FaRegHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BrowseItems = () => {
    const [items, setItems] = useState([]);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [wishlistIds, setWishlistIds] = useState(new Set());

    useEffect(() => {
        fetchItems().then(data => setItems(data));

        if (user) {
            fetchWishlist(user.id).then(list => {
                const ids = new Set(list.map(item => String(item.id || item.item_id)));
                setWishlistIds(ids);
            });
        }
    }, [user]);

    const handleWishlistToggle = async (e, itemId) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error(t('login_required') || "Please login to add items to wishlist");
            return;
        }

        const res = await toggleWishlist(user.id, itemId);
        if (res.status === 'success') {
            const isRemoving = wishlistIds.has(String(itemId));
            setWishlistIds(prev => {
                const newIds = new Set(prev);
                const stringId = String(itemId);
                if (newIds.has(stringId)) newIds.delete(stringId);
                else newIds.add(stringId);
                return newIds;
            });

            if (isRemoving) {
                toast.success(t('removed_from_wishlist') || "Removed from wishlist");
            } else {
                toast.success(t('added_to_wishlist') || "Added to wishlist!");
            }
        }
    };

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
                <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '20px', color: '#1a1a1a' }}>{t('browse_title')}</h1>
                <p style={{ color: '#666' }}>
                    {searchQuery ? `${t('showing_results')} "${searchQuery}"` : t('browse_subtitle')}
                </p>
            </div>

            <div className="items-grid">
                {filteredItems.length > 0 ? filteredItems.map(item => (
                    <div key={item.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ position: 'relative' }}>
                            <Link to={`/item/${item.id}`} className="item-image" style={{ display: 'block' }}>
                                {item.image_url ? (
                                    <img src={`/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }} />
                                ) : <span>Image</span>}
                            </Link>
                            <button
                                onClick={(e) => handleWishlistToggle(e, item.id)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'white', border: 'none', borderRadius: '50%',
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer',
                                    color: wishlistIds.has(String(item.id)) ? '#ff4d4d' : '#666',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                title={wishlistIds.has(String(item.id)) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                {wishlistIds.has(String(item.id)) ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                            </button>
                        </div>
                        <div className="item-info">
                            <h3 className="item-name">{item.name}</h3>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>{item.category} • {item.occasion}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <span className="item-price">₹{item.price_per_day}/day</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (!isAuthenticated) {
                                                toast.error(t('login_required') || "Please login to continue");
                                                return;
                                            }
                                            addToCart(item);
                                        }}
                                        style={{
                                            background: '#f8f9fa', border: '1px solid #ddd',
                                            borderRadius: '50%', width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#333'
                                        }}
                                        title="Add to Cart"
                                    >
                                        <FaCartPlus size={14} />
                                    </button>
                                    <Link to={`/item/${item.id}`} style={{
                                        color: 'white', background: '#1a1a1a', padding: '5px 15px',
                                        borderRadius: '20px', fontSize: '0.85rem', textDecoration: 'none'
                                    }}>
                                        {t('view')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>{t('no_results')}</p>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;

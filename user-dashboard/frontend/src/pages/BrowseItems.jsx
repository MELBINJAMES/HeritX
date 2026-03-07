import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchItems, fetchWishlist, toggleWishlist } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUserLocation } from '../context/LocationContext';
import { FaCartPlus, FaHeart, FaRegHeart, FaMapMarkerAlt, FaCrosshairs, FaTimes, FaMap } from 'react-icons/fa';
import MapView from '../components/MapView';
import toast from '../utils/toast';

const BrowseItems = () => {
    const [items, setItems] = useState([]);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { location: userLoc, detectLocation, setLocation: setGlobalLocation } = useUserLocation();
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [locationFilter, setLocationFilter] = useState('');
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        fetchItems().then(data => setItems(data));

        if (user) {
            fetchWishlist(user.id).then(list => {
                const ids = new Set(list.map(item => String(item.id || item.item_id)));
                setWishlistIds(ids);
            });
        }
    }, [user]);

    // Sync local filter with global location
    useEffect(() => {
        if (userLoc) {
            const locStr = userLoc.manual ? (userLoc.city || userLoc.pincode) : userLoc.city;
            if (locStr && !locationFilter) {
                setLocationFilter(locStr);
            }
        }
    }, [userLoc]);

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

    // Filter items based on search query ONLY (Name, Category, or Occasion)
    const searchMatchedItems = items.filter(item => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        const name = item.name ? item.name.toLowerCase() : '';
        const category = item.category ? item.category.toLowerCase() : '';
        const occasion = item.occasion ? item.occasion.toLowerCase() : '';
        return name.includes(lowerQuery) || category.includes(lowerQuery) || occasion.includes(lowerQuery);
    });

    // Categorize items into 'local' (matching location filter) and 'others'
    const localItems = [];
    const otherItems = [];

    searchMatchedItems.forEach(item => {
        if (!locationFilter) {
            localItems.push(item); // If no location specified, all matches go here
            return;
        }

        const lowerLoc = locationFilter.toLowerCase();
        const shopCity = item.shop_city ? item.shop_city.toLowerCase() : '';
        const shopPincode = item.shop_pincode ? item.shop_pincode.toLowerCase() : '';

        if (shopCity.includes(lowerLoc) || shopPincode.includes(lowerLoc)) {
            localItems.push(item);
        } else {
            otherItems.push(item);
        }
    });

    const renderItemCard = (item) => {
        const now = new Date();
        const hasActiveOffer = item.offer_title && item.offer_start && item.offer_end &&
            new Date(item.offer_start) <= now && new Date(item.offer_end) >= now;

        return (
            <div key={item.id} className="item-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative' }}>
                    <Link to={`/item/${item.id}`} className="item-image" style={{ display: 'block' }}>
                        {item.image_url ? (
                            <img src={`/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }} />
                        ) : <span>Image</span>}
                    </Link>
                    {hasActiveOffer && (
                        <div style={{
                            position: 'absolute', top: '10px', left: '10px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white',
                            padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10
                        }}>
                            <span>🎁</span> {item.offer_title}
                        </div>
                    )}
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
        );
    };

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

                {/* Location Filter Selector - Compact & Attractive */}
                <div style={{
                    marginTop: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'white',
                    padding: '8px 16px',
                    borderRadius: '40px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                        <FaMapMarkerAlt size={14} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>In:</span>
                    </div>
                    <input
                        type="text"
                        placeholder="City or Pincode..."
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            width: '150px',
                            background: 'transparent'
                        }}
                    />
                    {locationFilter && (
                        <button
                            onClick={() => setLocationFilter('')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                        >
                            <FaTimes size={12} color="#94a3b8" />
                        </button>
                    )}
                    <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }}></div>
                    <button
                        onClick={async () => {
                            try {
                                const loc = await detectLocation();
                                setGlobalLocation(loc);
                                setLocationFilter(loc.city || loc.pincode);
                                toast.success("Location updated!");
                            } catch (e) {
                                toast.error("Could not detect location.");
                            }
                        }}
                        style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FaCrosshairs size={12} /> Detect
                    </button>
                </div>

                {/* Map toggle button */}
                <button
                    onClick={() => setShowMap(v => !v)}
                    style={{
                        marginTop: '14px',
                        background: showMap ? '#1a1a1a' : '#f1f5f9',
                        color: showMap ? 'white' : '#475569',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    <FaMap size={13} />
                    {showMap ? 'Hide Map' : 'Show Map'}
                </button>
            </div>

            {/* Leaflet Map Section */}
            {showMap && (
                <div style={{ marginBottom: '40px' }}>
                    <MapView
                        userCity={userLoc?.city || locationFilter}
                        userLat={userLoc?.lat}
                        userLng={userLoc?.lng}
                    />
                </div>
            )}

            <div className="items-grid-sections">
                {/* Scenario 1: No location filter applied */}
                {!locationFilter && localItems.length > 0 && (
                    <div className="items-grid">
                        {localItems.map(item => renderItemCard(item))}
                    </div>
                )}

                {/* Scenario 2: Location filter applied, and items exist in that location */}
                {locationFilter && localItems.length > 0 && (
                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', marginBottom: '25px', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📍</span> Items in {locationFilter}
                        </h2>
                        <div className="items-grid">
                            {localItems.map(item => renderItemCard(item))}
                        </div>
                    </div>
                )}

                {/* Scenario 3: Location filter applied, but NO items in that location */}
                {locationFilter && localItems.length === 0 && otherItems.length > 0 && (
                    <div style={{
                        backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginBottom: '40px', textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '1.2rem', fontFamily: 'serif' }}>No items found perfectly matching "{locationFilter}"</h3>
                        <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem' }}>Don't worry! Here are some other beautiful traditional items available from nearby locations.</p>
                    </div>
                )}

                {/* Render other items if location filter is active */}
                {locationFilter && otherItems.length > 0 && (
                    <div>
                        {localItems.length > 0 && (
                            <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', marginBottom: '25px', color: '#1a1a1a', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>Available Items</h2>
                        )}
                        <div className="items-grid">
                            {otherItems.map(item => renderItemCard(item))}
                        </div>
                    </div>
                )}

                {/* Scenario 4: Nothing matches search query */}
                {localItems.length === 0 && otherItems.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '40px', fontSize: '1.1rem' }}>{t('no_results')}</p>
                )}
            </div>
        </div>
    );
};

export default BrowseItems;

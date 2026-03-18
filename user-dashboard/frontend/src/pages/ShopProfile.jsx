import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchItems } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaStoreAlt, FaCartPlus, FaCheckCircle, FaStar, FaShieldAlt, FaBoxOpen, FaExpandAlt, FaTimes, FaGift } from 'react-icons/fa';
import MapView from '../components/MapView';
import toast from '../utils/toast';

const ShopProfile = () => {
    const { id } = useParams();
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [shopItems, setShopItems] = useState([]);
    const [shopInfo, setShopInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMapModal, setShowMapModal] = useState(false);

    useEffect(() => {
        fetchItems().then(data => {
            const filtered = data.filter(item => item.owner_id == id);
            setShopItems(filtered);
            if (filtered.length > 0) {
                setShopInfo({
                    name: filtered[0].shop_name,
                    city: filtered[0].shop_city,
                    pincode: filtered[0].shop_pincode,
                    lat: filtered[0].shop_lat ? parseFloat(filtered[0].shop_lat) : null,
                    lng: filtered[0].shop_lng ? parseFloat(filtered[0].shop_lng) : null,
                    image: filtered[0].shop_image,
                    offer_message: filtered[0].offer_message,
                    offer_title: filtered[0].offer_title,
                    offer_start: filtered[0].offer_start,
                    offer_end: filtered[0].offer_end
                });
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#64748b' }}>Loading Shop Details...</div>;
    if (!shopInfo) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#64748b' }}>Shop not found or has no active listings.</div>;

    return (
        <div style={{ backgroundColor: '#fafaf9', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Elegant Top Banner - Black/Dark Theme */}
            <div style={{
                background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid #3f3f46'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.05) 2px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {/* Profile Header Box */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '30px 40px',
                    marginTop: '-90px',
                    position: 'relative',
                    zIndex: 10,
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    border: '1px solid #f3f4f6',
                    flexWrap: 'wrap'
                }}>
                    {/* Unique Avatar Hexagon / Circle */}
                    <div style={{
                        width: '120px', height: '120px',
                        backgroundColor: '#f4f4f5',
                        border: '4px solid white',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                        color: '#27272a',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {shopInfo.image ? (
                            <img src={shopInfo.image} alt={shopInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <FaStoreAlt size={50} />
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h1 style={{ fontSize: '2.4rem', fontFamily: 'serif', margin: 0, color: '#1c1917', lineHeight: 1.1 }}>
                                {shopInfo.name}
                            </h1>
                            <span style={{
                                backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0',
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}>
                                <FaCheckCircle /> Verified
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#57534e', fontSize: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaMapMarkerAlt color="#52525b" />
                                {shopInfo.city} {shopInfo.pincode && `— ${shopInfo.pincode}`}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaStar color="#52525b" />
                                <span style={{ fontWeight: '600', color: '#1c1917' }}>4.9</span> (Authentic Heritage)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Offer Banner */}
                {shopInfo.offer_title && shopInfo.offer_start && shopInfo.offer_end &&
                    new Date(shopInfo.offer_start) <= new Date() && new Date(shopInfo.offer_end) >= new Date() && (
                        <div style={{
                            marginTop: '20px',
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                            border: '1px solid #fde68a',
                            borderRadius: '16px',
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)',
                            animation: 'slideUpFade 0.5s ease-out'
                        }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', flexShrink: 0,
                                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                            }} className="pulse-animation">
                                <FaGift size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#b45309', fontSize: '1.2rem', fontFamily: 'serif', fontWeight: 'bold' }}>
                                    {shopInfo.offer_title}
                                </h4>
                                <p style={{ margin: 0, color: '#92400e', fontSize: '1rem', fontWeight: 500 }}>
                                    {shopInfo.offer_message}
                                </p>
                            </div>
                        </div>
                    )}

                {/* Main Content Split */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 320px) 1fr', gap: '30px', marginTop: '40px', alignItems: 'start' }}>

                    {/* Left Column: Location & Trust */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>

                        {/* Map Card */}
                        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontFamily: 'serif', color: '#1c1917' }}>
                                Shop Location
                            </h3>
                            <div
                                onClick={() => setShowMapModal(true)}
                                style={{
                                    position: 'relative', borderRadius: '12px', overflow: 'hidden',
                                    border: '1px solid #e7e5e4', marginBottom: '16px', cursor: 'pointer',
                                    transition: 'box-shadow 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                                title="Click to open full map"
                            >
                                <div style={{ pointerEvents: 'none' }}>
                                    <MapView
                                        singleShop={{
                                            lat: shopInfo.lat,
                                            lng: shopInfo.lng,
                                            name: shopInfo.name,
                                            city: shopInfo.city
                                        }}
                                        height="200px"
                                    />
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: '10px', right: '10px',
                                    backgroundColor: 'white', padding: '6px', borderRadius: '50%',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    pointerEvents: 'none' // Let the parent catch clicks
                                }}>
                                    <FaExpandAlt color="#1c1917" size={14} />
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#57534e', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: '1.5' }}>
                                <FaMapMarkerAlt style={{ marginTop: '4px', color: '#a8a29e', flexShrink: 0 }} />
                                <span>{shopInfo.city} {shopInfo.pincode ? `, ${shopInfo.pincode}` : ''}<br />Kerala, India</span>
                            </p>
                        </div>

                        {/* Trust Card */}
                        <div style={{ backgroundColor: '#f4f4f5', borderRadius: '20px', padding: '24px', border: '1px solid #e4e4e7' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#27272a', fontFamily: 'serif' }}>Why Local Heritage?</h4>
                            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', color: '#3f3f46', fontSize: '0.95rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaShieldAlt color="#52525b" />
                                    </div>
                                    Secure & Trusted
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaCheckCircle color="#52525b" />
                                    </div>
                                    Verified Quality
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaBoxOpen color="#52525b" />
                                    </div>
                                    Carefully Packaged
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Items Grid */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'serif', color: '#1c1917' }}>Explore Collection</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                            {shopItems.map(item => (
                                <div key={item.id} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid #f3f4f6',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.08)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02)'; }}
                                >
                                    <Link to={`/item/${item.id}`} style={{ position: 'relative', display: 'block', height: '220px' }}>
                                        <img
                                            src={`/HertiX/${item.image_url}`}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                                        />
                                        <div style={{
                                            position: 'absolute', bottom: '12px', right: '12px',
                                            backgroundColor: 'white', padding: '6px 12px',
                                            borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold',
                                            color: '#1c1917', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            ₹{item.price_per_day} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#57534e' }}>/ day</span>
                                        </div>
                                    </Link>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ color: '#52525b', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                            {item.category}
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', color: '#1c1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.name}
                                        </h3>

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Link to={`/item/${item.id}`} style={{
                                                color: '#44403c', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none'
                                            }}
                                                onMouseOver={(e) => e.currentTarget.style.color = '#1c1917'}
                                                onMouseOut={(e) => e.currentTarget.style.color = '#44403c'}
                                            >
                                                View details
                                            </Link>

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
                                                    backgroundColor: '#18181b',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    width: '36px', height: '36px',
                                                    borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
                                                title="Add to Cart"
                                            >
                                                <FaCartPlus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Fullscreen Modal */}
            {showMapModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden',
                        width: '100%', maxWidth: '1000px', height: '80vh',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'serif', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaMapMarkerAlt color="#52525b" /> {shopInfo.name} Location
                            </h2>
                            <button
                                onClick={() => setShowMapModal(false)}
                                style={{
                                    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
                                    color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '4px'
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <MapView
                                singleShop={{
                                    lat: shopInfo.lat,
                                    lng: shopInfo.lng,
                                    name: shopInfo.name,
                                    city: shopInfo.city
                                }}
                                height="100%"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopProfile;

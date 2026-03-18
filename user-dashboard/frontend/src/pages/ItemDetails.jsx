import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchItems, fetchItemAvailability } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarOverride.css';
import toast from '../utils/toast';
import { FaShoppingCart, FaCalendarAlt, FaInfoCircle, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaPlus, FaMinus, FaArrowLeft, FaMapMarkerAlt, FaStore } from 'react-icons/fa';

const ItemDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [availabilityData, setAvailabilityData] = useState({ total_quantity: 0, occupancy: {} });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([null, null]);
    const [pickupTime, setPickupTime] = useState('10:00');
    const [returnTime, setReturnTime] = useState('18:00');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const loadData = async () => {
            try {
                const items = await fetchItems();
                const foundItem = items.find(i => i.id == id);
                if (foundItem) {
                    setItem(foundItem);
                    const availability = await fetchItemAvailability(id);
                    if (availability && availability.status === 'success') {
                        setAvailabilityData(availability);
                    }
                }
            } catch (err) {
                console.error("Error loading item:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Loading Item Details...</div>;
    if (!item) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Item not found</div>;

    const getOccupancyForDate = (date) => {
        if (!date) return 0;
        const dateStr = date.toISOString().split('T')[0];
        return availabilityData.occupancy[dateStr] || 0;
    };

    const isDateFullyBooked = ({ date }) => {
        const occupancy = getOccupancyForDate(date);
        return occupancy >= availabilityData.total_quantity;
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error(t('login_required') || "Please login to continue");
            return;
        }

        const cartItem = {
            ...item,
            // Dates will be selected at checkout
            totalPrice: item.price_per_day * quantity
        };

        addToCart(cartItem, quantity);
        toast.success("Item added to cart! Select dates at checkout.");
    };

    const handleRentNow = () => {
        if (!isAuthenticated) {
            toast.error(t('login_required') || "Please login to continue");
            return;
        }

        const directItem = {
            ...item,
            qty: quantity,
            totalPrice: item.price_per_day * quantity
        };

        navigate('/checkout', { state: { directItem } });
    };

    const maxQty = item.quantity !== undefined ? item.quantity : 5;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '20px',
                    padding: '10px 18px',
                    background: 'white',
                    border: '1px solid #eee',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#666',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                    zIndex: 10
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#1a1a1a'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
            >
                <FaArrowLeft /> Back to Home
            </button>

            <div style={{ marginTop: '50px' }}> {/* Space for the floating button */}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr', gap: '60px', alignItems: 'start' }}>

                {/* Left: Image & Availability */}
                <div>
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        border: '1px solid #eee',
                        marginBottom: '30px'
                    }}>
                        <img
                            src={`/HertiX/${item.image_url}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image'; }}
                        />
                    </div>

                    <div className="availability-calendar-container">
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a' }}>
                            <FaCalendarAlt /> Availability Check
                        </h3>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Calendar Section */}
                            <div style={{ flex: '1', minWidth: '260px' }}>
                                <Calendar
                                    value={null}
                                    tileDisabled={({ date }) => {
                                        // Disable past dates
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        if (date < now) return true;
                                        // Disable fully booked dates
                                        return isDateFullyBooked({ date });
                                    }}
                                    tileContent={({ date, view }) => {
                                        if (view !== 'month') return null;
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        if (date < now) return null;

                                        const dateStr = date.toLocaleDateString('en-CA');
                                        const occupancy = availabilityData.occupancy[dateStr] || 0;
                                        const recovery = availabilityData.recovery ? (availabilityData.recovery[dateStr] || 0) : 0;
                                        const left = availabilityData.total_quantity - occupancy;

                                        // 1. If stock is recovering (items returned + buffer ended today)
                                        if (recovery > 0) {
                                            return (
                                                <div className="availability-badge recovery" title={`${recovery} item(s) returned to stock today`}>
                                                    +{recovery}
                                                </div>
                                            );
                                        }

                                        // 2. If fully booked
                                        if (left <= 0) {
                                            return <div className="dot-indicator booked" title="Fully Booked"></div>;
                                        }

                                        // 3. If low stock, show 'X Left'
                                        if (left <= 2 && left < availabilityData.total_quantity) {
                                            return (
                                                <div className="availability-badge low-stock">
                                                    {left} Left
                                                </div>
                                            );
                                        }

                                        // 4. Otherwise (high stock), show nothing to keep it clean (removed "Available" badge)
                                        return null;
                                    }}
                                    className="react-calendar readonly"
                                    minDate={new Date()}
                                />

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.65rem', marginTop: '20px', justifyContent: 'center', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                                        <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }}></span> Booked
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                                        <span style={{ padding: '0 4px', background: '#f0fdf4', color: '#22c55e', border: '1px solid #dcfce7', borderRadius: '3px', fontWeight: 'bold' }}>+1</span> Stock Recovery
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                                        <span style={{ padding: '0 4px', background: '#fffbeb', color: '#f59e0b', border: '1px solid #fef3c7', borderRadius: '3px', fontWeight: 'bold' }}>1 Left</span> Low Stock
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b' }}>
                                        <span style={{ width: '8px', height: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '2px' }}></span> High Stock
                                    </span>
                                </div>
                            </div>

                            {/* Info Section Removed as per request */}
                        </div>
                    </div>
                </div>

                {/* Right: Info & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    <section>
                        <span style={{ background: '#eee', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {item.category} • {item.occasion}
                        </span>
                        <h1 style={{ fontSize: '2.5rem', margin: '15px 0 10px 0', fontFamily: 'serif' }}>{item.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{item.price_per_day}</span>
                            <span style={{ color: '#666' }}>per day</span>
                        </div>
                    </section>

                    <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <FaShieldAlt color="#0369a1" size={24} />
                        <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#0369a1' }}>Security Deposit: ₹{item.deposit_amount}</p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#0c4a6e' }}>Fully refundable upon safe return of the item.</p>
                        </div>
                    </div>

                    <section>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                            <FaInfoCircle color="#666" /> Description
                        </h3>
                        <p style={{ color: '#444', lineHeight: '1.6', fontSize: '1rem' }}>{item.description}</p>
                    </section>

                    <section style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                            padding: '24px',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', background: '#1a1a1a',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', color: 'white'
                                }}>
                                    <FaStore size={24} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a1a' }}>{item.shop_name}</p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaMapMarkerAlt size={12} color="#94a3b8" /> {item.shop_city} {item.shop_pincode ? `• ${item.shop_pincode}` : ''}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/shop/${item.owner_id}`}
                                style={{
                                    padding: '10px 24px',
                                    background: '#1a1a1a',
                                    borderRadius: '30px',
                                    textDecoration: 'none',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
                            >
                                Shop Profile
                            </Link>
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <section style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaCheckCircle /> Do's
                            </h4>
                            <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#166534', lineHeight: '1.5' }}>
                                {item.dos || item.guidance || 'Handle with care'}
                            </div>
                        </section>

                        <section style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaTimesCircle /> Don'ts
                            </h4>
                            <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#991b1b', lineHeight: '1.5' }}>
                                {item.donts || 'Do not damage or mishandle'}
                            </div>
                        </section>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '30px', marginTop: '10px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Availability: <span style={{ color: item.quantity > 0 ? '#15803d' : '#ef4444' }}>{item.quantity > 0 ? `${item.quantity} in stock` : 'Out of Stock'}</span></p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '15px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '8px 15px', borderRadius: '30px', border: '1px solid #eee' }}>
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        style={{ border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                    >
                                        <FaMinus size={12} />
                                    </button>
                                    <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center', fontSize: '1.1rem' }}>{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q < maxQty ? q + 1 : q)}
                                        style={{ border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                    >
                                        <FaPlus size={12} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={item.quantity === 0}
                                    style={{
                                        padding: '16px 20px',
                                        background: item.quantity > 0 ? 'white' : '#ccc',
                                        color: '#1a1a1a',
                                        border: item.quantity > 0 ? '2px solid #1a1a1a' : 'none',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { if (item.quantity > 0) e.currentTarget.style.background = '#f8f9fa'; }}
                                    onMouseOut={(e) => { if (item.quantity > 0) e.currentTarget.style.background = 'white'; }}
                                >
                                    <FaShoppingCart /> Add to Cart
                                </button>

                                <button
                                    onClick={handleRentNow}
                                    disabled={item.quantity === 0}
                                    style={{
                                        padding: '16px 30px',
                                        background: item.quantity > 0 ? '#1a1a1a' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'transform 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseOver={(e) => { if (item.quantity > 0) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseOut={(e) => { if (item.quantity > 0) e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <FaArrowLeft style={{ transform: 'rotate(180deg)' }} /> Rent Now
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ItemDetails;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchItems, fetchItemAvailability } from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarOverride.css';
import toast from 'react-hot-toast';
import { FaShoppingCart, FaCalendarAlt, FaInfoCircle, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaPlus, FaMinus, FaArrowLeft } from 'react-icons/fa';

const ItemDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([null, null]);
    const [pickupTime, setPickupTime] = useState('10:00');
    const [returnTime, setReturnTime] = useState('18:00');
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const items = await fetchItems();
                const foundItem = items.find(i => i.id == id);
                if (foundItem) {
                    setItem(foundItem);
                    const availability = await fetchItemAvailability(id);
                    setBookedDates(availability);
                }
            } catch (err) {
                console.error("Error loading item:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    useEffect(() => {
        if (item) {
            if (dateRange[0] && dateRange[1]) {
                const days = Math.ceil((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24)) + 1;
                setTotalPrice(days * item.price_per_day * quantity);
            } else {
                setTotalPrice(item.price_per_day * quantity);
            }
        }
    }, [dateRange, quantity, item]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Loading Item Details...</div>;
    if (!item) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Item not found</div>;

    const getAvailabilityForDate = (date) => {
        if (!date) return null;
        const day = date.getDay();
        // Demonstrate different availability: Afternoon only on Sundays (0)
        if (day === 0) return { open: "14:00", close: "20:00", label: "Afternoon Only" };
        if (day === 6) return { open: "10:00", close: "16:00", label: "Morning/Early Afternoon" };
        return { open: "09:00", close: "21:00", label: "Full Day" };
    };

    const isDateBooked = ({ date }) => {
        return bookedDates.some(booking => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            return date >= start && date <= end;
        });
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error(t('login_required') || "Please login to continue");
            return;
        }

        const cartItem = {
            ...item,
            startDate: dateRange[0] ? dateRange[0].toISOString() : null,
            endDate: dateRange[1] ? dateRange[1].toISOString() : null,
            totalPrice
        };

        addToCart(cartItem, quantity);
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
                            src={`/${item.image_url}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image'; }}
                        />
                    </div>

                    <div className="availability-calendar-container">
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a' }}>
                            <FaCalendarAlt /> Booking & Availability
                        </h3>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Calendar Section */}
                            <div style={{ flex: '1', minWidth: '260px' }}>
                                <Calendar
                                    onChange={(val) => {
                                        console.log("Date selected:", val);
                                        setDateRange(val);
                                    }}
                                    value={dateRange}
                                    selectRange={true}
                                    tileClassName={({ date }) => isDateBooked({ date }) ? 'booked-date' : null}
                                    className="react-calendar"
                                    minDate={new Date()}
                                    allowPartialRange={true}
                                />

                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem', marginTop: '15px', justifyContent: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></span> Booked
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ width: '10px', height: '10px', background: '#1a1a1a', borderRadius: '2px' }}></span> Selected
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ width: '10px', height: '10px', background: '#f8f9fa', borderRadius: '2px', border: '1px solid #eee' }}></span> Available
                                    </span>
                                </div>
                            </div>

                            {/* Info Section (Right Side) */}
                            <div style={{ flex: '0.8', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {dateRange[0] ? (
                                    <div style={{
                                        background: '#f0fdf4',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #dcfce7',
                                        boxShadow: '0 2px 8px rgba(22, 101, 52, 0.05)'
                                    }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#166534' }}>
                                            Selected Date
                                        </h4>
                                        <div style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: '500' }}>
                                            {dateRange[0].toLocaleDateString()}
                                            {dateRange[1] && ` - ${dateRange[1].toLocaleDateString()} `}
                                        </div>
                                        <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #dcfce7' }} />
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#166534' }}>
                                            <strong>{getAvailabilityForDate(dateRange[0]).label}</strong>
                                        </p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#15803d' }}>
                                            {getAvailabilityForDate(dateRange[0]).open} - {getAvailabilityForDate(dateRange[0]).close}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '30px 20px',
                                        background: '#f8fafc',
                                        borderRadius: '16px',
                                        border: '1px dashed #cbd5e1',
                                        textAlign: 'center',
                                        color: '#64748b'
                                    }}>
                                        <FaCalendarAlt size={30} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Please select a date on the calendar to see availability & timing</p>
                                    </div>
                                )}
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                                    * Note: Delivery & return must happen within the hours shown above.
                                </p>
                            </div>
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                                        flex: 1,
                                        padding: '16px 30px',
                                        background: item.quantity > 0 ? '#1a1a1a' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '30px',
                                        fontWeight: 'bold',
                                        cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FaShoppingCart /> Add to Cart
                                    </span>
                                    {totalPrice > 0 && (
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal', opacity: 0.9 }}>
                                            Total: ₹{totalPrice}
                                        </span>
                                    )}
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

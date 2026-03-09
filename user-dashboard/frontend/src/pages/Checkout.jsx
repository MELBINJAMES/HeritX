import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle, FaMobileAlt, FaUniversity, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarOverride.css';
import toast from '../utils/toast';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cartAvailability, setCartAvailability] = useState({}); // itemId => {total_quantity, occupancy}

    // Determine if we are checking out a single item (Rent Now) or the whole cart
    const directItem = location.state?.directItem;
    const checkoutItems = directItem ? [directItem] : cart;

    // Form and Selection State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const loadAvailability = async () => {
        const availability = {};
        for (const item of checkoutItems) {
            try {
                const API_URL = 'http://localhost/HertiX/user-dashboard/backend/api/items.php';
                const res = await fetch(`${API_URL}?action=availability&id=${item.id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    availability[item.id] = data;
                }
            } catch (err) {
                console.error("Failed to fetch availability for item", item.id, err);
            }
        }
        setCartAvailability(availability);
    };

    React.useEffect(() => {
        if (checkoutItems.length > 0) loadAvailability();
    }, [checkoutItems]);

    const isRangeAvailable = () => {
        if (!startDate || !endDate) return { available: true };
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Items are occupied from start_date to end_date + 1 (buffer)
        const checkEnd = new Date(end);
        checkEnd.setDate(checkEnd.getDate() + 1);

        for (const item of checkoutItems) {
            const avail = cartAvailability[item.id];
            if (!avail) continue;

            // CRITICAL: Check if the user requested more than the total absolute stock
            if (item.qty > avail.total_quantity) {
                return {
                    available: false,
                    itemName: item.name,
                    date: 'ALL dates',
                    reason: `Requested ${item.qty} units but only ${avail.total_quantity} exist in total physical stock.`
                };
            }

            const tempDate = new Date(start);
            while (tempDate <= checkEnd) {
                const dateStr = tempDate.toLocaleDateString('en-CA');
                const occupancy = avail.occupancy[dateStr] || 0;
                // If the user wants to book 'item.qty' units, check if we have enough
                if (occupancy + item.qty > avail.total_quantity) {
                    return { available: false, itemName: item.name, date: dateStr };
                }
                tempDate.setDate(tempDate.getDate() + 1);
            }
        }
        return { available: true };
    };

    const handleCalendarChange = (value) => {
        if (Array.isArray(value)) {
            const [start, end] = value;
            if (start) setStartDate(start.toISOString().split('T')[0]);
            if (end) setEndDate(end.toISOString().split('T')[0]);
            else setEndDate('');
        }
    };

    const isDateFullyBooked = (date) => {
        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD local
        for (const item of checkoutItems) {
            const avail = cartAvailability[item.id];
            if (!avail) continue;
            const occupancy = avail.occupancy[dateStr] || 0;
            // If the user wants to book 'item.qty' units, check if we have enough
            if (occupancy + item.qty > avail.total_quantity) return true;
        }
        return false;
    };

    const getCombinedStockInfo = (date) => {
        const dateStr = date.toLocaleDateString('en-CA');
        let minLeft = Infinity;
        let totalRecovery = 0;
        let totalQuantity = 0;
        let anyItemUnloaded = false;

        for (const item of checkoutItems) {
            const avail = cartAvailability[item.id];
            if (!avail) {
                anyItemUnloaded = true;
                continue;
            }
            const occupancy = avail.occupancy[dateStr] || 0;
            const recovery = avail.recovery ? (avail.recovery[dateStr] || 0) : 0;
            const left = avail.total_quantity - occupancy;

            if (left < minLeft) minLeft = left;
            totalRecovery += recovery;
            totalQuantity += avail.total_quantity;
        }

        if (anyItemUnloaded && minLeft === Infinity) return null;
        return { minLeft, totalRecovery, totalQuantity };
    };

    const availabilityResult = isRangeAvailable();
    const calculateDuration = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
    };

    const duration = calculateDuration();

    const [paymentMethod, setPaymentMethod] = useState('online'); // Default to new online option
    const [deliveryMethod] = useState('pickup');

    // Delivery & Contact State
    const [phone, setPhone] = useState(user?.phone || '');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [city, setCity] = useState(user?.location || '');
    const [pincode, setPincode] = useState('');

    // Sync from user context if it updates (e.g. they just came from Profile)
    React.useEffect(() => {
        if (user) {
            if (!phone && user.phone) setPhone(user.phone);
            if (!city && user.location) setCity(user.location);
        }
    }, [user]);

    const calculateTotal = () => {
        if (duration === 0) return 0;
        return checkoutItems.reduce((total, item) => {
            return total + (item.price_per_day * item.qty * duration);
        }, 0);
    };

    const calculateDiscount = () => {
        if (duration === 0) return 0;
        const now = new Date();
        return checkoutItems.reduce((totalDiscount, item) => {
            const hasActiveOffer = item.offer_start && item.offer_end &&
                new Date(item.offer_start) <= now && new Date(item.offer_end) >= now;

            if (hasActiveOffer && item.offer_discount_percent > 0) {
                const itemTotal = item.price_per_day * item.qty * duration;
                return totalDiscount + (itemTotal * (item.offer_discount_percent / 100));
            }
            return totalDiscount;
        }, 0);
    };

    const totalRent = calculateTotal();
    const totalDiscount = calculateDiscount();
    const depositAmount = checkoutItems.reduce((total, item) => total + (item.deposit_amount || 0) * item.qty, 0); // Mock deposit if not in cart item, assuming 0 or add mock property
    // Actually items table has deposit_amount. Let's assume it's passed in cart item.
    // If cart item doesn't have it, we default to 0. 
    // Wait, cart items from localStorage might not have all fields if not added. ItemDetails adds it?
    // ItemDetails adds ...item. So it should have deposit_amount.

    // Pickup Time State
    const [pickupStartTime, setPickupStartTime] = useState('');
    const [pickupEndTime, setPickupEndTime] = useState('');
    const pickupTime = (pickupStartTime && pickupEndTime) ? `${pickupStartTime} - ${pickupEndTime}` : ''; // Derived

    // Delivery Fee State
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [deliveryDistance, setDeliveryDistance] = useState(0);
    const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

    // Reset fee when toggling methods
    const handleDeliveryMethodChange = (method) => {
        setDeliveryMethod(method);
        if (method === 'pickup') {
            setDeliveryFee(0);
            setDeliveryDistance(0);
        }
    };

    // Use state instead of hardcoded
    const deliveryCharge = deliveryMethod === 'delivery' ? (deliveryFee > 0 ? deliveryFee : (deliveryDistance ? 0 : 0)) : 0;

    const handleCalculateDelivery = async () => {
        if (!deliveryAddress || !city || !pincode) {
            toast.error("Please fill in complete address first.");
            return;
        }

        setIsCalculatingDelivery(true);
        try {
            // Use the first item to determine the shop location
            const itemId = checkoutItems.length > 0 ? checkoutItems[0].id : 0;
            const fullAddress = `${deliveryAddress}, ${city}, ${pincode}`;

            const res = await fetch('http://localhost/HertiX/admin/public/api/calculate_delivery.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_id: itemId,
                    user_address: fullAddress
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                setDeliveryFee(data.delivery_fee);
                setDeliveryDistance(data.distance_km);
                toast.success(`Delivery Fee: ₹${data.delivery_fee} (${data.distance_km} km)`);
            } else {
                setDeliveryFee(150); // Fallback
                toast.error(data.message || "Could not calculate fee. Using standard rate.");
            }
        } catch (error) {
            console.error("Delivery Calc Error:", error);
            setDeliveryFee(150); // Fallback
            toast.error("Calculation failed. Using standard rate.");
        } finally {
            setIsCalculatingDelivery(false);
        }
    };

    const totalPayable = totalRent - totalDiscount + depositAmount + deliveryCharge;

    const validatePaymentForm = () => {
        // Contact Validation
        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid 10-digit phone number.");
            return false;
        }
        return true;
    };


    const handlePayment = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select a rental period.");
            return;
        }

        if (duration <= 0) {
            toast.error("Invalid rental period.");
            return;
        }

        if (!availabilityResult.available) {
            toast.error(`Unavailable: ${availabilityResult.itemName} is booked on ${availabilityResult.date}.`);
            return;
        }

        if (!validatePaymentForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            if (!user || !user.id) {
                toast.error("Please login to proceed.");
                navigate('/login');
                return;
            }

            const payload = {
                user_id: user.id,
                cart: checkoutItems, // Pass full logic for Razorpay verification
                start_date: startDate,
                end_date: endDate,
                duration: duration,
                payment_method: paymentMethod,
                amount: totalPayable, // total_amount
                total_discount: totalDiscount,
                delivery_method: deliveryMethod,
                delivery_fee: deliveryCharge,
                delivery_distance: deliveryDistance,
                // Contact Info
                phone: phone,
                address: deliveryAddress, // payment_verify expects 'address'
                delivery_address: deliveryAddress, // rentals.php might expect this
                city: city,
                pincode: pincode,
                contact_number: phone, // payment_verify expects this
                pickup_time: pickupTime
            };

            if (paymentMethod === 'cod' || paymentMethod === 'pickup') {
                // Legacy Flow for Offline Payment
                const response = await fetch('http://localhost/HertiX/user-dashboard/backend/api/rentals.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    // Success for Offline
                    const successMsg = deliveryMethod === 'pickup'
                        ? "Order placed successfully! Thank you."
                        : "Your order has been placed successfully!";

                    setTimeout(() => {
                        clearCart();
                        setIsProcessing(false);
                        navigate('/payment-success', {
                            state: {
                                orderIds: result.order_ids || [],
                                totalAmount: totalPayable,
                                message: successMsg,
                                contactInfo: {
                                    deliveryMethod,
                                    phone,
                                    deliveryAddress,
                                    city,
                                    pincode
                                },
                                totalDiscount: totalDiscount
                            }
                        });
                    }, 1000);
                } else {
                    throw new Error(result.message || "Order Failed");
                }
            } else {
                // RAZORPAY FLOW
                // 1. Create Order
                const orderRes = await fetch('http://localhost/HertiX/user-dashboard/backend/api/payment_create_order.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: totalPayable })
                });
                const orderData = await orderRes.json();

                if (orderData.status !== 'success') {
                    throw new Error(orderData.message || "Could not initiate payment");
                }

                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: "INR",
                    name: "HeritX Rentals",
                    description: "Rental Deposit & Fee",
                    image: "https://your-logo-url.com/logo.png", // Optional
                    order_id: orderData.order_id,
                    handler: async function (response) {
                        try {
                            const verifyPayload = {
                                ...payload,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            };

                            const verifyRes = await fetch('http://localhost/HertiX/user-dashboard/backend/api/payment_verify.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(verifyPayload)
                            });
                            const verifyData = await verifyRes.json();

                            if (verifyData.status === 'success') {
                                toast.success("Payment Successful!");
                                clearCart();
                                navigate('/payment-success', {
                                    state: {
                                        totalAmount: totalPayable,
                                        paymentId: response.razorpay_payment_id,
                                        message: "Payment Received! Your order is confirmed.",
                                        contactInfo: {
                                            deliveryMethod,
                                            phone,
                                            deliveryAddress,
                                            city,
                                            pincode
                                        }
                                    }
                                });
                            } else {
                                toast.error("Payment verification failed: " + verifyData.message);
                            }
                        } catch (err) {
                            console.error(err);
                            toast.error("Error verifying payment");
                        }
                    },
                    prefill: {
                        name: user.name || "",
                        email: user.email || "user@example.com",
                        contact: phone || user.phone || ""
                    },
                    theme: {
                        color: "#1a1a1a"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    toast.error("Payment Failed: " + response.error.description);
                    setIsProcessing(false);
                });
                rzp1.open();
                setIsProcessing(false); // Modal is open, stop loader
            }

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            toast.error(error.message || "Something went wrong. Try again.");
        }
    };

    if (checkoutItems.length === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center', padding: '40px' }}>
                <h2>Your checkout is empty</h2>
                <Link to="/browse" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Browse Items</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', marginBottom: '20px' }}>
                <FaArrowLeft /> Back to Cart
            </Link>

            <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '30px', color: '#1a1a1a' }}>Secure Payment</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '40px' }}>

                {/* LEFT COLUMN: Rental Period & Payment Methods */}
                <div>
                    {/* 1. Rental Period */}
                    <section style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eef2f6', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            1. Select Rental Period
                        </h3>
                        <div style={{ marginBottom: '25px', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaCalendarAlt /> SELECT YOUR RANGE ON THE CALENDAR
                            </div>
                            <div className="checkout-calendar-wrapper">
                                <Calendar
                                    selectRange={true}
                                    onChange={handleCalendarChange}
                                    tileDisabled={({ date }) => {
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        return date < now || isDateFullyBooked(date);
                                    }}
                                    tileContent={({ date, view }) => {
                                        if (view !== 'month') return null;
                                        const now = new Date();
                                        now.setHours(0, 0, 0, 0);
                                        if (date < now) return null;

                                        const info = getCombinedStockInfo(date);
                                        if (!info) return null;

                                        // 1. If stock is recovering for some items
                                        if (info.totalRecovery > 0) {
                                            return <div className="availability-badge recovery">+{info.totalRecovery}</div>;
                                        }

                                        // 2. If blocked for any item
                                        if (isDateFullyBooked(date)) {
                                            return <div className="dot-indicator booked"></div>;
                                        }

                                        // 3. If low stock (any item has only 1-2 left)
                                        if (info.minLeft > 0 && info.minLeft <= 2) {
                                            return <div className="availability-badge low-stock">{info.minLeft} Left</div>;
                                        }

                                        return null;
                                    }}
                                    value={(startDate && endDate) ? [new Date(startDate), new Date(endDate)] : (startDate ? new Date(startDate) : null)}
                                    className="react-calendar readonly"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', fontSize: '0.65rem', color: '#64748b' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#f1f5f9', borderRadius: '50%', border: '1px solid #e2e8f0' }}></span> Available
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#fee2e2', borderRadius: '50%', border: '1px solid #fca5a5' }}></span> Full for some items
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444', fontSize: '0.9rem' }}>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444', fontSize: '0.9rem' }}>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '0.95rem' }}
                                />
                            </div>
                        </div>
                        {duration > 0 && (
                            <div style={{ marginTop: '15px', padding: '12px', background: availabilityResult.available ? '#f0fdf4' : '#fef2f2', color: availabilityResult.available ? '#15803d' : '#b91c1c', borderRadius: '8px', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem', border: `1px solid ${availabilityResult.available ? '#dcfce7' : '#fee2e2'}` }}>
                                {availabilityResult.available ? (
                                    `Rental Duration: ${duration} Days`
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span>⚠️ Dates Unavailable</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                                            {availabilityResult.reason || `${availabilityResult.itemName} is out of stock on ${availabilityResult.date} (buffer day included).`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>


                    {/* 4. Contact & Details */}
                    <section style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eef2f6', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>2. Contact Details</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666', fontSize: '0.9rem' }}>
                                    WhatsApp / Phone <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '1rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#666', fontSize: '0.9rem' }}>
                                    Email Address (for receipts)
                                </label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ''}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f9', color: '#666', fontFamily: 'inherit', fontSize: '1rem', cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                    </section>


                    {/* 3. Payment Method */}
                    <section style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eef2f6', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            3. Select Payment Method
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                            {/* Pay Online Option */}
                            <label style={{
                                display: 'block', padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                border: paymentMethod === 'online' ? '2px solid #1a1a1a' : '1px solid #e2e8f0',
                                background: paymentMethod === 'online' ? '#f8fafc' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="online"
                                        checked={paymentMethod === 'online' || paymentMethod === 'card' || paymentMethod === 'upi' || paymentMethod === 'netbanking'}
                                        onChange={() => setPaymentMethod('online')}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <FaLock size={20} color="#16a34a" />
                                        <div>
                                            <span style={{ fontWeight: '600', color: '#334155', display: 'block' }}>Pay Online Securely</span>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>UPI, Credit/Debit Cards, Netbanking via Razorpay</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <FaMobileAlt size={20} color="#94a3b8" />
                                        <FaCreditCard size={20} color="#94a3b8" />
                                        <FaUniversity size={20} color="#94a3b8" />
                                    </div>
                                </div>
                            </label>

                            {/* Pay on Pickup / COD Option */}
                            <label style={{
                                display: 'block', padding: '15px', borderRadius: '10px', cursor: 'pointer',
                                border: paymentMethod === 'cod' ? '2px solid #1a1a1a' : '1px solid #e2e8f0',
                                background: paymentMethod === 'cod' ? '#f8fafc' : 'white',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <FaMoneyBillWave size={20} color="#475569" />
                                        <span style={{ fontWeight: '600', color: '#334155' }}>
                                            {deliveryMethod === 'pickup' ? 'Pay on Pickup' : 'Cash on Delivery'}
                                        </span>
                                    </div>
                                </div>
                                {paymentMethod === 'cod' && (
                                    <div style={{ paddingLeft: '35px', marginTop: '10px', color: '#64748b', fontSize: '0.9rem', animation: 'fadeIn 0.3s' }}>
                                        {deliveryMethod === 'pickup'
                                            ? "Please pay at the store when you pick up your items."
                                            : "Pay cash when the item is delivered to your doorstep."}
                                    </div>
                                )}
                            </label>

                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Order Summary */}
                <div>
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '16px', position: 'sticky', top: '100px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b' }}>Order Summary</h3>

                        {/* Items List */}
                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
                            {checkoutItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px dashed #cbd5e1' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={`http://localhost/HertiX/${item.image_url}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            Quantity: {item.qty} <br />
                                            Rate: ₹{item.price_per_day} / day
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>
                                        ₹{item.price_per_day * item.qty * (duration || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                                <span>Total Rent</span>
                                <span>₹{totalRent}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#16a34a', fontWeight: 'bold' }}>
                                    <span>Discount Applied</span>
                                    <span>-₹{totalDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                                <span>Security Deposit (Refundable)</span>
                                <span>₹{depositAmount}</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '2px dashed #cbd5e1', margin: '15px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>Total Payable</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1a1a1a' }}>₹{totalPayable}</span>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || duration === 0}
                            style={{
                                width: '100%', padding: '16px',
                                background: (isProcessing || duration === 0) ? '#94a3b8' : '#1a1a1a',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '1rem', fontWeight: 'bold',
                                cursor: (isProcessing || duration === 0) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'background 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            {isProcessing ? 'Processing Payment...' : (
                                paymentMethod === 'cod' ? 'Proceed to Order' : (
                                    <>
                                        <FaLock size={14} /> Pay ₹{totalPayable} Now
                                    </>
                                )
                            )}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '15px', color: '#64748b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <FaCheckCircle size={12} color="#16a34a" /> 100% Secure SSL Payment
                        </div>

                        <div style={{ marginTop: '20px', padding: '10px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <FaLock size={10} style={{ marginRight: '5px' }} />
                            Payments are processed securely via encrypted gateways.
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Checkout;

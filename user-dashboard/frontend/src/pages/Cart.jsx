import React from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaPlus, FaMinus, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cart, addToCart, decrementQty, removeFromCart, clearCart, cartCount } = useCart();
    const { t } = useLanguage();

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            // Use duration-based total if available, otherwise fallback to unit price * qty
            const itemTotal = item.totalPrice || (item.price_per_day * item.qty);
            return total + itemTotal;
        }, 0);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontFamily: 'serif', fontSize: '2.5rem', marginBottom: '30px', color: '#1a1a1a' }}>
                Shopping Cart ({cartCount})
            </h1>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Your cart is empty.</p>
                    <Link to="/browse" style={{
                        padding: '12px 25px', background: '#1a1a1a', color: 'white',
                        textDecoration: 'none', borderRadius: '25px', fontWeight: 'bold'
                    }}>
                        Browse Items
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    {/* Cart Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{
                                display: 'flex', gap: '20px', background: 'white',
                                padding: '20px', borderRadius: '12px', border: '1px solid #eee'
                            }}>
                                <Link to={`/item/${item.id}`} style={{ display: 'block' }}>
                                    <div style={{ width: '100px', height: '100px', background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={`/${item.image_url}`}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                                        />
                                    </div>
                                </Link>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/item/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{item.name}</h3>
                                    </Link>
                                    <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem' }}>{item.category}</p>

                                    {item.startDate && (
                                        <div style={{ margin: '8px 0', fontSize: '0.85rem', color: '#166534', background: '#f0fdf4', padding: '4px 10px', borderRadius: '4px', width: 'fit-content' }}>
                                            <strong>Booking:</strong> {new Date(item.startDate).toLocaleDateString()}
                                            {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>
                                                ₹{item.totalPrice ? (item.totalPrice / item.qty) : item.price_per_day}
                                                <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666' }}>
                                                    {item.startDate ? ' / duration' : ' / day'}
                                                </span>
                                            </p>
                                            {item.qty > 1 && <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>Subtotal: ₹{item.totalPrice || (item.price_per_day * item.qty)}</p>}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            {/* Quantity Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8f9fa', padding: '5px 10px', borderRadius: '8px' }}>
                                                <button
                                                    onClick={() => decrementQty(item.id)}
                                                    style={{ border: 'none', background: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                                                <button
                                                    onClick={() => addToCart(item, 1, false)} // Match new signature: item, qty, showAlert
                                                    style={{ border: 'none', background: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>

                                            <Link to={`/item/${item.id}`} style={{ border: 'none', background: 'none', color: '#1a1a1a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }} title="View Details">
                                                <FaEye />
                                            </Link>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={clearCart}
                            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', textDecoration: 'underline', color: '#666', cursor: 'pointer' }}
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', height: 'fit-content' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: '#666' }}>Items Total</span>
                            <span style={{ fontWeight: 'bold' }}>₹{calculateTotal()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ color: '#666' }}>Estimated Tax</span>
                            <span style={{ fontWeight: 'bold' }}>₹0</span>
                        </div>
                        <div style={{ borderTop: '1px solid #ddd', margin: '15px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '1.2rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Total</span>
                            <span style={{ fontWeight: 'bold' }}>₹{calculateTotal()}</span>
                        </div>
                        <Link to="/checkout" style={{ textDecoration: 'none' }}>
                            <button
                                style={{
                                    width: '100%', padding: '15px', background: '#1a1a1a', color: 'white',
                                    border: 'none', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                Proceed to Checkout <FaArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;

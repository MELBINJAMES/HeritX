import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from '../utils/toast';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Derive the storage key based on current user
    const cartKey = useMemo(() => {
        return user?.id ? `hertix_cart_${user.id}` : 'hertix_cart_guest';
    }, [user?.id]);

    const [cart, setCart] = useState([]);

    // Load cart whenever the cartKey changes (on login/logout)
    useEffect(() => {
        const savedCart = localStorage.getItem(cartKey);
        setCart(savedCart ? JSON.parse(savedCart) : []);
    }, [cartKey]);

    // Save cart whenever it changes, specifically for the current cartKey
    useEffect(() => {
        if (cartKey) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
    }, [cart, cartKey]);

    const addToCart = (item, requestedQty = 1, showAlert = true) => {
        let isAvailable = true;

        setCart(prevCart => {
            const existing = prevCart.find(i => i.id === item.id);
            const currentQty = existing ? existing.qty : 0;
            const totalRequested = currentQty + requestedQty;
            const stock = item.quantity !== undefined ? item.quantity : 5; // Fallback stock

            if (totalRequested > stock) {
                isAvailable = false;
                return prevCart;
            }

            if (existing) {
                return prevCart.map(i =>
                    i.id === item.id ? { ...i, qty: totalRequested } : i
                );
            }
            return [...prevCart, { ...item, qty: requestedQty }];
        });

        if (!isAvailable) {
            toast.error(t('stock_exceeded') || "Not enough stock available!");
            return false;
        }

        if (showAlert) toast.success(t('added_to_cart') || "Item added to cart!");
        return true;
    };

    const updateQty = (itemId, newQty, stock) => {
        if (newQty > stock) {
            toast.error(t('stock_exceeded'));
            return false;
        }
        setCart(prev => prev.map(item =>
            item.id === itemId ? { ...item, qty: Math.max(1, newQty) } : item
        ));
        return true;
    };

    const decrementQty = (itemId) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === itemId) {
                    return { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 };
                }
                return item;
            });
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, decrementQty, removeFromCart, clearCart, cartCount, updateQty }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined || context === null) {
        // Return a dummy object to prevent destructuring crashes
        // and log it for easier debugging.
        console.error("useCart must be used within a CartProvider");
        return {
            cart: [],
            addToCart: () => { },
            decrementQty: () => { },
            removeFromCart: () => { },
            clearCart: () => { },
            cartCount: 0,
            updateQty: () => { }
        };
    }
    return context;
};

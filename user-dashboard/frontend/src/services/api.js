const API_BASE_URL = 'http://localhost/HertiX/user-dashboard/backend/api';
const PAYMENTS_API_URL = 'http://localhost/HertiX/user-dashboard/payments/backend/payments.php';

export const fetchItems = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.occasion) queryParams.append('occasion', params.occasion);
        if (params.city) queryParams.append('city', params.city);
        if (params.pincode) queryParams.append('pincode', params.pincode);
        if (params.id) queryParams.append('id', params.id);

        const url = `${API_BASE_URL}/items.php${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url);
        const data = await response.json();

        // Return data if it exists, otherwise return mocks
        if (data && data.length > 0) return data;
        throw new Error("Empty data");
    } catch (error) {
        console.error("Failed to fetch items:", error);
        return [];
    }
};

export const fetchDashboardSummary = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rentals.php?action=summary&user_id=${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch summary", error);
        return { active_rentals: 0, pending_returns: 0, upcoming_bookings: 0, total_deposit_paid: 0 };
    }
};

export const fetchMyRentals = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rentals.php?user_id=${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch rentals", error);
        return [];
    }
};

export const fetchPayments = async (userId) => {
    try {
        const response = await fetch(`${PAYMENTS_API_URL}?user_id=${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch payments", error);
        return { summary: {}, history: [] };
    }
};

export const fetchProfile = async (userId) => {
    try {
        const url = userId ? `${API_BASE_URL}/profile.php?user_id=${userId}` : `${API_BASE_URL}/profile.php`;
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch profile", error);
        return null; // Handle null in UI
    }
};

export const fetchWishlist = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist.php?user_id=${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch wishlist", error);
        return [];
    }
};

export const toggleWishlist = async (userId, itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/wishlist.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, item_id: itemId })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to toggle wishlist", error);
        return { status: 'error' };
    }
};

export const fetchNotifications = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications.php?user_id=${userId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch notifications", error);
        return [];
    }
};

export const markNotificationRead = async (id) => {
    try {
        await fetch(`${API_BASE_URL}/notifications.php?action=mark_read`, {
            method: 'POST',
            body: JSON.stringify({ id })
        });
        return { status: 'success' };
    } catch (error) {
        return { status: 'error' };
    }
};

export const fetchItemAvailability = async (itemId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/items.php?action=availability&id=${itemId}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch availability", error);
        return [];
    }
};

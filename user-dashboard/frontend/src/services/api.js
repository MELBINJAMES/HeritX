const API_BASE_URL = 'http://localhost/HertiX/user-dashboard/backend/api';
const PAYMENTS_API_URL = 'http://localhost/HertiX/user-dashboard/payments/backend/payments.php';

export const fetchItems = async (occasion = '') => {
    try {
        const url = occasion
            ? `${API_BASE_URL}/items.php?occasion=${occasion}`
            : `${API_BASE_URL}/items.php`;
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

export const fetchDashboardSummary = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rentals.php?action=summary`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch summary", error);
        return { active_rentals: 0, pending_returns: 0, upcoming_bookings: 0, total_deposit_paid: 0 };
    }
};

export const fetchMyRentals = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rentals.php`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch rentals", error);
        return [];
    }
};

export const fetchPayments = async () => {
    try {
        const response = await fetch(PAYMENTS_API_URL);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch payments", error);
        return { summary: {}, history: [] };
    }
};

export const fetchProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/profile.php`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch profile", error);
        return null; // Handle null in UI
    }
};

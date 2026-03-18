import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Try unified key first (shared with admin app), then fallback to legacy key
        const storedUser = localStorage.getItem('hertix_user') || localStorage.getItem('finder_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.id) {
                    setUser(parsedUser);
                    // Migrate legacy key to unified key if needed
                    if (!localStorage.getItem('hertix_user')) {
                        localStorage.setItem('hertix_user', storedUser);
                        localStorage.removeItem('finder_user');
                    }
                } else {
                    localStorage.removeItem('finder_user');
                    localStorage.removeItem('hertix_user');
                }
            } catch (err) {
                console.error('Failed to parse user session', err);
                localStorage.removeItem('finder_user');
                localStorage.removeItem('hertix_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        // Write to unified key so both apps share the session
        localStorage.setItem('hertix_user', JSON.stringify(userData));
        localStorage.removeItem('finder_user'); // remove legacy key
    };

    const updateUser = (newData) => {
        setUser(prev => {
            const updated = { ...prev, ...newData };
            localStorage.setItem('hertix_user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hertix_user');
        localStorage.removeItem('finder_user');
        window.location.href = '/HertiX/';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// @ts-nocheck
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'Shop Owner' | 'Finder' | 'admin';
};

type AuthContextType = {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount - uses unified key shared with user-dashboard
    useEffect(() => {
        const storedUser = localStorage.getItem('hertix_user') || localStorage.getItem('finder_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.id) {
                    setUser(parsedUser);
                    // Migrate legacy key if needed
                    if (!localStorage.getItem('hertix_user')) {
                        localStorage.setItem('hertix_user', storedUser);
                        localStorage.removeItem('finder_user');
                    }
                } else {
                    console.warn('Invalid user session found. Clearing.');
                    localStorage.removeItem('hertix_user');
                    localStorage.removeItem('finder_user');
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to parse stored user', error);
                localStorage.removeItem('hertix_user');
                localStorage.removeItem('finder_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('hertix_user', JSON.stringify(userData));
        localStorage.removeItem('finder_user'); // clean up legacy key
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('hertix_user');
        localStorage.removeItem('finder_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

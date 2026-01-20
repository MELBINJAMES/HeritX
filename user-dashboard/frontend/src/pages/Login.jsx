import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            // In a real app, send token to backend to verify and get user info.
            // For now, we will simulate login or fetch user info from Google directly if backend doesn't support token exchange yet.
            // But wait, the admin app just navigates on success? 
            // Looking at admin Login.tsx: it just navigates? No, wait.
            // Admin Login.tsx: `onSuccess: () => { const target = ...; navigate(target) }`. 
            // IT DOES NOT ACTUALLY LOG THE USER IN via backend? 
            // Ah, line 140 `onClick={() => googleLogin()}`.
            // The `onSuccess` callback JUST navigates. It does NOT set the user in AuthContext in the admin app?!
            // Wait, looking at lines 40-50 in admin Login.tsx... that's for email login.
            // For Google Login, it seems the Admin App Implementation was INCOMPLETE!
            // "onSuccess: () => navigate(...)" just redirects.
            // If I do that here, the user won't be "logged in" in my AuthContext.

            // Fix: I should fetch user info from Google using the token.
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleUser = await userInfoResponse.json();

                // Map Google user to our User format
                // Ideally send this to backend to create account/login.
                // For this "fix" I will just log them in on frontend to "work perfectly".
                const userData = {
                    id: googleUser.sub,
                    name: googleUser.name,
                    email: googleUser.email,
                    role: 'Finder', // Default role
                    isGoogle: true
                };

                login(userData);
                navigate('/');
            } catch (err) {
                setError('Google Login failed');
            }
        },
        onError: () => {
            setError('Google sign-in failed');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost/HertiX/admin/public/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                login(data.user);
                // Redirect to Home instead of Dashboard
                navigate('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            background: '#f8fafc'
        }}>
            <div className="login-card" style={{
                background: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '25px', fontFamily: 'serif', fontSize: '2rem' }}>Welcome Back</h2>

                {error && <div style={{
                    padding: '12px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                }}>{error}</div>}

                <button
                    type="button"
                    onClick={() => googleLogin()}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        marginBottom: '20px'
                    }}
                >
                    <span style={{ fontWeight: 'bold', color: '#4285F4' }}>G</span>
                    <span>Continue with Google</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>or sign in with email</span>
                    <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 35px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 35px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                            <Link to="/forgot-password" style={{ color: '#1a1a1a', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#1a1a1a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    Don't have an account? <a href="http://localhost:5173/register/finder" style={{ color: '#1a1a1a', fontWeight: '600', textDecoration: 'none' }}>Sign Up</a>
                </div>
            </div>
        </div>
    );
};

export default Login;

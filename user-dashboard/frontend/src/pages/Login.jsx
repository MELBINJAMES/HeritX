import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';

import '../styles/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Send access token to backend for verification and login/registration
                const res = await fetch('/HertiX/admin/public/api/google_login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: tokenResponse.access_token,
                        required_role: 'Finder'
                    }),
                });

                const data = await res.json();

                if (data.status === 'success') {
                    login(data.user);
                    navigate('/');
                } else {
                    setError(data.message || 'Google Login failed');
                }
            } catch (err) {
                console.error("Google Login Error:", err);
                setError('Connection to server failed');
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
            const response = await fetch('/HertiX/admin/public/api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, required_role: 'Finder' }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                login(data.user);

                // Role Based Redirect
                if (data.user.role === 'admin' || data.user.role === 'Shop Owner') {
                    window.location.href = '/HertiX/admin/';
                    return;
                }

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
        <div className="user-auth-page">
            <div className="login-card-wow">
                <h2>Welcome Back</h2>

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
                    className="google-btn-wow"
                    onClick={() => googleLogin()}
                >
                    <span className="google-icon-svg">
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.834.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                            <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.589.102-1.166.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                    </span>
                    <span>Continue with Google</span>
                </button>

                <div className="divider-wow">
                    <span>or sign in with email</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group-wow">
                        <label className="input-label-wow">Email</label>
                        <input
                            type="email"
                            className="input-field-wow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="input-group-wow">
                        <label className="input-label-wow">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-field-wow"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <Link to="/forgot-password" style={{ color: '#1a1a1a', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="signin-btn-wow"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    Don't have an account? <Link to="/signup" style={{ color: '#1a1a1a', fontWeight: '700', textDecoration: 'none' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

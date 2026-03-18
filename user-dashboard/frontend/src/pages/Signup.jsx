import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
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
                    setError(data.message || 'Google signup failed');
                }
            } catch (err) {
                console.error("Google Signup Error:", err);
                setError('Connection to server failed');
            }
        },
        onError: () => {
            setError('Google signup failed');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', 'Finder');
            formData.append('shop_phone', phone);
            formData.append('shop_city', city);

            const response = await fetch('/HertiX/admin/public/api/register.php', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.status === 'success') {
                const loginRes = await fetch('/HertiX/admin/public/api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, required_role: 'Finder' }),
                });
                const loginData = await loginRes.json();
                if (loginData.status === 'success') {
                    login(loginData.user);
                    navigate('/');
                } else {
                    navigate('/login');
                }
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-auth-page">
            <div className="login-card-wow" style={{ maxWidth: '540px' }}>
                <h2>Create Account</h2>

                {error && <div style={{
                    padding: '12px',
                    background: '#fff1f2',
                    color: '#e11d48',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    fontWeight: '600'
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
                    <span>or sign up with email</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group-wow">
                            <label className="input-label-wow">Full Name</label>
                            <input
                                type="text"
                                className="input-field-wow"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Asha Nair"
                                required
                            />
                        </div>

                        <div className="input-group-wow">
                            <label className="input-label-wow">Email</label>
                            <input
                                type="email"
                                className="input-field-wow"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="asha@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group-wow">
                            <label className="input-label-wow">Phone</label>
                            <input
                                type="tel"
                                className="input-field-wow"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91..."
                                required
                            />
                        </div>

                        <div className="input-group-wow">
                            <label className="input-label-wow">City</label>
                            <input
                                type="text"
                                className="input-field-wow"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g. Cochin"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="input-group-wow">
                            <label className="input-label-wow">Password</label>
                            <input
                                type="password"
                                className="input-field-wow"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="input-group-wow">
                            <label className="input-label-wow">Confirm</label>
                            <input
                                type="password"
                                className="input-field-wow"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="signin-btn-wow"
                    >
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                    Already have an account? <Link to="/login" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaChevronLeft } from 'react-icons/fa';

const ForgotPassword = () => {
    // Steps: 'email', 'otp', 'reset'
    const [step, setStep] = useState('email');

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const navigate = useNavigate();

    // API Base URL - reusing the Admin APIs which handle user tables too
    const API_BASE = 'http://localhost/HertiX/admin/public/api';

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/forgot_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (data.status === 'success') {
                setStep('otp');
                setSuccessMessage('Code sent! Check your email.');
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setError(data.message || 'Failed to send code. Status: ' + response.status);
            }
        } catch (err) {
            console.error(err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/verify_otp.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();

            if (data.status === 'success') {
                setStep('reset');
                setError('');
            } else {
                setError(data.message || 'Invalid code');
            }
        } catch (err) {
            console.error(err);
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
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
            const response = await fetch(`${API_BASE}/reset_password.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });
            const data = await response.json();

            if (data.status === 'success') {
                setShowSuccessPopup(true);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err) {
            console.error(err);
            setError('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    if (showSuccessPopup) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex',
                justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{
                    background: 'white', padding: '40px', borderRadius: '16px',
                    textAlign: 'center', maxWidth: '400px', width: '90%',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                    <div style={{
                        width: '80px', height: '80px', background: '#ecfdf5',
                        color: '#10b981', borderRadius: '50%', margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem'
                    }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#1a1a1a' }}>Password Changed!</h2>
                    <p style={{ color: '#64748b', marginBottom: '25px' }}>
                        Your password has been updated successfully. You can now login with your new password.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            width: '100%', padding: '14px', background: '#1a1a1a', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh', // Changed to 100vh to cover full screen
            background: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid #f1f5f9'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: '#f0f9ff', color: '#0284c7',
                        borderRadius: '50%', margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        {step === 'email' && <FaEnvelope />}
                        {step === 'otp' && <FaKey />}
                        {step === 'reset' && <FaLock />}
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
                        {step === 'email' && 'Forgot Password?'}
                        {step === 'otp' && 'Verify It\'s You'}
                        {step === 'reset' && 'New Password'}
                    </h2>

                    <p style={{ color: '#64748b' }}>
                        {step === 'email' && 'Enter your email to receive a reset code.'}
                        {step === 'otp' && `We sent a code to ${email}`}
                        {step === 'reset' && 'Create a strong password for your account.'}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                {successMessage && <div style={{ background: '#ecfdf5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{successMessage}</div>}

                {/* Step 1: Email Form */}
                {step === 'email' && (
                    <form onSubmit={handleSendOtp}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your registered email"
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 45px',
                                        border: '1px solid #e2e8f0', borderRadius: '10px',
                                        fontSize: '1rem', outline: 'none', transition: 'border 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#0284c7'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', background: '#1a1a1a', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Sending Code...' : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Form */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>Verification Code</label>
                            <div style={{ position: 'relative' }}>
                                <FaKey style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    placeholder="Enter 6-digit code"
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 45px',
                                        border: '1px solid #e2e8f0', borderRadius: '10px',
                                        fontSize: '1rem', outline: 'none', letterSpacing: '2px'
                                    }}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', background: '#1a1a1a', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Change Email
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Reset Form */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Min 8 chars, 1 uppercase"
                                style={{
                                    width: '100%', padding: '12px',
                                    border: '1px solid #e2e8f0', borderRadius: '10px',
                                    fontSize: '1rem', outline: 'none', marginBottom: '15px'
                                }}
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirm new password"
                                style={{
                                    width: '100%', padding: '12px',
                                    border: '1px solid #e2e8f0', borderRadius: '10px',
                                    fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', background: '#1a1a1a', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600',
                            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div style={{ marginTop: '25px', textAlign: 'center' }}>
                    <Link to="/login" style={{
                        color: '#64748b', textDecoration: 'none', fontSize: '0.9rem',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                    }}>
                        <FaChevronLeft size={12} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
